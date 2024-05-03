import { Server } from 'node:http';

import NodeRouting from '@neo9/n9-node-routing';
import { PartialDeep } from 'type-fest';

import { Configuration } from './conf/models/configuration.models';

export async function start(
	confOverride: PartialDeep<Configuration> = {},
): Promise<{ server: Server; conf: Configuration }> {
	const { server, conf } = await NodeRouting<Configuration>({
		conf: {
			n9NodeConf: {
				override: {
					value: confOverride,
				},
			},
			validation: {
				isEnabled: true,
				classType: Configuration,
			},
		},
		firstSequentialInitFileNames: ['events'],
	});

	return { server, conf };
}
