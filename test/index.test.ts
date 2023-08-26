import { expect, test } from 'vitest';
import { AddORCondition, AlertReport, addORCondition, createValidationDefiner } from '../src';
import {
  AlertDef,
  User,
  notConfirmedPassword,
  requiredPassword,
  requiredUserId,
  tooShortPassword,
} from './test-domain';

const defineValidation = createValidationDefiner('danger', 'warning', 'info');

const addORConditionOfUser: AddORCondition<User, AlertDef> = addORCondition;

test('alert one property', () => {
  const validate = defineValidation<User, AlertDef>(requiredUserId, requiredPassword, notConfirmedPassword);
  const properties = validate({ userId: '', password: 'abc', confirmPassword: 'abc' });

  expect(properties.userId.danger).toEqual(new Set(['required']));
  expect(properties.userId.warning).toEqual(new Set());
  expect(properties.userId.info).toEqual(new Set());

  expect(properties.password.danger).toEqual(new Set());
  expect(properties.password.warning).toEqual(new Set());
  expect(properties.password.info).toEqual(new Set());

  expect(properties.confirmPassword.danger).toEqual(new Set());
  expect(properties.confirmPassword.warning).toEqual(new Set());
  expect(properties.confirmPassword.info).toEqual(new Set());
});

test('alert over multiple properties ', () => {
  const validate = defineValidation<User, AlertDef>(requiredUserId, requiredPassword, notConfirmedPassword);
  const properties = validate({ userId: 'xxx', password: 'abc', confirmPassword: 'abd' });

  expect(properties.userId.danger).toEqual(new Set());
  expect(properties.userId.warning).toEqual(new Set());
  expect(properties.userId.info).toEqual(new Set());

  expect(properties.password.danger).toEqual(new Set(['not-confirm-pass']));
  expect(properties.password.warning).toEqual(new Set());
  expect(properties.password.info).toEqual(new Set());

  expect(properties.confirmPassword.danger).toEqual(new Set(['not-confirm-pass']));
  expect(properties.confirmPassword.warning).toEqual(new Set());
  expect(properties.confirmPassword.info).toEqual(new Set());
});

test('test of addORConditionOfUser', () => {
  const generateRandomUserIdFlag = true;
  const isFlagTrueOr = addORConditionOfUser(generateRandomUserIdFlag);

  const validate = defineValidation<User, AlertDef>(requiredUserId, requiredPassword, notConfirmedPassword);

  const validate2 = defineValidation<User, AlertDef>(
    isFlagTrueOr(requiredUserId),
    requiredPassword,
    notConfirmedPassword
  );

  const p: User = { userId: '', password: 'abc', confirmPassword: 'abc' };

  const properties = validate(p);
  const properties2 = validate2(p);

  expect(properties.userId.danger).toEqual(new Set(['required']));
  expect(properties.userId.warning).toEqual(new Set());
  expect(properties.userId.info).toEqual(new Set());

  expect(properties.password.danger).toEqual(new Set());
  expect(properties.password.warning).toEqual(new Set());
  expect(properties.password.info).toEqual(new Set());

  expect(properties.confirmPassword.danger).toEqual(new Set());
  expect(properties.confirmPassword.warning).toEqual(new Set());
  expect(properties.confirmPassword.info).toEqual(new Set());

  expect(properties2.userId.danger).toEqual(new Set());
  expect(properties2.userId.warning).toEqual(new Set());
  expect(properties2.userId.info).toEqual(new Set());

  expect(properties2.password.danger).toEqual(new Set());
  expect(properties2.password.warning).toEqual(new Set());
  expect(properties2.password.info).toEqual(new Set());

  expect(properties2.confirmPassword.danger).toEqual(new Set());
  expect(properties2.confirmPassword.warning).toEqual(new Set());
  expect(properties2.confirmPassword.info).toEqual(new Set());
});

test('test of detection of all error', () => {
  const validate = defineValidation<User, AlertDef>(
    requiredUserId,
    requiredPassword,
    notConfirmedPassword,
    tooShortPassword
  );

  const alerts: AlertReport<User, AlertDef>[] = [];

  const properties = validate({ userId: '', password: 'abc', confirmPassword: 'ab' }, item => {
    alerts.push(item);
  });
  expect(properties.userId.danger).toEqual(new Set(['required']));
  expect(properties.userId.warning).toEqual(new Set());
  expect(properties.userId.info).toEqual(new Set());

  expect(properties.password.danger).toEqual(new Set(['not-confirm-pass']));
  expect(properties.password.warning).toEqual(new Set(['too-short-password']));
  expect(properties.password.info).toEqual(new Set());

  expect(properties.confirmPassword.danger).toEqual(new Set(['not-confirm-pass']));
  expect(properties.confirmPassword.warning).toEqual(new Set());
  expect(properties.confirmPassword.info).toEqual(new Set());
  expect(alerts).toEqual([
    { variant: 'danger', name: 'required', properties: ['userId'] },
    {
      variant: 'danger',
      name: 'not-confirm-pass',
      properties: ['password', 'confirmPassword'],
    },
    {
      variant: 'warning',
      name: 'too-short-password',
      properties: ['password'],
    },
  ]);
});
