import { Container } from '@neo9/n9-node-routing';
import { EventsService } from './events.service';

export default async (): Promise<void> => {
	const eventsService: EventsService = Container.get(EventsService);
	await eventsService.initialSync();
};
