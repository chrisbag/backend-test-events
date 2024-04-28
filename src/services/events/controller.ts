import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { BunjiEvent, GoogleEvent, WebhookAction } from './types';
import { createEventSchema, patchEventSchema, callbackCallSchema } from './validation';
import * as Helpers from '../users/helpers';
import * as UsersService from '../users/service';
import * as Service from './service';
import * as GoogleEventsService from './google-events.service';

export const createEvent = async (req: Request, res: Response) => {
	try {
		await createEventSchema.validate(req.body, {
			stripUnknown: false,
			abortEarly: false,
		});
	} catch (error: any) {
		return res
				.status(400)
				.json({ error: error.message, details: error.errors });
	}

	const {
		description,
		isDone,
		startAtDate,
		startAtTime,
		endAtDate,
		endAtTime,
		userId,
	} = req.body;

	if (!Helpers.isExistingUserId(userId)) {
		return res.status(400).json({ error: 'User not found' });
	}

	const newEvent: BunjiEvent = {
		id: uuidv4(),
		isDone,
		description: description || null,
		startAtDate,
		startAtTime,
		endAtDate,
		endAtTime,
		userId,
	};

	Service.createEvent(newEvent);
	try {
		await Service.syncEventCreationWithGoogle(newEvent);
	} catch (e: any) {
		res.status(500).json({ error: e.message});
	}

	res.status(201).json(newEvent);
};

export const getEvents = (req: Request, res: Response) => {
	const page = parseInt(req.query.page as string) || 1; // Default to page 1 if page query parameter is not provided
	const limit = 10;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;

	const allEvents = Service.getAllEvents();
	const results = allEvents.slice(startIndex, endIndex);

	res.json({
		total: allEvents.length,
		totalPages: Math.ceil(allEvents.length / limit),
		currentPage: page,
		data: results,
	});
};

export const getEvent = async (req: Request, res: Response) => {
	const eventId = req.params.id;
	const event = Service.getEventById(eventId);
	if (event) {
		res.json(event);
	} else {
		res.status(404).json({ error: 'Event not found' });
	}
};

export const patchEvent = async (req: Request, res: Response) => {
	const eventId = req.params.id;

	try {
		await patchEventSchema.validate(req.body, {
			stripUnknown: false,
			abortEarly: false,
		});
	} catch (error: any) {
		console.log(error);

		return res
				.status(400)
				.json({ error: error.message, details: error.errors });
	}

	const {
		description,
		isDone,
		startAtDate,
		startAtTime,
		endAtDate,
		endAtDateTime,
		userId,
	} = req.body;

	if (userId && !Helpers.isExistingUserId(userId)) {
		return res.status(400).json({ error: 'User not found' });
	}

	const existingEvent = Service.getEventById(eventId);

	if (existingEvent) {
		// Update fields
		const updatedEvent = {
			...existingEvent,
			isDone: isDone || existingEvent.isDone,
			description: description || existingEvent.description,
			startAtDate: startAtDate || existingEvent.startAtDate,
			startAtTime: startAtTime || existingEvent.startAtTime,
			endAtDate: endAtDate || existingEvent.endAtDate,
			endAtTime: endAtDateTime || existingEvent.endAtTime,
			userId: userId || existingEvent.userId,
		};

		Service.updateEvent(updatedEvent);
		try {
			await Service.syncEventPatchWithGoogle(updatedEvent, existingEvent);
		} catch (e: any) {
			res.status(500).json({ error: e.message});
		}

		return res.json(updatedEvent);
	} else {
		return res.status(404).json({ error: 'Event not found' });
	}
};

export const deleteEvent = async (req: Request, res: Response) => {
	const eventId = req.params.id;

	// should return a 404 status if event is not found
	const eventToDelete = Service.getEventById(eventId);
	if (!eventToDelete) {
		res.status(404).json({ error: 'Event not found' });
		return;
	}

	Service.deleteEventById(eventId);
	try {
		await Service.syncEventDeleteWithGoogle(eventToDelete);
	} catch (e: any) {
		res.status(500).json({ error: e.message});
	}
	res.sendStatus(204);
};

export const handleCallback = async (req: Request, res: Response) => {
	const callerId = req.params.callerId;

	if (callerId !== 'google-events') {
		return res.status(501).json({ error: 'Only Google Events callback are handled for now' });
	}

	try {
		await callbackCallSchema.validate(req.body, {
			stripUnknown: false,
			abortEarly: false,
		});
	} catch (error: any) {
		console.log(error);
		return res
				.status(400)
				.json({ error: error.message, details: error.errors });
	}

	const action: WebhookAction = req.body.action;
	const googleEvent: GoogleEvent = req.body.data;

	const eventUser = UsersService.getUserByGoogleId(googleEvent.ownerId);
	if (!eventUser) {
		const error = `No user found for Google OwnerId ${googleEvent.ownerId}. Event ID : ${googleEvent.id}`;
		console.error(error);
		return res.status(404).json({ error });
	}

	const existingBunjiEvent = Service.getEventByGoogleId(googleEvent.id);
	if (action === WebhookAction.CREATE && existingBunjiEvent) {
		const error = `Event already exists with Google ID ${googleEvent.id}, found event with ID ${existingBunjiEvent.id}`;
		console.error(error);
		return res.status(409).json({ error });
	}

	if ([WebhookAction.PATCH, WebhookAction.DELETE].includes(action) && !existingBunjiEvent) {
		const error = `No event found with Google ID ${googleEvent.id}`;
		console.error(error);
		return res.status(404).json({ error });
	}

	console.info(`Treating callback to ${action} event ${googleEvent.id} (Google ID). User ${eventUser.id} (${eventUser.firstName}).`);

	if (action === WebhookAction.DELETE) {
		if (existingBunjiEvent) {
			Service.deleteEventById(existingBunjiEvent.id);
		}
		return res.sendStatus(200);
	}
	const event = GoogleEventsService.mapGoogleEventToBunjiEvent(googleEvent, eventUser.id, existingBunjiEvent);

	switch (action) {
		case WebhookAction.CREATE:
			Service.createEvent(event);
			break;
		case WebhookAction.PATCH:
			console.log(event)
			Service.updateEvent(event);
			break;

	}

	res.sendStatus(200);
};
