import {
	IsString,
	IsOptional,
	IsNotEmpty,
	IsISO8601,
	IsInt,
	IsEnum,
	ValidateNested,
	Exclude,
	Expose,
	Type,
} from '@neo9/n9-node-routing';

export enum EventsWebhookAction {
	CREATE = 'create',
	PATCH = 'patch',
	DELETE = 'delete',
}

@Exclude()
export class EventsWebhookData {
	@IsString()
	@IsNotEmpty()
	@Expose()
	id: string;

	@IsString()
	@IsOptional()
	@Expose()
	description: string | null;

	@IsISO8601()
	@Expose()
	startAt: string;

	@IsISO8601()
	@Expose()
	endAt: string;

	@IsInt()
	@Expose()
	ownerId: number;
}

@Exclude()
export class EventsWebhookBody {
	@IsEnum(EventsWebhookAction)
	@Expose()
	action: EventsWebhookAction;

	@ValidateNested()
	@Type(() => EventsWebhookData)
	@Expose()
	data: EventsWebhookData;
}

export interface GoogleEvent {
	/**
	 * Id is optional for creation
	 */
	id?: string;
	description: string | null;
	startAt: string;
	endAt: string;
	ownerId: number;
}
