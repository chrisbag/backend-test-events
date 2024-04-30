import { Container } from '@neo9/n9-node-routing';
import { GoogleEventsClient } from './google-events.client';

export default async (): Promise<void> => {
	const googleEventsClient: GoogleEventsClient = Container.get(GoogleEventsClient);
	await googleEventsClient.initialiseWebhook();
};
