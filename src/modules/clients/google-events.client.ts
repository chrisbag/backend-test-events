import { NormalizedOptions } from 'got/dist/source/core';
import { Configuration } from '../../conf/models/configuration.models';
import { N9HttpClient, N9Log, Service } from '@neo9/n9-node-routing';
import { GoogleEvent } from '../models/events-webhooks.models';

@Service()
export class GoogleEventsClient {
	private httpClient: N9HttpClient;

	constructor(
		private readonly logger: N9Log,
		private readonly conf: Configuration,
	) {
		this.httpClient = new N9HttpClient(this.logger, {
			gotOptions: {
				headers: {
					'api-key': this.conf.googleEvents.apiKey,
				},
				prefixUrl: this.conf.googleEvents.baseUrl,
				hooks: {
					beforeRequest: [
						(options: NormalizedOptions) => {
							logger.debug(`Calling ${options.method} ${options.url}`);
						},
					],
				},
			},
			sensitiveHeadersOptions: {
				sensitiveHeaders: ['api-key'],
			},
		});
	}

	async createGoogleEvent(googleEvent: GoogleEvent): Promise<GoogleEvent | undefined> {
		try {
			return await this.httpClient.post<GoogleEvent>(`events`, googleEvent);
		} catch (e: any) {
			this.logger.error(
				`Can't sync (create) event ${googleEvent.id} with Google Events. Error: ${e.message}`,
				e,
			);
			if (e.response) {
				this.logger.info(`Response body : ${e.response.body}`);
				this.logger.info(`Request body : `, googleEvent);
			}
		}
	}

	async patchGoogleEvent(googleEvent: GoogleEvent) {
		try {
			await this.httpClient.patch(`events/${googleEvent.id}`, googleEvent);
			return true;
		} catch (e: any) {
			this.logger.error(
				`Can't sync (patch) event ${googleEvent.id} with Google Events. Error: ${e.message}`,
				e,
			);
			if (e.response) {
				this.logger.info(`Response body : ${e.response.body}`);
				this.logger.info(`Request body : `, googleEvent);
			}
			return false;
		}
	}

	async deleteGoogleEvent(eventId: string | undefined) {
		if (!eventId) return false;
		try {
			await this.httpClient.delete(`events/${eventId}`);
			return true;
		} catch (e: any) {
			this.logger.error(
				`Can't sync (delete) event ${eventId} with Google Events. Error: ${e.message}`,
				e,
			);
			if (e.response) {
				this.logger.info(`Response body : ${e.response.body}`);
			}
			return false;
		}
	}

	async initialiseWebhook() {
		try {
			await this.httpClient.post(`webhooks`, {
				url: this.conf.googleEvents.callbackUrl,
			});
		} catch (e) {
			this.logger.error(`Webhook init error, please launch google events dummy API first`);
			throw e;
		}
	}
}
