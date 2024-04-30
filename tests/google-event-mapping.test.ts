import { describe, expect, test, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { Server } from 'http';
import conf from '../src/conf/application';
import { v4 as uuidv4 } from 'uuid';
import { start } from '../src/start';
import nock = require('nock');
import { Container } from '@neo9/n9-node-routing';
import { GoogleEventsService } from '../src/modules/events/google-events.service';
import { GoogleEvent } from '../src/modules/models/events-webhooks.models';
import { BunjiEventEntity } from '../src/modules/models/events.models';

describe('Date and data mapping', () => {
	const context: Partial<{
		server: Server;
		googleEvent: GoogleEvent;
		googleEventsService: GoogleEventsService;
		bunjiEventSource: BunjiEventEntity;
		userId: number;
		bunjiEventFromGoogleEvent: BunjiEventEntity;
	}> = {};

	beforeAll(async () => {
		nock(conf.googleEvents.baseUrl)
			.post('/events')
			.reply(200, () => ({ id: `FAKE-GOOGLE-EVENT-ID-${uuidv4()}` }))
			.persist();
		nock(conf.googleEvents.baseUrl).post('/webhooks').reply(200).persist();
		context.server = (
			await start({
				n9NodeRoutingOptions: {
					prometheus: {
						isEnabled: false,
					},
				},
			})
		).server;
	});

	afterAll(async () => {
		context.server?.closeAllConnections();
		context.server?.close();
	});

	test('Check date mapping from BunjiEvent', () => {
		context.googleEventsService = Container.get(GoogleEventsService);
		context.userId = 1;
		context.bunjiEventSource = {
			id: '1',
			userId: context.userId,
			description: 'An simple event',
			isDone: false,
			startAtDate: '2024-05-01',
			startAtTime: '14:00',
			endAtDate: '2024-05-01',
			endAtTime: '16:00',
		};
		context.googleEvent = context.googleEventsService.mapBunjiEventToGoogleEvent(
			structuredClone(context.bunjiEventSource),
		);

		expect(context.googleEvent).toHaveProperty('startAt', '2024-05-01T14:00:00Z');
		expect(context.googleEvent).toHaveProperty('endAt', '2024-05-01T16:00:00Z');
	});

	test('Check double transformation give same result', () => {
		context.bunjiEventFromGoogleEvent = context.googleEventsService.mapGoogleEventToBunjiEvent(
			context.googleEvent,
			context.userId,
			structuredClone(context.bunjiEventSource),
		);

		expect(context.bunjiEventFromGoogleEvent).toEqual(context.bunjiEventSource);
	});

	test('Check double transformation give same result', () => {
		const googleEvent2 = context.googleEventsService.mapBunjiEventToGoogleEvent(
			context.bunjiEventFromGoogleEvent,
		);
		expect(googleEvent2).toEqual(context.googleEvent);
	});
});
