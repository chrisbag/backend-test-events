import { JsonController, Get } from '@neo9/n9-node-routing';
import { UsersService } from './users.service';

@JsonController('/users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('')
	public getUsers() {
		const users = this.usersService.getAllUsers();
		return {
			total: users.length,
			data: users,
		};
	}
}
