# 变量命名规范
用户自定义变量必须以'$'开头
编译器使用的临时变量以_开头
公共变量为字母开头

# 指令顺序
x-find-*,x-each,x-if,x-html,x-text

## x-html
```html
<div x-html="'<div style=&quot;color:blue&quot;>Blue Text</div>'">static html</div>
<div x-html="some_identity_html">identity html</div>
```

## x-if 
```html
<div x-if="current==1;true">if </div>
```

## x-each 指令 用于循环
```html
<li x-each="users:{item=$user,stat}" x-text="stat.count + $user.data.name"></li>
```

## x-find-one
```html
<div x-find-one="db=5edf0ae4ba3500b4593eb148,id=query.id:$user">
  <div x-if="!$user">用户不存在</div>
  <div x-if="$user" x-text="$user.id">id</div>
  <div x-if="$user" x-text="$user.data.name">欧阳斌</div>
  <div x-if="$user" x-text="pt.date_format($user.timestamp,'YYYY年MM月DD日HH时mm分')">创建日期</div>
</div>
```
## x-find-page
```html
<div x-find-page="db='5edf0ae4ba3500b4593eb148',query='data.nickname=${query.nickname}&index=${query.index}&count=20':{total=$total,size=$size,index=$index,rows=$users}">
  <table>
    <thead>
      <tr>
      </tr>
    </thead>
  </table>
  <div x-pagination="query=query,indexName='index',index=$index,size=$size,total=$total=$compiled;{index:10,size:20,total:200}">
    <a x-pagination-to="compiled=$compiled,to='first':{active=$active,url=$url};{active:true}"
      x-class="{active=$active}"
      x-href="$url">首页</a>
    <a x-pagination-to="compiled=$compiled,to='prev':{active=$active,url=$url}"
      x-class="{active:$active}"
      x-href="$url">上页</a>
    <div x-pagination-links="compiled=$compiled,size=20,border=1:{starts=$starts,links=$links,ends=$ends}">
      <a x-each="$starts:{item=$item}" x-href="$item.url" x-text="$item.text" x-class="{active:$item.active}">1</a>
      <span x-if="pt.isNotEmpty($starts)">...</span>
      <a x-each="$links:{item=$item}" x-href="$item.url" x-text="$item.text" x-class="{active:$item.active}">1</a>
      <span x-if="pt.isNotEmpty($ends)">...</span>
      <a x-each="$ends:{item=$item}" x-href="$item.url" x-text="$item.text" x-class="{active:$item.active}">1</a>
    </div>
    <a x-pagination-to="compiled=$compiled,to='prev':{active=$active,url=$url}" x-class="{active=$active}" x-href="$url">
      下页
    </a>
    <a x-pagination-to="compiled=$compiled,to='prev':{active=$active,url=$url}" x-class="{active=$active}" x-href="$url">
      末页
    </a>
  </div>
</div>
```
