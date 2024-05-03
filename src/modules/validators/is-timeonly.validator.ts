import {
	ValidatorConstraint,
	ValidatorOptions,
	registerDecorator,
	ValidatorConstraintInterface,
} from '@neo9/n9-node-routing';

@ValidatorConstraint({ name: 'isTimeOnly', async: false })
export class IsTimeOnly implements ValidatorConstraintInterface {
	private readonly dateRegExp = /^\d{2}:\d{2}$/;

	public validate(value: unknown): boolean {
		return typeof value === 'string' && this.dateRegExp.test(value);
	}

	public defaultMessage(): string {
		return 'Please enter a valid datetime in the format HH:MM';
	}
}

export function isTimeOnly(
	validatorOptions?: ValidatorOptions,
): (object: object, propertyName: string) => void {
	return (object: object, propertyName: string): void => {
		registerDecorator({
			propertyName,
			target: object.constructor,
			options: validatorOptions,
			constraints: [],
			validator: new IsTimeOnly(),
		});
	};
}
