# declarative-validator

## Introduction

"declarative-validator" is the library, which helps you validate data declaratively.

## Installation

```
npm i @mm1995tk/immutable-record-updater
```

## Usage

define alert variants to be used throughout the project.

```ts
// lib.ts
import { createValidationDefiner } from '@mm1995tk/declarative-validator';

export const defineValidation = createValidationDefiner('danger', 'warning', 'info');
```

define types.

```ts
// types.ts
import type { ConvertInvalidatorToValidator, Validate } from '@mm1995tk/declarative-validator';

export type User = {
  userId: string;
  password: string;
  confirmPassword: string;
};

export type UserAlertDef = { danger: 'required' | 'not-confirm-pass'; warning: 'too-short-password'; info: never };

export type ValidateUser = Validate<User, UserAlertDef>;

export type ConvertUserInvalidatorToValidator = ConvertInvalidatorToValidator<User, UserAlertDef>;
```

implement validation rules according to the types defined in types.ts.

```ts
// domain.ts
import { convertInvalidatorToValidator } from '@mm1995tk/declarative-validator';
import type { ConvertUserInvalidatorToValidator, ValidateUser } from './types';

const convertUserInvalidatorToValidator: ConvertUserInvalidatorToValidator = convertInvalidatorToValidator;

export const requiredUserId: ValidateUser = d =>
  !!d.userId || {
    variant: 'danger',
    name: 'required',
    properties: ['userId'],
  };

export const requiredPassword: ValidateUser = convertUserInvalidatorToValidator(
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
```

use validator.

```ts
// your main file
import { notConfirmedPassword, requiredPassword, requiredUserId } from './domain';
import { defineValidation } from './lib';
import { User, UserAlertDef } from './types';

const validateUser = defineValidation<User, UserAlertDef>(requiredUserId, requiredPassword, notConfirmedPassword);

const user: User = { userId: 'xxx', password: 'abc', confirmPassword: 'abd' };
const result = validateUser(user);

console.log(result);
```
