import express from 'express';

import services from './services';
import { initialiseWebhook } from './clients/google-events.client';
import { initialSync } from './services/events/service';

const app = express();
const PORT = 3041;

// Middleware
app.use(express.json());

// Configures services
services(app);

(async () => {
	await initialSync();
	await initialiseWebhook();
	console.log(`Webhook setup done`);
})()
		.then(() => {
			// Start the server
			app.listen(PORT, () => {
				console.log(`Server is running on port ${PORT}`);
			});
		})
		.catch((error) => {
			console.log(`Startup failed`);
			process.exit(1);
		});
