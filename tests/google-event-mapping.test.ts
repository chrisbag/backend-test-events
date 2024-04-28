import { describe, expect, test } from '@jest/globals';
import {
	mapBunjiEventToGoogleEvent,
	mapGoogleEventToBunjiEvent,
} from '../src/services/events/google-events.service';

describe('Date and data mapping', () => {
	const userId = 1;
	const bunjiEventSource = {
		id: '1',
		userId,
		description: 'An simple event',
		isDone: false,
		startAtDate: '2024-05-01',
		startAtTime: '14:00',
		endAtDate: '2024-05-01',
		endAtTime: '16:00',
	};
	const googleEvent = mapBunjiEventToGoogleEvent(structuredClone(bunjiEventSource));

	test('Check date mapping from BunjiEvent', () => {
		expect(googleEvent).toHaveProperty('startAt', '2024-05-01T14:00:00Z');
		expect(googleEvent).toHaveProperty('endAt', '2024-05-01T16:00:00Z');
	});

	const bunjiEventFromGoogleEvent = mapGoogleEventToBunjiEvent(
		googleEvent,
		userId,
		structuredClone(bunjiEventSource),
	);

	test('Check double transformation give same result', () => {
		expect(bunjiEventFromGoogleEvent).toEqual(bunjiEventSource);
	});

	const googleEvent2 = mapBunjiEventToGoogleEvent(bunjiEventFromGoogleEvent);
	test('Check double transformation give same result', () => {
		expect(googleEvent2).toEqual(googleEvent);
	});
});
