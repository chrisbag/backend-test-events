import express from 'express';

import services from './services';
import { initialiseWebhook } from './clients/google-events.client';
import { initialSync } from './services/events/events.service';

export async function start() {
	const app = express();
	const PORT = 3041;

	// Middleware
	app.use(express.json());

	// Configures services
	services(app);

	await initialSync();
	await initialiseWebhook();
	console.log(`Webhook setup done`);
	// Start the server
	const server = app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
	return { server };
}

if (process.env.NODE_ENV !== 'test') {
	start()
		.then(() => {
			console.log(`Startup successful`);
		})
		.catch((error) => {
			console.log(`Startup failed`, error);
			process.exit(1);
		});
}
