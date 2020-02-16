export type AnyClass = new () => any;
export type ValuesObject = {
  [key: string]: string | ValuesObject | ValuesObject[] | undefined;
};
export type Values = ValuesObject | ValuesObject[];

export type TemplateEntity = ((arg: object) => string) | string;
export type NamedExportTemplateModule = {
  template: TemplateEntity;
  values: any[];
  Type: AnyClass;
};
export type DefaultExportTemplateModule = TemplateEntity;
export type TemplateModule =
  | DefaultExportTemplateModule
  | NamedExportTemplateModule;
export const templateEngines = {
  handlebars: 'handlebars',
  hbs: 'hbs'
} as const;
export type TemplateEngine = keyof typeof templateEngines;
