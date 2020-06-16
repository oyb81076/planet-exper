import { readFileSync } from 'fs';
import { join } from 'path';
import { parseHTML } from '../parse/parseRoot';

const index_html = readFileSync(join(__dirname, 'res/index.html'), 'utf-8');
const index_css = readFileSync(join(__dirname, 'res/index.css'), 'utf-8');
const global_css = readFileSync(join(__dirname, 'res/index.css'), 'utf-8');

it('compile', () => {
  console.log(index_html);
  console.log(index_css);
  console.log(global_css);
  parseHTML(index_html);
});
