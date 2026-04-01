// ─────────────────────────────────────────────────────────────────────────────
//  LuneModels — Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resultado de validar un campo individual.
 * - `true` si es válido.
 * - `string` con el mensaje de error si falla.
 * - `Record<string, any>` si el error es anidado (objeto/array).
 */
export type ValidationResult = true | string | Record<string, any>;

/**
 * Función de validación personalizada.
 * Debe devolver `true` si el valor es válido, o un mensaje de error.
 */
export type CustomValidator<T> = (value: T) => ValidationResult;

// ─────────────────────────────────────────────────────────────────────────────
//  VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validador base para tipos primitivos (`string` y `number`).
 * Se obtiene a través de `LuneModels.string()` o `LuneModels.number()`.
 */
export interface PrimitiveValidator<T> {
  /** Tipo interno del validador (`"string"` | `"number"`). */
  readonly _type: "string" | "number";

  /** Devuelve `true` si el campo está marcado como requerido. */
  _isRequired(): boolean;

  /**
   * Valida el valor dado contra todas las reglas configuradas.
   * @returns `true` si es válido, o el mensaje de error.
   */
  validate(value: unknown): ValidationResult;

  /**
   * Marca el campo como obligatorio.
   * @param message - Mensaje personalizado (por defecto: `"Campo requerido"`).
   */
  required(message?: string): this;

  /**
   * Añade una regla de validación personalizada.
   * @param fn - Función que recibe el valor y devuelve `true` o un mensaje de error.
   */
  custom(fn: CustomValidator<T>): this;
}

/**
 * Validador para valores de tipo `string`.
 * Se obtiene a través de `LuneModels.string()`.
 *
 * @example
 * ```js
 * const v = LuneModels.string().required().minLength(3).maxLength(50);
 * v.validate("Hola"); // true
 * v.validate("Hi");   // "Mínimo 3 caracteres"
 * ```
 */
export interface StringValidator extends PrimitiveValidator<string> {
  readonly _type: "string";

  /**
   * Longitud máxima permitida.
   * @param limit   - Número máximo de caracteres.
   * @param message - Mensaje personalizado.
   */
  maxLength(limit: number, message?: string): this;

  /**
   * Longitud mínima requerida.
   * @param limit   - Número mínimo de caracteres.
   * @param message - Mensaje personalizado.
   */
  minLength(limit: number, message?: string): this;
}

/**
 * Validador para valores de tipo `number`.
 * Se obtiene a través de `LuneModels.number()`.
 *
 * @example
 * ```js
 * const v = LuneModels.number().required().min(0).max(100);
 * v.validate(50);  // true
 * v.validate(150); // "El valor máximo es 100"
 * ```
 */
export interface NumberValidator extends PrimitiveValidator<number> {
  readonly _type: "number";

  /**
   * Valor máximo permitido (inclusivo).
   * @param limit   - Valor máximo.
   * @param message - Mensaje personalizado.
   */
  max(limit: number, message?: string): this;

  /**
   * Valor mínimo requerido (inclusivo).
   * @param limit   - Valor mínimo.
   * @param message - Mensaje personalizado.
   */
  min(limit: number, message?: string): this;
}

/**
 * Validador para arrays.
 * Se obtiene a través de `LuneModels.array(itemValidator?)`.
 *
 * @template T - Tipo de cada elemento del array.
 *
 * @example
 * ```js
 * const v = LuneModels.array(LuneModels.string().required()).minElements(1);
 * v.validate(["a", "b"]); // true
 * v.validate([]);          // "Mínimo 1 elemento(s)"
 * ```
 */
export interface ArrayValidator<T = unknown> {
  readonly _type: "array";

  /** Devuelve `true` si el campo está marcado como requerido. */
  _isRequired(): boolean;

  /**
   * Valida el array y cada uno de sus elementos si se configuró `itemValidator`.
   * @returns `true`, un mensaje de error, o un objeto `{ índice: error }` para errores por item.
   */
  validate(value: unknown): ValidationResult;

  /**
   * Marca el campo como obligatorio.
   * @param message - Mensaje personalizado (por defecto: `"Campo requerido"`).
   */
  required(message?: string): this;

  /**
   * Número mínimo de elementos requeridos.
   * @param limit   - Mínimo de elementos.
   * @param message - Mensaje personalizado.
   */
  minElements(limit: number, message?: string): this;

  /**
   * Número máximo de elementos permitidos.
   * @param limit   - Máximo de elementos.
   * @param message - Mensaje personalizado.
   */
  maxElements(limit: number, message?: string): this;

  /**
   * Añade una regla de validación personalizada sobre el array completo.
   * @param fn - Función que recibe el array y devuelve `true` o un mensaje de error.
   */
  custom(fn: CustomValidator<T[]>): this;
}

/**
 * Mapa de validadores para las propiedades de un objeto.
 * Cada clave corresponde a un campo del objeto a validar.
 */
export type ObjectDefinition = Record<
  string,
  StringValidator | NumberValidator | ArrayValidator | ObjectValidator
>;

/**
 * Validador para objetos con una estructura definida.
 * Se obtiene a través de `LuneModels.object(definition)`.
 *
 * @example
 * ```js
 * const v = LuneModels.object({
 *   nombre: LuneModels.string().required(),
 *   edad:   LuneModels.number().min(0),
 * });
 * v.validate({ nombre: "Ana", edad: 25 }); // true
 * v.validate({ edad: -1 });                // { nombre: "Campo requerido", edad: "El valor mínimo es 0" }
 * ```
 */
export interface ObjectValidator {
  readonly _type: "object";

  /** Devuelve `true` si el campo está marcado como requerido. */
  _isRequired(): boolean;

  /**
   * Valida el objeto y todos sus campos definidos.
   * @returns `true` si es válido, un mensaje de error, o un objeto con los errores por campo.
   */
  validate(value: unknown): ValidationResult;

  /**
   * Marca el campo como obligatorio.
   * @param message - Mensaje personalizado (por defecto: `"Campo requerido"`).
   */
  required(message?: string): this;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mapa de validadores para las propiedades de un schema completo.
 */
export type SchemaDefinition = Record<
  string,
  StringValidator | NumberValidator | ArrayValidator | ObjectValidator
>;

/**
 * Resultado de validar un objeto con `schema.validate()`.
 *
 * @template T - Forma del objeto validado.
 */
export interface SchemaValidationResult<T = Record<string, unknown>> {
  /** `true` si todos los campos pasaron la validación. */
  valid: boolean;
  /** Objeto con los errores por campo. Vacío si `valid` es `true`. */
  errors: Partial<Record<keyof T, ValidationResult>>;
  /** Objeto con los campos válidos (solo incluye los que estaban presentes). */
  value: Partial<T>;
}

/**
 * Schema completo creado con `LuneModels.schema(definition)`.
 * Valida un objeto entero de una sola vez.
 *
 * @template T - Forma del objeto a validar.
 *
 * @example
 * ```js
 * const schema = LuneModels.schema({
 *   nombre: LuneModels.string().required().maxLength(100),
 *   edad:   LuneModels.number().min(0).max(120),
 * });
 *
 * const { valid, errors, value } = schema.validate({ nombre: "Ana", edad: 25 });
 * ```
 */
export interface Schema<T = Record<string, unknown>> {
  /**
   * Valida el objeto completo contra la definición del schema.
   * @param data - Objeto a validar.
   * @returns Resultado con `valid`, `errors` y `value`.
   */
  validate(data: Record<string, unknown>): SchemaValidationResult<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  LUNEMODELS NAMESPACE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ## LuneModels
 * Librería de validación con encadenamiento fluido de reglas.
 * Compatible con `LuneDataBase` para validar schemas de tablas.
 *
 * @example
 * ```js
 * import LuneModels from './LuneModels.js';
 *
 * const schema = LuneModels.schema({
 *   username: LuneModels.string().required().minLength(3).maxLength(20),
 *   age:      LuneModels.number().required().min(18),
 *   tags:     LuneModels.array(LuneModels.string()).minElements(1),
 * });
 *
 * const { valid, errors } = schema.validate({ username: "Lu", age: 15 });
 * // valid  → false
 * // errors → { username: "Mínimo 3 caracteres", age: "El valor mínimo es 18" }
 * ```
 */
declare const LuneModels: {
  /**
   * Crea un validador para valores de tipo `string`.
   *
   * @example
   * ```js
   * LuneModels.string().required().minLength(2).maxLength(50)
   * ```
   */
  string(): StringValidator;

  /**
   * Crea un validador para valores de tipo `number`.
   *
   * @example
   * ```js
   * LuneModels.number().required().min(0).max(999)
   * ```
   */
  number(): NumberValidator;

  /**
   * Crea un validador para arrays.
   * Opcionalmente recibe un validador para los elementos individuales.
   *
   * @param itemValidator - Validador aplicado a cada elemento del array.
   *
   * @example
   * ```js
   * LuneModels.array(LuneModels.string().required()).minElements(1)
   * ```
   */
  array<T = unknown>(
    itemValidator?: StringValidator | NumberValidator | ArrayValidator<T> | ObjectValidator
  ): ArrayValidator<T>;

  /**
   * Crea un validador para objetos con una estructura definida.
   *
   * @param definition - Mapa de campo → validador.
   *
   * @example
   * ```js
   * LuneModels.object({
   *   calle:  LuneModels.string().required(),
   *   numero: LuneModels.number().min(1),
   * })
   * ```
   */
  object(definition: ObjectDefinition): ObjectValidator;

  /**
   * Crea un schema completo que valida un objeto entero de una sola vez.
   * Devuelve `{ valid, errors, value }`.
   *
   * @param definition - Mapa de campo → validador.
   *
   * @example
   * ```js
   * const schema = LuneModels.schema({
   *   email: LuneModels.string().required(),
   *   edad:  LuneModels.number().min(18),
   * });
   * const { valid, errors } = schema.validate(data);
   * ```
   */
  schema<T = Record<string, unknown>>(definition: SchemaDefinition): Schema<T>;
};

export default LuneModels;