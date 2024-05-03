import { Service, N9Error } from '@neo9/n9-node-routing';
import { defaultEvents } from './events.data';
import { BunjiEventEntity, BunjiEventRequestCreate } from '../models/events.models';

@Service()
export class EventsRepository {
	private events: BunjiEventEntity[] = defaultEvents;
	private readonly _pageSize = 10;

	get pageSize(): number {
		return this._pageSize;
	}

	public getEventByKey(
		key: keyof BunjiEventEntity,
		keyValue: string,
		throwIfNotFound: boolean = true,
	): BunjiEventEntity {
		const event = this.events.find((event) => event[key] === keyValue);
		if (!event && throwIfNotFound) {
			throw new N9Error('event-not-found', 404, { key, eventId: keyValue });
		}
		return event;
	}

	public updateEventById(eventId: string, updatedEvent: BunjiEventEntity) {
		const index = this.events.findIndex((event) => event.id === eventId);
		if (index !== -1) {
			this.events[index] = updatedEvent;
		} else {
			throw new N9Error('event-not-found', 404, { eventId });
		}
		return this.events[index];
	}

	countEvents() {
		return this.events.length;
	}

	getEventsPage(page: number) {
		const startIndex = (page - 1) * this._pageSize;
		const endIndex = page * this._pageSize;
		return this.events.slice(startIndex, endIndex);
	}

	createEvent(newEvent: BunjiEventEntity) {
		this.events.push(newEvent);
		return newEvent;
	}

	/**
	 * @return Number of events deleted
	 */
	deleteMultipleByKey(key: keyof BunjiEventEntity, value: string): number {
		let indexToRemove: number;
		let nbRemoved = 0;
		do {
			indexToRemove = this.events.findIndex((event) => event[key] === value);
			if (indexToRemove !== -1) {
				this.events.splice(indexToRemove, 1);
				nbRemoved++;
			}
		} while (indexToRemove !== -1);
		return nbRemoved;
	}

	getAllEventsNotSync() {
		return this.events.filter((event) => !event.googleId);
	}

	addGoogleIdToExistingEvent(id: string, googleId: string) {
		const event = this.getEventByKey('id', id);
		event.googleId = googleId;
	}
}
