import { Validate, convertInvalidatorToValidator } from '../src';

export type User = {
  userId: string;
  password: string;
  confirmPassword: string;
};

export type AlertDef = { danger: 'required' | 'not-confirm-pass'; warning: 'too-short-password'; info: never };

export type ValidateUser = Validate<User, AlertDef>;

export const requiredUserId: ValidateUser = d =>
  !!d.userId || {
    variant: 'danger',
    name: 'required',
    properties: ['userId'],
  };

export const requiredPassword: ValidateUser = convertInvalidatorToValidator<User, AlertDef>(
  d =>
    !d.password && {
      variant: 'danger',
      name: 'required',
      properties: ['password'],
    }
);

export const notConfirmedPassword: ValidateUser = d =>
  !d.password ||
  d.password === d.confirmPassword || {
    variant: 'danger',
    name: 'not-confirm-pass',
    properties: ['password', 'confirmPassword'],
  };

export const tooShortPassword: ValidateUser = d =>
  !d.password ||
  d.password.length > 8 || {
    variant: 'warning',
    name: 'too-short-password',
    properties: ['password'],
  };
