import { defaultEvents } from './data';
import { BunjiEvent } from './types';
import * as GoogleEventsClient from '../../clients/google-events.client';
import * as GoogleEventsService from './google-events.service';
import { createGoogleEvent } from '../../clients/google-events.client';


// In-memory storage for events
let events = defaultEvents;

export function addGoogleIdToExistingEvent(eventId: string, googleId: string | undefined) {
	const event = getEventById(eventId);
	if (!event) {
		throw new Error(`Event ${eventId} not found`);
	}
	event.googleId = googleId;
}

export const updateEvent = (updatedEvent: BunjiEvent) => {
	const eventId = updatedEvent.id;
	const index = events.findIndex((event) => event.id === eventId);
	if (index !== -1) {
		events[index] = updatedEvent;
	} else {
		throw new Error(`Event ${eventId} not found`);
	}
};

export function getEventByGoogleId(googleId: string | undefined) {
	if (!googleId) return;
	return events.find((event) => event.googleId === googleId);
}

export const getEventById = (eventId: string) => {
	return events.find((event) => event.id === eventId);
};

export const getAllEvents = () => {
	return events;
};

export const createEvent = (newEvent: BunjiEvent) => {
	events.push(newEvent);
};

export const deleteEventById = (eventId: string) => {
	events = events.filter((event) => event.id !== eventId);
};

export const deleteAllEventsByGoogleId = (eventGoogleId: string) => {
	events = events.filter((event) => event.googleId !== eventGoogleId);
};

export const syncEventCreationWithGoogle = async (newEvent: BunjiEvent) => {
	const createdGoogleEvent = await GoogleEventsClient.createGoogleEvent(GoogleEventsService.mapBunjiEventToGoogleEvent(newEvent));
	if (!createdGoogleEvent || !createdGoogleEvent.id) {
		// If sync fail we revert the action
		deleteEventById(newEvent.id);
		throw new Error('Sync error');
	}
	// We remove all events created by webhooks in the meantime
	deleteAllEventsByGoogleId(createdGoogleEvent.id);
	addGoogleIdToExistingEvent(newEvent.id, createdGoogleEvent.id);
	console.debug(`Event ${newEvent.id} created in Google Events with ID ${createdGoogleEvent.id} there`);
};

export const syncEventPatchWithGoogle = async (updatedEvent: BunjiEvent, previousEvent: BunjiEvent) => {
	if (!await GoogleEventsClient.patchGoogleEvent(GoogleEventsService.mapBunjiEventToGoogleEvent(updatedEvent))) {
		// If sync fail we revert the action
		updateEvent(previousEvent);
		throw new Error('Sync error');
	}
	console.debug(`Event ${updatedEvent.id} updated in Google Events.`);
};

export const syncEventDeleteWithGoogle = async (eventToDelete: BunjiEvent) => {
	if (!await GoogleEventsClient.deleteGoogleEvent(eventToDelete.googleId)) {
		// If sync fail we revert the action
		createEvent(eventToDelete);
		throw new Error(`Sync error`);
	}
	console.debug(`Event ${eventToDelete.id} deleted in Google Events with id ${eventToDelete.googleId} there.`);
};

export const initialSync = async () => {
	// idea: Replace simple for...of loop with promise-pool-executor, or bulk if possible to startup quicker
	for (const event of events) {
		await syncEventCreationWithGoogle(event);
	}
};
