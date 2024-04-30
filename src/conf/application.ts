import { Configuration } from './models/configuration.models';

const conf: Configuration = {
	n9NodeRoutingOptions: {
		http: {
			port: process.env.PORT || 3041,
		},
	},
	googleEvents: {
		baseUrl: 'http://127.0.0.1:3040',
		apiKey: '0cb3c20a-bf39-4241-b03f-cd329a484ecd', // TODO : replace with process.env.GOOGLE_EVENTS_API_KEY
		callbackUrl: `http://127.0.0.1:3041/events/callback/google-events`
	},
};

export default conf;
