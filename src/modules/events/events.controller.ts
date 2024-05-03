import {
	JsonController,
	Get,
	QueryParam,
	Post,
	Body,
	N9Error,
	Param,
	Patch,
	Delete,
	N9Log,
	HttpCode,
	OnUndefined,
} from '@neo9/n9-node-routing';
import { EventsService } from './events.service';
import { BunjiEventRequestCreate, BunjiEventRequestUpdate } from '../models/events.models';
import { UsersService } from '../users/users.service';
import { EventsWebhookBody, EventsWebhookAction } from '../models/events-webhooks.models';

@JsonController('/events')
export class EventsController {
	constructor(
		private readonly logger: N9Log,
		private readonly eventsService: EventsService,
		private readonly usersService: UsersService,
	) {}

	@Get('')
	getEvents(@QueryParam('page') page: number = 1) {
		const { total, totalPages, events } = this.eventsService.getEvents(page);

		return {
			total,
			totalPages,
			currentPage: page,
			data: events,
		};
	}

	@Get('/:id')
	getEvent(@Param('id') id: string) {
		return this.eventsService.getEventById(id);
	}

	@Post('')
	@HttpCode(201)
	createEvent(@Body() event: BunjiEventRequestCreate) {
		if (!this.usersService.isExistingUserId(event.userId)) {
			throw new N9Error('user-not-found', 400);
		}
		return this.eventsService.createEvent(event);
	}

	@Patch('/:id')
	async patchEvent(@Param('id') id: string, @Body() event: BunjiEventRequestUpdate) {
		if (event.userId && !this.usersService.isExistingUserId(event.userId)) {
			throw new N9Error('user-not-found', 400);
		}
		return await this.eventsService.patchEventById(id, event);
	}

	@Delete('/:id')
	async deleteEvent(@Param('id') id: string) {
		return await this.eventsService.deleteEventById(id);
	}

	@Post('/callback/:callerId')
	async handleCallback(
		@Param('callerId') callerId: string,
		@Body() callBackBody: EventsWebhookBody,
	) {
		if (callerId !== 'google-events') {
			throw new N9Error('caller-not-supported', 501, {
				callerId,
				details: 'Only Google Events callback are handled for now',
			});
		}

		const eventUser = this.usersService.getUserByGoogleId(callBackBody.data.ownerId);
		if (!eventUser) {
			const errorMessage = `No user found for Google OwnerId ${callBackBody.data.ownerId}. Event ID : ${callBackBody.data.id}`;
			this.logger.error(errorMessage);
			throw new N9Error('owner-not-found', 404, { details: errorMessage });
		}
		const googleEvent = callBackBody.data;
		const existingBunjiEvent = this.eventsService.getEventByGoogleId(googleEvent.id, false);
		if (callBackBody.action === EventsWebhookAction.CREATE && existingBunjiEvent) {
			const errorMessage = `Event already exists with Google ID ${googleEvent.id}, found event with ID ${existingBunjiEvent.id}`;
			this.logger.error(errorMessage);
			throw new N9Error('event-already-exists', 409, { details: errorMessage });
		}
		if (
			[EventsWebhookAction.PATCH, EventsWebhookAction.DELETE].includes(callBackBody.action) &&
			!existingBunjiEvent
		) {
			const errorMessage = `No event found with Google ID ${googleEvent.id}`;
			this.logger.error(errorMessage);
			throw new N9Error('event-not-found', 404, { googleEventId: googleEvent.id });
		}

		this.logger.info(
			`Treating callback to ${callBackBody.action} event ${googleEvent.id} (Google ID). User ${eventUser.id} (${eventUser.firstName}).`,
		);

		if (callBackBody.action === EventsWebhookAction.DELETE) {
			if (existingBunjiEvent) {
				await this.eventsService.deleteEventById(existingBunjiEvent.id, false);
			}
		}

		switch (callBackBody.action) {
			case EventsWebhookAction.CREATE:
				await this.eventsService.createEventFromGoogleEvent(googleEvent, eventUser.id);
				break;
			case EventsWebhookAction.PATCH:
				await this.eventsService.updateEventFromGoogleEvent(
					googleEvent,
					eventUser.id,
					existingBunjiEvent,
				);
				break;
		}
	}
}
