import { EventsRepository } from './events.repository';
import { Service, N9Error, N9Log } from '@neo9/n9-node-routing';
import {
	BunjiEventRequestCreate,
	BunjiEventRequestUpdate,
	BunjiEventEntity,
} from '../models/events.models';
import { v4 as uuidv4 } from 'uuid';
import { GoogleEventsService } from './google-events.service';
import { EventsWebhookData } from '../models/events-webhooks.models';

@Service()
export class EventsService {
	constructor(
		private readonly logger: N9Log,
		private readonly eventsRepository: EventsRepository,
		private readonly googleEventsService: GoogleEventsService,
	) {}

	public getEvents(page: number): {
		total: number;
		totalPages: number;
		events: BunjiEventEntity[];
	} {
		const total = this.eventsRepository.countEvents();
		return {
			total,
			totalPages: Math.ceil(total / this.eventsRepository.pageSize),
			events: this.eventsRepository.getEventsPage(page),
		};
	}

	public getEventById(eventId: string) {
		return this.eventsRepository.getEventByKey('id', eventId);
	}

	public async patchEventById(id: string, event: BunjiEventRequestUpdate, sync: boolean = true) {
		const existingEvent = this.getEventById(id);
		const newEvent = {
			...existingEvent,
			isDone: event.isDone || existingEvent.isDone,
			description: event.description || existingEvent.description,
			startAtDate: event.startAtDate || existingEvent.startAtDate,
			startAtTime: event.startAtTime || existingEvent.startAtTime,
			endAtDate: event.endAtDate || existingEvent.endAtDate,
			endAtTime: event.endAtTime || existingEvent.endAtTime,
			userId: event.userId || existingEvent.userId,
		};
		const updatedEvent = this.eventsRepository.updateEventById(id, newEvent);

		if (sync) {
			await this.syncEventPatchWithGoogle(updatedEvent, existingEvent);
		}

		return updatedEvent;
	}

	async updateEventFromGoogleEvent(
		googleEvent: EventsWebhookData,
		userId: number,
		existingBunjiEvent: BunjiEventEntity,
	) {
		await this.patchEventById(
			existingBunjiEvent.id,
			this.googleEventsService.mapGoogleEventToBunjiEvent(googleEvent, userId, existingBunjiEvent),
			false,
		);
	}

	public getEventByGoogleId(googleId: string | undefined, throwIfNotFound: boolean = true) {
		if (!googleId) return;
		return this.eventsRepository.getEventByKey('googleId', googleId, throwIfNotFound);
	}

	async createEvent(event: BunjiEventRequestCreate, sync: boolean = true) {
		const newEvent: BunjiEventEntity = {
			id: uuidv4(),
			isDone: false,
			description: null,
			...event,
		};
		this.eventsRepository.createEvent(newEvent);
		if (sync) {
			await this.syncEventCreationWithGoogle(newEvent);
		}
		return newEvent;
	}

	async createEventFromGoogleEvent(googleEvent: EventsWebhookData, userId: number) {
		await this.createEvent(
			this.googleEventsService.mapGoogleEventToBunjiEvent(googleEvent, userId),
			false,
		);
	}

	async deleteEventById(eventId: string, sync: boolean = true) {
		const eventToDelete = this.getEventById(eventId);
		const nbRemoved = this.eventsRepository.deleteMultipleByKey('id', eventId);
		if (nbRemoved > 0) {
			await this.syncEventDeleteWithGoogle(eventToDelete);
		}
	}

	async initialSync() {
		// idea: Replace simple for...of loop with promise-pool-executor, or bulk if possible to startup quicker
		for (const event of this.eventsRepository.getAllEventsNotSync()) {
			await this.syncEventCreationWithGoogle(event);
		}
	}

	private async syncEventCreationWithGoogle(newEvent: BunjiEventEntity) {
		const createdGoogleEvent = await this.googleEventsService.createGoogleEvent(newEvent);
		if (!createdGoogleEvent || !createdGoogleEvent.id) {
			// If sync fail we revert the action
			this.eventsRepository.deleteMultipleByKey('id', newEvent.id);
			throw new N9Error('sync-error', 500, { eventId: newEvent.id });
		}
		// We remove all events created by webhooks in the meantime
		this.eventsRepository.deleteMultipleByKey('googleId', createdGoogleEvent.id);
		this.eventsRepository.addGoogleIdToExistingEvent(newEvent.id, createdGoogleEvent.id);
		this.logger.debug(
			`Event ${newEvent.id} created in Google Events with ID ${createdGoogleEvent.id} there`,
		);
	}

	private async syncEventPatchWithGoogle(
		updatedEvent: BunjiEventEntity,
		previousEvent: BunjiEventEntity,
	) {
		if (!(await this.googleEventsService.patchGoogleEvent(updatedEvent))) {
			// If sync fail we revert the action
			this.eventsRepository.updateEventById(previousEvent.id, previousEvent);
			throw new N9Error('sync-error', 500, { eventId: previousEvent.id });
		}
		this.logger.debug(
			`Event ${updatedEvent.id} updated in Google Events with id ${updatedEvent.googleId} there`,
		);
	}

	private syncEventDeleteWithGoogle = async (eventToDelete: BunjiEventEntity) => {
		if (!(await this.googleEventsService.deleteGoogleEventByGoogleId(eventToDelete.googleId))) {
			// If sync fail we revert the action
			this.eventsRepository.createEvent(eventToDelete);
			throw new N9Error('sync-error', 500, { eventId: eventToDelete.id });
		}
		this.logger.debug(
			`Event ${eventToDelete.id} deleted in Google Events with id ${eventToDelete.googleId} there.`,
		);
	};
}

/*

export const syncEventCreationWithGoogle = async (newEvent: BunjiEvent) => {
	const createdGoogleEvent = await this.googleEventsClient.createGoogleEvent(
		GoogleEventsService.mapBunjiEventToGoogleEvent(newEvent),
	);
	if (!createdGoogleEvent || !createdGoogleEvent.id) {
		// If sync fail we revert the action
		deleteEventById(newEvent.id);
		throw new Error('Sync error');
	}
	// We remove all events created by webhooks in the meantime
	deleteAllEventsByGoogleId(createdGoogleEvent.id);
	addGoogleIdToExistingEvent(newEvent.id, createdGoogleEvent.id);
	console.debug(
		`Event ${newEvent.id} created in Google Events with ID ${createdGoogleEvent.id} there`,
	);
};

export const initialSync = async () => {
	// idea: Replace simple for...of loop with promise-pool-executor, or bulk if possible to startup quicker
	for (const event of events) {
		await syncEventCreationWithGoogle(event);
	}
};
*/
