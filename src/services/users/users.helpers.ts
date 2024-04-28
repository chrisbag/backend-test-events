import { users } from './users.controller';

const extractTimeRegExp = /T(?<time>([0-9]{2}:[0-9]{2})):/;

export function getDatePartFromDate(inputDateAsISOString: string) {
	let date = new Date(inputDateAsISOString);
	// Handle time-offset
	const offset = date.getTimezoneOffset();
	date = new Date(date.getTime() - offset * 60 * 1_000);
	return date.toISOString().split('T')[0];
}

export function getTimePartFromDate(inputDateAsISOString: string) {
	let date = new Date(inputDateAsISOString);
	return date.toISOString().match(extractTimeRegExp)?.groups?.time as string; // Loose time-offset
}

export const isExistingUserId = (userId: number) => {
	const user = users.find((user) => user.id === userId);
	return user ? true : false;
};
