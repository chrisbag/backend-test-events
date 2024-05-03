import {
	ValidatorConstraint,
	ValidatorOptions,
	registerDecorator,
	ValidatorConstraintInterface,
} from '@neo9/n9-node-routing';

@ValidatorConstraint({ name: 'isDateOnly', async: false })
export class IsDateOnly implements ValidatorConstraintInterface {
	private readonly dateRegExp = /^\d{4}-\d{2}-\d{2}$/;

	public validate(value: unknown): boolean {
		return typeof value === 'string' && this.dateRegExp.test(value);
	}

	public defaultMessage(): string {
		return 'Please enter a valid datetime in the format YYYY-MM-DD';
	}
}

export function isDateOnly(
	validatorOptions?: ValidatorOptions,
): (object: object, propertyName: string) => void {
	return (object: object, propertyName: string): void => {
		registerDecorator({
			propertyName,
			target: object.constructor,
			options: validatorOptions,
			constraints: [],
			validator: new IsDateOnly(),
		});
	};
}
