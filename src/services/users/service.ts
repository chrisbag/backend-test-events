import { users } from './controller';

export function getUserById(userId: number) {
	return users.find((user) => user.id === userId);
}

export const getUserByGoogleId = (googleId: number) => {
	return users.find((user) => user.googleId === googleId);
};
