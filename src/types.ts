/**
 * the function that receives data and returns `true` if there are no alerts, or returns alert details if there are alerts
 * @template Data the data type to be validated.
 * @template AlertDef the definition of alert.
 */
export type Validate<Data extends Record<string, unknown>, AlertDef extends Record<string, string>> = (
  item: Data
) => true | AlertReport<Data, AlertDef>;

/**
 * one or more {@link Validate| validator}
 * @template Data the data type to be validated.
 * @template AlertDef the definition of alert.
 */
export type Validators<Data extends Record<string, unknown>, AlertDef extends Record<string, string>> = NonEmptyArray<
  Validate<Data, AlertDef>
>;

/**
 * the object with validator mapped to the key of the data
 * @template Data the data type to be validated.
 * @template AlertDef the definition of alert.
 */
export type ValidatorMap<Data extends Record<string, unknown>, AlertDef extends Record<string, string>> = {
  [key in keyof Data]?: Validate<Data, AlertDef>;
};

/**
 * the inversion of {@link Validate| validator}
 * @template Data the data type to be validated.
 * @template AlertDef the definition of alert.
 */
export type Invalidate<Data extends Record<string, unknown>, AlertDef extends Record<string, string>> = (
  item: Data
) => false | AlertReport<Data, AlertDef>;

/**
 * the function that converts {@link Invalidate| invalidator} to {@link Validate| validator}
 * @template Data the data type to be validated.
 * @template AlertDef the definition of alert.
 */
export type ConvertInvalidatorToValidator<
  Data extends Record<string, unknown>,
  AlertDef extends Record<string, string>,
> = (invalidate: Invalidate<Data, AlertDef>) => Validate<Data, AlertDef>;

/**
 * the report of an alert detail.
 * @template Data the data type to be validated.
 * @template AlertDef the definition of alert.
 */
export type AlertReport<Data extends Record<string, unknown>, AlertDef extends Record<string, string>> = {
  [Variant in keyof AlertDef]: {
    variant: Variant;
    name: AlertDef[Variant];
    properties: NonEmptyArray<keyof Data>;
  };
}[keyof AlertDef];

/**
 * the result of validation.
 * @template Data the data type to be validated.
 * @template AlertDef the definition of alert.
 */
export type ValidationResult<Data extends Record<string, unknown>, AlertDef extends Record<string, string>> = {
  [property in keyof Data]: {
    [Variant in keyof AlertDef]: Set<AlertDef[Variant]>;
  };
};

/**
 * add or condition to the validator.
 * @template Data the data type to be validated.
 * @template AlertDef the definition of alert.
 */
export type AddORCondition<Data extends Record<string, unknown>, AlertDef extends Record<string, string>> = (
  cond: boolean
) => UnaryOperator<Validate<Data, AlertDef>>;

type NonEmptyArray<T> = [T, ...T[]];

type UnaryOperator<T> = (item: T) => T;
