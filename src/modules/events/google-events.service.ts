import { v4 as uuidv4 } from 'uuid';
import { BunjiEventEntity } from '../models/events.models';
import { GoogleEventsClient } from '../clients/google-events.client';
import { UsersService } from '../users/users.service';
import { GoogleEvent } from '../models/events-webhooks.models';
import { Service } from '@neo9/n9-node-routing';

@Service()
export class GoogleEventsService {
	private readonly extractTimeRegExp = /T(?<time>([0-9]{2}:[0-9]{2})):/;
	constructor(
		private readonly googleEventsClient: GoogleEventsClient,
		private readonly usersService: UsersService,
	) {}

	async createGoogleEvent(newEvent: BunjiEventEntity) {
		return await this.googleEventsClient.createGoogleEvent(
			this.mapBunjiEventToGoogleEvent(newEvent),
		);
	}

	mapBunjiEventToGoogleEvent(bunjiEvent: BunjiEventEntity): GoogleEvent {
		let ownerId = this.usersService.getUserById(bunjiEvent.userId)?.googleId;
		if (!ownerId) {
			throw new Error(`User not found with id ${bunjiEvent.userId} or ownerId is missing`);
		}

		return {
			id: bunjiEvent.googleId,
			startAt: `${bunjiEvent.startAtDate}T${bunjiEvent.startAtTime}:00Z`, // Create events at GTM+0 by default
			endAt: `${bunjiEvent.endAtDate}T${bunjiEvent.endAtTime}:00Z`, // Create events at GTM+0 by default
			description: bunjiEvent.description,
			ownerId,
		};
	}

	mapGoogleEventToBunjiEvent(
		googleEvent: GoogleEvent,
		userId: number,
		existingBunjiEvent?: BunjiEventEntity,
	) {
		const startAtDate = this.getDatePartFromDate(googleEvent.startAt);
		const startAtTime = this.getTimePartFromDate(googleEvent.startAt);
		const endAtDate = this.getDatePartFromDate(googleEvent.endAt);
		const endAtTime = this.getTimePartFromDate(googleEvent.endAt);
		const event: BunjiEventEntity = {
			id: existingBunjiEvent?.id || uuidv4(),
			googleId: googleEvent.id,
			description: googleEvent.description || existingBunjiEvent?.description || null,
			isDone: existingBunjiEvent?.isDone ?? false,
			userId,
			startAtDate,
			startAtTime,
			endAtDate,
			endAtTime,
		};
		return event;
	}

	private getDatePartFromDate(inputDateAsISOString: string) {
		let date = new Date(inputDateAsISOString);
		// Handle time-offset
		const offset = date.getTimezoneOffset();
		date = new Date(date.getTime() - offset * 60 * 1_000);
		return date.toISOString().split('T')[0];
	}

	private getTimePartFromDate(inputDateAsISOString: string) {
		let date = new Date(inputDateAsISOString);
		return date.toISOString().match(this.extractTimeRegExp)?.groups?.time as string; // Loose time-offset
	}

	async patchGoogleEvent(updatedEvent: BunjiEventEntity) {
		return await this.googleEventsClient.patchGoogleEvent(
			this.mapBunjiEventToGoogleEvent(updatedEvent),
		);
	}

	async deleteGoogleEventByGoogleId(googleId: string) {
		return await this.googleEventsClient.deleteGoogleEvent(googleId);
	}
}
