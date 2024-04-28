import { users } from './controller';

export function getDatePartFromDate(inputDateAsISOString: string) {
	let date = new Date(inputDateAsISOString);
	// Handle time-offset
	const offset = date.getTimezoneOffset();
	date = new Date(date.getTime() - (offset * 60 * 1_000));
	return date.toISOString().split('T')[0];
}

export function getTimePartFromDate(inputDateAsISOString: string) {
	let date = new Date(inputDateAsISOString);
	return date.toTimeString().split(' ')[0]; // Loose time-offset
}

export const isExistingUserId = (userId: number) => {
	const user = users.find((user) => user.id === userId);
	return user ? true : false;
};
