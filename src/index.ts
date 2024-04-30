import { Container, N9Log, safeStringify } from '@neo9/n9-node-routing';

import { start } from './start';

start()
	.then(() => {
		Container.get(N9Log).info('Startup successful');
	})
	.catch((e) => {
		(Container.has(N9Log) ? Container.get(N9Log) : console).error(`Error on launch : `, {
			errString: safeStringify(e),
		});
		throw e;
	});
