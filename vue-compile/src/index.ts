import { parse, compile } from '@vue/compiler-dom';
import { PlainElementNode } from '@vue/compiler-core'
const content = `
<div class="base" v-if="a > 2">IF</div>
<div class="base" v-else-if="a > 2">Else IF</div>
`
_compile();
function _parse(){
  const node = parse(content)
  const div = node.children[0] as PlainElementNode;
  console.log(div)
}
function _compile(){
  const { ast, code } = compile(content);
  console.log(ast)
  console.log(Array(60).fill('/').join(''))
  console.log(code)
}
