import { GoogleEvent, BunjiEvent } from './types';
import * as UsersService from '../users/service';
import * as Helpers from '../users/helpers';
import { v4 as uuidv4 } from 'uuid';

export const mapBunjiEventToGoogleEvent = (bunjiEvent: BunjiEvent): GoogleEvent => {
	let ownerId = UsersService.getUserById(bunjiEvent.userId)?.googleId;
	if(!ownerId) {
		throw new Error(`User not found with id ${bunjiEvent.userId} or ownerId is missing`);
	}

	return {
		id: bunjiEvent.googleId,
		startAt: `${bunjiEvent.startAtDate}T${bunjiEvent.startAtTime}:00Z`, // Create events at GTM+0 by default
		endAt: `${bunjiEvent.endAtDate}T${bunjiEvent.endAtTime}:00Z`,// Create events at GTM+0 by default
		description: bunjiEvent.description,
		ownerId
	}
}

export function mapGoogleEventToBunjiEvent(googleEvent: GoogleEvent, userId: number, existingBunjiEvent?: BunjiEvent) {
	const startAtDate = Helpers.getDatePartFromDate(googleEvent.startAt);
	const startAtTime = Helpers.getTimePartFromDate(googleEvent.startAt);
	const endAtDate = Helpers.getDatePartFromDate(googleEvent.endAt);
	const endAtTime = Helpers.getTimePartFromDate(googleEvent.endAt);
	const event: BunjiEvent = {
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
