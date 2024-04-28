import { Express } from 'express';

import events from './events/routes';
import users from './users/users.routes';

export default (app: Express) => {
	events(app);
	users(app);
};
