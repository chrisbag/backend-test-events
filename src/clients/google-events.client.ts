import { GoogleEvent } from '../services/events/events.types';
import got from 'got';
import { NormalizedOptions } from 'got/dist/source/core';

export const googleEventsPrefixUrl = 'http://127.0.0.1:3040';

const client = got.extend({
	prefixUrl: googleEventsPrefixUrl,
	timeout: 10_000,
	headers: {
		'api-key': '0cb3c20a-bf39-4241-b03f-cd329a484ecd',
	},
	hooks: {
		beforeRequest: [
			(options: NormalizedOptions) => {
				console.debug(`Calling ${options.method} ${options.url}`);
			},
		],
	},
});

export const createGoogleEvent = async (
	googleEvent: GoogleEvent,
): Promise<GoogleEvent | undefined> => {
	try {
		return await client
			.post(`events`, {
				json: googleEvent,
			})
			.json();
	} catch (e: any) {
		console.error(
			`Can't sync (create) event ${googleEvent.id} with Google Events. Error: ${e.message}`,
			e,
		);
		if (e.response) {
			console.info(`Response body : ${e.response.body}`);
			console.info(`Request body : `, googleEvent);
		}
	}
};

export const patchGoogleEvent = async (googleEvent: GoogleEvent) => {
	try {
		await client
			.patch(`events/${googleEvent.id}`, {
				json: googleEvent,
			})
			.json();
		return true;
	} catch (e: any) {
		console.error(
			`Can't sync (patch) event ${googleEvent.id} with Google Events. Error: ${e.message}`,
			e,
		);
		if (e.response) {
			console.info(`Response body : ${e.response.body}`);
			console.info(`Request body : `, googleEvent);
		}
		return false;
	}
};

export const deleteGoogleEvent = async (eventId: string | undefined) => {
	if (!eventId) return false;
	try {
		await client.delete(`events/${eventId}`).json();
		return true;
	} catch (e: any) {
		console.error(
			`Can't sync (delete) event ${eventId} with Google Events. Error: ${e.message}`,
			e,
		);
		if (e.response) {
			console.info(`Response body : ${e.response.body}`);
		}
		return false;
	}
};

export const initialiseWebhook = async () => {
	try {
		await client.post(`webhooks`, {
			json: {
				url: `http://127.0.0.1:3041/events/callback/google-events`,
			},
		});
	} catch (e) {
		console.error(`Webhook init error, please launch google events dummy API first`);
		throw e;
	}
};
