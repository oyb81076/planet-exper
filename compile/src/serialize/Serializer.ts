import {
  ILink,
  IScript,
  IJsGlobals,
  IElementAttribute,
  IDirectives,
  IDirectiveDisabled,
  IDirectiveEach,
  ITypeArg,
  IDirectiveIf,
  IDirectiveBind,
  IDirectiveSrc,
  IDirectiveHref,
  IDirectiveClasses,
  IElementOn,
  IDirectiveJavascript,
  IDirectiveText,
} from '../ast';
import recordExprToString from '../utils/recordExprToString';
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
import { srzLinks } from '../directives/links';
import { ISerializeConfig, ISerializer } from './faces';
import { srzScripts } from '../directives/scripts';
import { srzArgs } from '../directives/args';
// html,head,body都不占用缩进
interface ITag {
  name: string;
  childRendered: boolean;
  inline: boolean;
}

export default class Serializer implements ISerializer {
  public readonly compress: boolean;

  public readonly compactJS: boolean;

  public readonly compactJSON: boolean;

  public readonly quote: boolean;

  private tags: Array<ITag> = [];

  private currentTag?: ITag;

  private indent = '';

  public html = '';

  constructor({
    compress = true, quote = !compress, compactJS = compress, compactJSON = compress,
  }: ISerializeConfig) {
    this.compress = compress;
    this.quote = quote;
    this.compactJS = compactJS;
    this.compactJSON = compactJSON;
  }

  doctype(): void {
    this.html += '<!DOCTYPE html>';
  }

  text(text: string): void {
    const { currentTag } = this;
    if (currentTag && !currentTag.childRendered) {
      currentTag.childRendered = true;
      currentTag.inline = false;
      this.html += '>';
    }
    this.newline();
    this.newIndent();
    this.html += text;
  }

  // 但行文本 <div>xxxxx</div>
  inlineText(text: string): void {
    const { currentTag } = this;
    if (text.length > 50 || !currentTag || currentTag.childRendered) {
      this.text(text);
    } else {
      currentTag.childRendered = true;
      this.html += `>${text}`;
    }
  }

  openTag(tag: string): void {
    const { currentTag } = this;
    if (currentTag && !currentTag.childRendered) {
      currentTag.childRendered = true;
      currentTag.inline = false;
      this.html += '>';
    }
    this.tags.push(this.currentTag = { name: tag, childRendered: false, inline: true });
    if (this.html) {
      this.newline();
      if (!this.compress && isIdentTag(tag)) {
        this.indent += '  ';
      }
      this.newIndent();
    }
    this.html += `<${tag}`;
  }

  closeTag(): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { name, childRendered, inline } = this.currentTag!;
    this.tags.pop();
    this.currentTag = this.tags[this.tags.length - 1];
    if (!childRendered && isSelfClosing(name)) {
      this.html += '>';
    } else {
      if (childRendered) {
        if (!inline) {
          this.newline();
          this.newIndent();
        }
      } else {
        this.html += '>';
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
      this.html += escapeAttrValue(value, this.quote);
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
      this.writeDirective('x-each', srzEachValue(dir, this));
    }
  }

  private xIf(dir?: IDirectiveIf): void {
    if (dir) {
      this.writeDirective('x-if', srzIf(dir, this));
    }
  }

  private xSrc(dir?: IDirectiveSrc): void {
    if (dir) {
      this.writeDirective('x-src', srzSrc(dir));
    }
  }

  private xHref(dir?: IDirectiveHref): void {
    if (dir) {
      this.writeDirective('x-href', srzHref(dir, this));
    }
  }

  private xClasses(value?: IDirectiveClasses): void {
    if (value) {
      this.writeDirective('x-classes', srzClasses(value, this));
    }
  }

  private xText(dir?: IDirectiveText): void {
    if (dir) {
      this.writeDirective('x-text', srzText(dir, this));
    }
  }

  private xBind(bind: IDirectiveBind): void {
    const [name, value] = srzBind(bind, this);
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
    this.writeAttrName(name);
    this.writeAttrValue(value);
  }

  writeAttr(name: string, value?: string): void {
    this.writeAttrName(name);
    this.writeAttrValue(value);
  }

  xKey(key: string): void {
    this.writeDirective('x-key', key);
  }

  xLinks(links: ILink[]): void {
    const value = srzLinks(links, this);
    if (value) {
      this.writeDirective('x-links', value);
    }
  }

  xScripts(scripts: IScript[]): void {
    const value = srzScripts(scripts, this);
    if (value) {
      this.writeDirective('x-scripts', value);
    }
  }

  xJsGlobals(globals: IJsGlobals): void {
    const out = globals.expr ? recordExprToString(globals.expr, this) : globals.content;
    if (out && out !== '{}') {
      this.writeAttr('x-globals', out);
    }
  }

  xArgs(args: ITypeArg[]): void {
    const value = srzArgs(args, this);
    if (value) {
      this.writeDirective('x-args', value);
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

function isIdentTag(tag: string) {
  return tag !== 'html' && tag !== 'head' && tag !== 'body';
}
