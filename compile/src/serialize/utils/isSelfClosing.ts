/**
 * @see https://github.com/jonschlinkert/self-closing-tags/blob/master/index.js
 */
const voids = new Set([
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
  'circle',
  'ellipse',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'stop',
  'use',
]);
export default function isSelfClosing(tag: string): boolean {
  return voids.has(tag);
}
