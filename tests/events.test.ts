import { beforeEach, describe, expect, test, afterEach } from '@jest/globals';
import { googleEventsPrefixUrl } from '../src/clients/google-events.client';
import nock from 'nock';
import { start } from '../src';
import got from 'got';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'http';
import { BunjiEvent } from '../src/services/events/events.types';

const clientHttpToTestEventsApi = got.extend({
	prefixUrl: 'http://localhost:3041',
});

const context: Partial<{
	server: Server;
}> = {};

beforeEach(async () => {
	nock(googleEventsPrefixUrl)
		.post('/events')
		.reply(200, () => ({ id: `FAKE-GOOGLE-EVENT-ID-${uuidv4()}` }))
		.persist();
	nock(googleEventsPrefixUrl).post('/webhooks').reply(200).persist();
	context.server = (await start()).server;
});

afterEach(async () => {
	context.server?.closeAllConnections();
	context.server?.close();
});

describe('Should be able to list base events', () => {
	test('Events page 1 should not be empty', async () => {
		const events = await clientHttpToTestEventsApi.get('events').json();
		expect(events).toHaveProperty('total', 6);
	});

	test('Check event creation', async () => {
		const events = await clientHttpToTestEventsApi.get('events').json();
		expect(events).toHaveProperty('total', 6);

		const eventToCreate = {
			isDone: false,
			description: 'Stand-up Daily Meeting',
			startAtDate: '2024-05-22',
			startAtTime: '09:00',
			endAtDate: '2024-05-22',
			endAtTime: '10:00',
			userId: 1,
		};
		const createdEvent: BunjiEvent = await clientHttpToTestEventsApi
			.post('events', {
				json: eventToCreate,
			})
			.json();
		const { id, googleId, ...dataChecked } = createdEvent;
		expect(dataChecked).toEqual(eventToCreate);
		expect(createdEvent).toHaveProperty('id');
		expect(createdEvent).toHaveProperty('googleId');
	});
});
