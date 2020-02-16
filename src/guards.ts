import {
  DefaultExportTemplateModule,
  TemplateEngine,
  templateEngines,
  TemplateModule,
  Values,
  ValuesObject
} from './types';

export function isDefaultExport(
  templateModule: TemplateModule
): templateModule is DefaultExportTemplateModule {
  return (
    typeof templateModule === 'function' || typeof templateModule === 'string'
  );
}

export function parseArgValues(valuesStr?: string): Values | undefined {
  if (!valuesStr) return undefined;
  return JSON.parse(valuesStr);
}

export function assertsTemplateEngine(
  templateEngine: string | TemplateEngine
): asserts templateEngine is TemplateEngine {
  if (
    !Object.values(templateEngines).includes(templateEngine as TemplateEngine)
  ) {
    throw new Error(
      `supported template engines are
       ${Object.values(templateEngines).join(', ')}`
    );
  }
}

export function assertsValuesIsArray(
  values: Values
): asserts values is ValuesObject[] {
  if (!Array.isArray(values)) {
    throw new Error('values must be array in this context');
  }
}

export function assertsOutNameKey(
  outNameKey: string | undefined
): asserts outNameKey is string {
  if (!outNameKey) {
    throw new Error('--out-name-key is required if multiple values are given');
  }
}
