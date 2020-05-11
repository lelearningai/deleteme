import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'strongPassword', async: false })
class StrongPassword implements ValidatorConstraintInterface {
  validate(password: string) {
    return (
      typeof password === 'string' &&
      password.length >= 8 &&
      password.length <= 100 &&
      !!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
    );
  }

  defaultMessage() {
    return 'Password must be at least 8 characters and include one lowercase letter, one uppercase letter, and one digit.';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: StrongPassword,
    });
  };
}