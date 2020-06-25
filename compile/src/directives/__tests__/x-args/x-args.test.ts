import { readFileSync } from 'fs';
import { join } from 'path';
import { compileFragment } from '../../../compile';
import serialize from '../../../serialize';

const SRC_HTML = readFileSync(join(__dirname, './x-args.html'), 'utf-8');

it('all', () => {
  const doc = compileFragment(SRC_HTML, { parseExpression: true });
  const loose = serialize(doc, { compress: false, quote: true });
  expect(loose).toMatchSnapshot();
  const compact = serialize(doc, {
    compress: false, quote: true, compactJS: true, compactJSON: true,
  });
  expect(compact).toMatchSnapshot();
  expect(doc).toMatchSnapshot();
});
