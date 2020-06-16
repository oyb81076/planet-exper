import { NodeTypes, IDirectiveJavascript } from '../ast';
import { IContext } from '../parse/faces';

export default function processJavascript({ directives }: IContext, content: string): void {
  directives.javascript = {
    type: NodeTypes.DIRECTIVE_JAVASCRIPT,
    content,
  };
}
export function srzJavascript(dir: IDirectiveJavascript): string {
  return dir.content;
}
