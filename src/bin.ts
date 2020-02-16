import path from 'path';
import { promises as fsAsync } from 'fs';
import yargs from 'yargs';

import { compileTemplateModule, compileTemplateText } from './typlate';
import { TemplateModule, Values } from './types';
import {
  assertsOutNameKey,
  assertsTemplateEngine,
  assertsValuesIsArray,
  parseArgValues
} from './guards';

async function main() {
  const argv = yargs.options({
    t: {
      alias: 'template',
      type: 'string',
      demandOption: true,
      desc: 'template file, written in function or handlebars'
    },
    v: { alias: 'values', type: 'string' },
    e: {
      alias: 'engine',
      type: 'string',
      default: 'hbs',
      desc: 'template engine, now supported is handlebars'
    },
    o: {
      alias: 'out',
      type: 'string',
      desc: 'output file path'
    },
    'out-dir': {
      type: 'string',
      desc: 'output directory'
    },
    'out-name-key': {
      type: 'string',
      demandOption: 'out-dir',
      desc:
        'key name of values to specify output filename, required with --out-dir, and should be unique'
    }
  }).argv;

  const {
    t: templatePath,
    v: values,
    e: engine,
    o: out,
    'out-dir': outDir,
    'out-name-key': outNameKey
  } = argv;

  const argValues = parseArgValues(values);
  assertsTemplateEngine(engine);

  const templateRelativePath = path.resolve(process.cwd(), templatePath);

  async function writeFile(compiledTexts: string[], values: Values) {
    if (out) {
      if (compiledTexts.length !== 1) {
        throw new Error('option --out should be uses with one template output');
      }
      await fsAsync.writeFile(out, compiledTexts[0]);
    } else if (outDir) {
      assertsValuesIsArray(values);
      assertsOutNameKey(outNameKey);
      const compiledTextsWithFileName: [string, string][] = compiledTexts.map(
        (text, idx) => {
          const fileName = values[idx][outNameKey];
          if (typeof fileName !== 'string') {
            throw new Error(
              `${outNameKey} of ${JSON.stringify(values)} must be string`
            );
          }
          return [text, fileName];
        }
      );
      for (const [text, fileName] of compiledTextsWithFileName) {
        await fsAsync.writeFile(
          path.resolve(process.cwd(), outDir, fileName),
          text
        );
      }
    } else {
      compiledTexts.map(console.log);
    }
  }

  await import(templateRelativePath)
    .then((templateModule: TemplateModule) =>
      compileTemplateModule(templateModule, argValues, writeFile)
    )
    .catch(async () => {
      const templateBuf = await fsAsync.readFile(templateRelativePath);
      return compileTemplateText(templateBuf.toString(), argValues, engine);
    });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
