# rfc Directive
# 指令
## 仅输入的指令
x-if="active"
## 输入输出指令
x-{directive}="...input"
x-{directive}="...{input};{mock}"
x-{directive}="...{input};{mock}"
x-{directive}="...input:{...output};{mock}"
x-each="users:{item,stat};10"
x-if="active;true"

x-{directive}="paramName=paramValue,....:{output:aliasName,...};effective"
x-if="true" 是 x-if="value=true" 的缩写

x-find-many="db='5edf0ae4ba3500b4593eb148',limit=20:users"

x-find-page="db='5edf0ae4ba3500b4593eb148',query='index=${query.index}&count=20':{total,size,index,rows:users}"
x-find-page="db='5edf0ae4ba3500b4593eb148',query='index=${query.index}&count=20':pageData"
