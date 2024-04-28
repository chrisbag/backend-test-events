import { Request, Response } from 'express';
import { defaultUsers } from './users.data';

export let users = defaultUsers;

export const getUsers = (req: Request, res: Response) => {
	res.json({
		total: users.length,
		data: users,
	});
};
