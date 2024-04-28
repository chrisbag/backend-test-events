// Interface for Event
export interface BunjiEvent {
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

export enum  WebhookAction {
	CREATE = 'create',
	PATCH="patch",
	DELETE="delete"
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
