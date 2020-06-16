import { readFileSync } from 'fs';
import { join } from 'path';
import { compile } from '../../compile';
import serialize from '../../serialize';

const SRC_HTML = readFileSync(join(__dirname, './src.html'), 'utf-8');

it('parse', () => {
  const doc = compile(SRC_HTML, false, {});
  const html = serialize(doc);
  console.log(html);
});
