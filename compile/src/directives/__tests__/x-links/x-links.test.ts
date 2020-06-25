import { readFileSync } from 'fs';
import { join } from 'path';
import { compileFull } from '../../../compile';
import serialize from '../../../serialize';

describe('single', () => {
  const SRC_HTML = readFileSync(join(__dirname, './x-links-single.html'), 'utf-8');
  it('all', () => {
    const doc = compileFull(SRC_HTML, { parseExpression: true });
    const loose = serialize(doc, { compress: false, quote: true });
    expect(loose).toMatchSnapshot();
    const compact = serialize(doc, {
      compress: false, quote: true, compactJS: true, compactJSON: true,
    });
    expect(compact).toMatchSnapshot();
  });
});

describe('multiple', () => {
  const SRC_HTML = readFileSync(join(__dirname, './x-links-multiple.html'), 'utf-8');
  it('all', () => {
    const doc = compileFull(SRC_HTML, { parseExpression: true });
    const loose = serialize(doc, { compress: false, quote: true });
    expect(loose).toMatchSnapshot();
    const compact = serialize(doc, {
      compress: false, quote: true, compactJS: true, compactJSON: true,
    });
    expect(compact).toMatchSnapshot();
  });
});
