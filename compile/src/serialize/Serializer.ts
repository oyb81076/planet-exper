import { stringify } from 'json5';
import { isString } from 'lodash';
import {
  ILink,
  IScript,
  IJsGlobals,
  IElementAttribute,
  IDirectives,
  IDirectiveDisabled,
  IDirectiveEach,
  ITypeArgs,
  IDirectiveIf,
  IDirectiveBind,
  IDirectiveSrc,
  IDirectiveHref,
  IDirectiveClasses,
  IElementOn,
  IDirectiveJavascript,
  IDirectiveText,
} from '../ast';
import recordExprToString from './utils/recordExprToString';
import escapeAttrValue from './utils/escapeAttrValue';
import isSelfClosing from './utils/isSelfClosing';
import { srzEachValue } from '../directives/each';
import { srzIf } from '../directives/if';
import { srzBind } from '../directives/bind';
import { srzSrc } from '../directives/src';
import { srzHref } from '../directives/href';
import { srzClasses } from '../directives/classes';
import { srzOn } from '../directives/on';
import { srzJavascript } from '../directives/javascript';
import { srzText } from '../directives/text';
// html,head,body都不占用缩进
interface ITag {
  name: string;
  opened: boolean;
}
export default class Serializer {
  private compress = false;

  private tags: Array<ITag> = [];

  private currentTag?: ITag;

  private indent = '';

  public html = '';

  doctype(): void {
    this.html += '<!DOCTYPE html>';
  }

  text(text: string): void {
    if (this.currentTag && !this.currentTag.opened) {
      this.currentTag.opened = true;
      this.html += '>';
      this.newline();
    }
    this.newIndent();
    this.html += text;
  }

  // 但行文本 <div>xxxxx</div>
  inlineText(text: string): void {
    if (text.length > 50 || !this.currentTag || this.currentTag.opened) {
      this.text(text);
    } else {
      this.html += `>${text}`;
    }
  }

  openTag(tag: string): void {
    if (this.currentTag && !this.currentTag.opened) {
      this.currentTag.opened = true;
      this.html += '>';
    }
    this.newline();
    this.tags.push(this.currentTag = { name: tag, opened: false });
    if (!this.compress && isIdentTag(tag)) {
      this.indent += '  ';
    }
    this.newIndent();
    this.html += `<${tag}`;
  }

  closeTag(): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { name, opened } = this.currentTag!;
    this.tags.pop();
    this.currentTag = this.tags[this.tags.length - 1];
    if (!opened && isSelfClosing(name)) {
      this.html += '>';
    } else {
      if (opened) {
        this.newline();
        this.newIndent();
      }
      this.html += `</${name}>`;
    }
    if (!this.compress && isIdentTag(name)) {
      this.indent = this.indent.substr(2);
    }
  }

  private writeAttrName(name: string): void {
    this.html += ' ';
    this.html += name;
  }

  private writeAttrValue(value?: string): void {
    if (value) {
      this.html += '=';
      this.html += escapeAttrValue(value, this.compress);
    }
  }

  attrs(attrs: IElementAttribute[]): void {
    attrs.forEach(({ name, value }) => {
      this.writeAttr(name, value);
    });
  }

  directives(directives: IDirectives): void {
    this.xDisabled(directives.disabled);
    this.xEach(directives.each);
    this.xIf(directives.if);
    directives.binds.forEach((x) => this.xBind(x));
    this.xSrc(directives.src);
    this.xHref(directives.href);
    this.xClasses(directives.classes);
    directives.on.forEach((x) => this.xOn(x));
    this.xJavascript(directives.javascript);
    this.xText(directives.text);
  }

  private xDisabled(value?: IDirectiveDisabled): void {
    if (value) {
      this.writeAttrName('x-disabled');
    }
  }

  private xEach(dir?: IDirectiveEach): void {
    if (dir) {
      this.writeDirective('x-each', srzEachValue(dir));
    }
  }

  private xIf(dir?: IDirectiveIf): void {
    if (dir) {
      this.writeDirective('x-if', srzIf(dir));
    }
  }

  private xSrc(dir?: IDirectiveSrc): void {
    if (dir) {
      this.writeDirective('x-src', srzSrc(dir));
    }
  }

  private xHref(dir?: IDirectiveHref): void {
    if (dir) {
      this.writeDirective('x-href', srzHref(dir));
    }
  }

  private xClasses(value?: IDirectiveClasses): void {
    if (value) {
      this.writeDirective('x-classes', srzClasses(value));
    }
  }

  private xText(dir?: IDirectiveText): void {
    if (dir) {
      this.writeDirective('x-text', srzText(dir));
    }
  }

  private xBind(bind: IDirectiveBind): void {
    const [name, value] = srzBind(bind);
    this.writeDirective(name, value);
  }

  private xOn(dir: IElementOn): void {
    const [name, value] = srzOn(dir);
    this.writeDirective(name, value);
  }

  private xJavascript(dir?: IDirectiveJavascript): void {
    if (!dir) { return; }
    this.writeDirective('x-javascript', srzJavascript(dir));
  }

  writeDirective(name: string, value: string): void {
    if (value) {
      this.writeAttrName(name);
      this.writeAttrValue(value);
    }
  }

  writeAttr(name: string, value?: string): void {
    this.writeAttrName(name);
    this.writeAttrValue(value);
  }

  xKey(key: string): void {
    this.writeDirective('x-key', key);
  }

  xLinks(links: ILink[]): void {
    if (links.length === 0) { return; }
    const value = links.map(mapLinks).filter(Boolean);
    if (value.length === 0) { return; }
    if (value.length === 1 && isString(value[0])) {
      this.writeDirective('x-links', value[0]);
    } else {
      this.writeDirective('x-links', stringify(value));
    }
  }

  xScripts(scripts: IScript[]): void {
    if (scripts.length === 0) { return; }
    const value = scripts
      .map(({ src, file }) => (file || (src ? { src } : undefined)))
      .filter(Boolean);
    if (value.length === 0) { return; }
    if (value.length === 1 && isString(value[0])) {
      this.writeDirective('x-scripts', value[0]);
    } else {
      this.writeDirective('x-scripts', stringify(value));
    }
  }

  xJsGlobals(globals: IJsGlobals): void {
    const out = globals.expr ? recordExprToString(globals.expr) : globals.content;
    if (out && out !== '{}') {
      this.writeAttr('x-globals', out);
    }
  }

  xArgs(args: ITypeArgs[]): void {
    if (args.length) {
      this.writeDirective('x-args', stringify(args));
    }
  }

  newline(): void {
    if (!this.compress) {
      this.html += '\n';
    }
  }

  newIndent(): void {
    if (!this.compress) {
      this.html += this.indent;
    }
  }
}
function mapLinks({ media, href, file }: ILink) {
  if (!media && !href) { return file; }
  return { media, href, file };
}
function isIdentTag(tag: string) {
  return tag !== 'html' && tag !== 'head' && tag !== 'body';
}
