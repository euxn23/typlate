import { validateSync } from 'class-validator';
import {
  AnyClass,
  TemplateEngine,
  TemplateEntity,
  TemplateModule,
  Values
} from './types';
import { compileHandlebars } from './template-engines';
import { isDefaultExport } from './guards';

export async function compileTemplateModule(
  templateModule: TemplateModule,
  argValues?: object,
  callback?: Function
) {
  const template = isDefaultExport(templateModule)
    ? templateModule
    : templateModule.template;
  const Type = isDefaultExport(templateModule)
    ? undefined
    : templateModule.Type;
  const values: object | object[] =
    argValues || isDefaultExport(templateModule)
      ? ([] as never[])
      : templateModule.values;

  const compileTemplateFunction =
    typeof template === 'string'
      ? (values: Object) => compileHandlebars(template, values)
      : template;

  // class-validator based validate
  if (Type) {
    if (!values || !Object.keys(values).length) {
      throw new Error('values is not defined');
    }
    if (Array.isArray(values)) {
      for (const value of values) {
        validateValue(value, Type);
      }
    } else {
      validateValue(values, Type);
    }
  }

  const compiled = compileTemplateWithValues(compileTemplateFunction, values);

  return callback ? callback(compiled, values) : compiled;
}

export async function compileTemplateText(
  template: TemplateEntity,
  values: Values = {},
  engine: TemplateEngine | undefined,
  callback?: Function
) {
  const compiled = compileTemplateWithValues(template, values, engine);

  return callback ? callback(compiled, values) : compiled;
}

function validateValue(value: object, Type: AnyClass) {
  const instance = new Type();
  for (const [k, v] of Object.entries(value)) {
    instance[k] = v;
  }

  const errors = validateSync(instance);
  if (errors.length) {
    throw new Error('validation error');
  }
}

export function compileTemplateWithValues(
  template: TemplateEntity,
  values: object | object[],
  engine?: TemplateEngine
): string[] {
  if (Array.isArray(values) && values.length) {
    return values.map(v => compileTemplate(template, v, engine));
  } else {
    return [compileTemplate(template, values, engine)];
  }
}

function compileTemplate(
  template: TemplateEntity,
  values: object,
  engine?: TemplateEngine
) {
  if (typeof template === 'string') {
    if (engine === 'handlebars' || engine === 'hbs') {
      return compileHandlebars(template, values);
    }
    throw new Error(`engine should be 'handlebars' | 'hbs'`);
  } else {
    return template(values);
  }
}
