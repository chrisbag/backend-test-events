import { PartialDeep } from 'type-fest';

import { Configuration } from './models/configuration.models';

const conf: PartialDeep<Configuration> = {
	n9NodeRoutingOptions: {
		logOptions: {
			level: 'debug',
		},
		http: {
			port: 6666,
		},
	},
};

export default conf;
