import { Service } from '@neo9/n9-node-routing';
import { defaultUsers } from './users.data';
import { UserEntity } from '../models/users.models';

@Service()
export class UsersService {
	private readonly users = defaultUsers;

	isExistingUserId(userId: number): boolean {
		return !!this.users.find((user) => user.id === userId);
	}

	getAllUsers(): UserEntity[] {
		return this.users;
	}

	getUserById(userId: number): UserEntity {
		return this.users.find((user) => user.id === userId);
	}

	getUserByGoogleId(googleId: number): UserEntity {
		return this.users.find((user) => user.googleId === googleId);
	}
}
