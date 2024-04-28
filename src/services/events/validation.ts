import { object, string, number } from "yup";
import { WebhookAction } from './types';

const dateonly = string().test(
  "is-dateonly",
  "Please enter a valid datetime in the format YYYY-MM-DD",
  (value) => {
    if (!value) return true;
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }
);

const timeOnly = string().test(
  "is-timeonly",
  "Please enter a valid datetime in the format HH:MM",
  (value) => {
    if (!value) return true;
    return /^\d{2}:\d{2}$/.test(value);
  }
);

// Validation schema for creating events
export const createEventSchema = object().shape({
  description: string().nullable(),
  startAtDate: dateonly.required(),
  startAtTime: timeOnly.required(),
  endAtDate: dateonly.required(),
  endAtTime: timeOnly.required(),
  userId: number().required(),
});

// Validation schema for patching events
export const patchEventSchema = object().shape({
  description: string().nullable(),
  startAtDate: dateonly.required(),
  startAtTime: timeOnly.required(),
  endAtDate: dateonly.required(),
  endAtTime: timeOnly.required(),
  userId: number(),
});

// Validation schema for patching events
export const callbackCallSchema = object().shape({
  action: string().oneOf(Object.values(WebhookAction)).required(),
	data: object({
		id: string().required(),
		description: string().nullable(),
		startAt: string().datetime().required(),
		endAt: string().datetime().required(),
		ownerId: number().required()
	})
});
