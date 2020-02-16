import Handlebars from 'handlebars';

export function compileHandlebars(template: string, values: object) {
  const hbsTemplate = Handlebars.compile(template);

  return hbsTemplate(values);
}
