import { Express } from 'express';
import { getUsers } from './users.controller';

export default (app: Express) => {
	app.get('/users', getUsers);
};
