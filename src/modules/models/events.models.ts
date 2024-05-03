import {
	IsString,
	IsOptional,
	IsNumber,
	IsNotEmpty,
	IsInt,
	Exclude,
	Expose,
	IS_BOOLEAN,
	IsBoolean,
} from '@neo9/n9-node-routing';
import { isDateOnly } from '../validators/is-dateonly.validator';
import { isTimeOnly } from '../validators/is-timeonly.validator';

export class BunjiEventEntity {
	id: string;
	isDone: boolean;
	description: string | null;
	startAtDate: string;
	startAtTime: string;
	endAtDate: string;
	endAtTime: string;
	userId: number;
	googleId?: string;
}

@Exclude()
export class BunjiEventRequestCreate {
	@IsString()
	@IsOptional()
	@Expose()
	description?: string;

	@IsString()
	@IsNotEmpty()
	@isDateOnly()
	@Expose()
	startAtDate: string;

	@IsString()
	@IsNotEmpty()
	@isTimeOnly()
	@Expose()
	startAtTime: string;

	@IsString()
	@IsNotEmpty()
	@isDateOnly()
	@Expose()
	endAtDate: string;

	@IsString()
	@IsNotEmpty()
	@isTimeOnly()
	@Expose()
	endAtTime: string;

	@IsNumber()
	@IsInt()
	@Expose()
	userId: number;
}

export class BunjiEventRequestUpdate extends BunjiEventRequestCreate {
	@IsBoolean()
	isDone: boolean;
}
