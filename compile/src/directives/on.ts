import { fromPairs } from 'lodash';
import { IContext } from '../parse/faces';
import {
  NodeTypes, ElementEvent, ElementEventNS, IElementOn,
} from '../ast';
import { createCompilerError, ErrorCodes } from '../errors';

/**
 * @example
 *  <div x-on-click-vars="{a:1,b:2}" x-on-click-alert="pt.alert('some alert js')">
 */
export default function processOn(ctx: IContext, xName: string, xValue: string): void {
  try {
    const [event, ns] = parseName(xName);
    ctx.directives.on.push({
      type: NodeTypes.DIRECTIVE_ON,
      event,
      ns,
      rawName: xName,
      rawValue: xValue,
    });
  } catch (err) {
    throw createCompilerError(ErrorCodes.X_D_BIND_SYNTAX, ctx, xValue, err);
  }
}
export function srzOn(dir: IElementOn): [string, string] {
  const name = eventNames[dir.event];
  const ns = eventNSNames[dir.ns];
  return [`x-on-${name}-${ns}`, dir.rawValue];
}

function parseName(xName: string): [ElementEvent, ElementEventNS] {
  const i = xName.indexOf('-', 5);
  const name = xName.substring(5, i);
  const ns = xName.substring(i + 1);
  const eventName = eventKeys[name];
  const eventNs = eventNSKeys[ns];
  if (eventName === undefined) {
    throw SyntaxError(`${name}不是正确的事件名称`);
  }
  if (eventNs === undefined) {
    throw SyntaxError(`${ns}不是正确的事件名称`);
  }
  return [eventName, eventNs];
}

export const eventNames: Record<ElementEvent, string> = {
  [ElementEvent.CLICK]: 'click',
  [ElementEvent.DOUBLE_CLICK]: 'dblclick',
  [ElementEvent.MOUSE_DOWN]: 'mousedown',
  [ElementEvent.MOUSE_UP]: 'mouseup',
  [ElementEvent.MOUSE_ENTER]: 'mouseenter',
  [ElementEvent.MOUSE_LEAVE]: 'mouseleave',
  [ElementEvent.MOUSE_MOVE]: 'mousemove',
  [ElementEvent.FOCUS]: 'focus',
  [ElementEvent.BLUR]: 'blur',
  [ElementEvent.CHANGE]: 'change',
  [ElementEvent.INPUT]: 'input',
  [ElementEvent.SUBMIT]: 'submit',
  [ElementEvent.KEYDOWN]: 'keydown',
  [ElementEvent.KEYUP]: 'keyup',
  [ElementEvent.KEYPRESS]: 'keypress',
  [ElementEvent.SCROLL]: 'scroll',
  [ElementEvent.TOUCH_START]: 'touchstart',
  [ElementEvent.TOUCH_MOVE]: 'touchmove',
  [ElementEvent.TOUCH_END]: 'touchend',
  [ElementEvent.TOUCH_CANCEL]: 'touchcancel',
  [ElementEvent.LOAD]: 'load',
  [ElementEvent.ERROR]: 'error',
};

export const eventNSNames: Record<ElementEventNS, string> = {
  [ElementEventNS.VARS]: 'vars',
  [ElementEventNS.ASSIGNMENT]: 'assignment',
  [ElementEventNS.OPEN]: 'open',
  [ElementEventNS.ALERT]: 'alert',
  [ElementEventNS.SCROLL_TO]: 'scroll-to',
  [ElementEventNS.VISIBLE]: 'visible',
  [ElementEventNS.CLASS]: 'class',
  [ElementEventNS.CSS]: 'css',
  [ElementEventNS.ATTRS]: 'attrs',
  [ElementEventNS.DATASET]: 'dataset',
  [ElementEventNS.CONTENT]: 'content',
};

const eventKeys: Record<string, ElementEvent> = fromPairs(
  Object.entries(eventNames).map(([a, b]) => [b, parseInt(a, 10)]),
);

const eventNSKeys: Record<string, ElementEventNS> = fromPairs(
  Object.entries(eventNSNames).map(([a, b]) => [b, parseInt(a, 10)]),
);
