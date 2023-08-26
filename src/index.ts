import type {
  AddORCondition,
  AlertReport,
  ConvertInvalidatorToValidator,
  Invalidate,
  Validate,
  ValidationResult,
  ValidatorMap,
  Validators,
} from './types';

export type {
  AddORCondition,
  AlertReport,
  ConvertInvalidatorToValidator,
  Invalidate,
  Validate,
  ValidatorMap,
  Validators,
};

/**
 * from alert variants, create the the function that defines validator.
 * @param variants your alert variants
 * @template Vaiant it is recommended that you don't pass the type parameter, but let it be inferred. 
 * @throws variant duplicated {@link Error|error}
 * @example
 *
 * ```ts
 * type Person = {
 *   name: string;
 *   age: number;
 * };
 *
 * type Def = { danger: 'required-name' | 'under-18'; warning: 'under-20'; info: never };
 *
 * const defineValidation = createValidationDefiner('danger', 'warning', 'info');
 *
 * const validatePerson = defineValidation<Person, Def>(
 *   d => !!d.name || { properties: ['name'], name: 'required-name', variant: 'danger' },
 *   d => d.age >= 18 || { properties: ['age'], name: 'under-18', variant: 'danger' },
 *   d => d.age >= 20 || { properties: ['age'], name: 'under-20', variant: 'warning' },
 * );
 *
 * const person: Person = { name: 'takuya', age: 20 };
 *
 * console.log(validatePerson(person));
 * ```
 */
export const createValidationDefiner = <Variant extends string>(...variants: Variant[]) => {
  if (new Set(variants).size < variants.length) {
    throw new Error('variant is duplicated.');
  }
  /**
   * the the function that defines validator.
   * @template Data the data type to be validated.
   * @template AlertDef the definition of alert.
   */
  return <Data extends Record<string, unknown>, AlertDef extends { [key in Variant]: string }>(
    ...validators: Validators<Data, PickVariant<AlertDef>>
  ) => {
    /**
     * validate data.
     * @param data data that is being validated.
     * @param onAlertDetected the callback function that is executed every detecting a alert.
     * @throws error raised when type parameters are explicitly passed and arguments do not cover variants.
     */
    return (data: Data, onAlertDetected?: (item: AlertReport<Data, Pick<AlertDef, Variant>>) => void) => {
      const keys: (keyof Data)[] = Object.keys(data);

      /*
      if Variant is 'a' | 'b' | 'c' but args(variants) is 'a' and 'b',
      actual key of object don't include 'c' but only 'a' and 'b' 
      despite the fact of that "keyof Result" is 'a', 'b', and 'c' .
      because of the above, it cast to { [key in keyof Result]: Partial<Result[key]>;}, not Result.
      */
      const result = Object.fromEntries(keys.map(k => [k, initAlertsByVariant()])) as {
        [key in keyof Result]: Partial<Result[key]>;
      };

      for (const validate of validators) {
        const r = validate(data);
        if (typeof r === 'boolean') {
          continue;
        }

        onAlertDetected?.(r);

        const { name, variant, properties } = r;

        const dedupedProperties = Array.from(new Set(properties));

        dedupedProperties.forEach(p => {
          const set = result[p][variant];
          if (!set) {
            throw new Error('remove type parameters so that the compiler infers the type.');
          }
          set.add(name);
        });
      }
      // this is safe cast because it throws exception when arguments do not cover variants.
      return result as Result;
      type Result = ValidationResult<Data, PickVariant<AlertDef>>;
    };

    function initAlertsByVariant() {
      return Object.fromEntries(variants.map(variant => [variant, new Set()]));
    }
  };
  type PickVariant<T extends Record<string, string>> = Pick<T, Variant>;
};

/**
 * add or condition to validator
 * @template Data the data type to be validated.
 * @template AlertDef the definition of alert.
 */
export const addORCondition = <Data extends Record<string, unknown>, AlertDef extends Record<string, string>>(
  cond: boolean
): ReturnType<AddORCondition<Data, AlertDef>> => {
  return validateData => data => cond || validateData(data);
};

/**
 * the function that converts {@link Invalidate| invalidator} to {@link Validate| validator}
 * @template Data the data type to be validated.
 * @template AlertDef the definition of alert.
 */
export const convertInvalidatorToValidator = <
  Data extends Record<string, unknown>,
  AlertDef extends Record<string, string>,
>(
  invalidate: Invalidate<Data, AlertDef>
): ReturnType<ConvertInvalidatorToValidator<Data, AlertDef>> => {
  return item => {
    const r = invalidate(item);
    return !r || r;
  };
};
