# 今日头条面试记

## 在线面试

2018/03/11上午10:30开始，总共持续2小时，分两次（两个面试官），
第1面是技术相关，第2面更多的是介绍项目，以及对项目推动，产品等一些看法

### 一面

持续1个多小时

- 首先是自我介绍

主要介绍自己的经验，职责，成果等

- 第一问：问了一个this指针的问题

```js
var foo = {
  bar() { console.log(this) },
  bar2: () => console.log(this)
}

foo.bar()  // foo对象
foo.bar2() // 非严格下：window，严格下：undefined

var bar = foo.bar
bar() // 非严格下：window，严格下：undefined
```

这一部分介绍了几个知识点：

```js
- 普通this的回溯

- 箭头函数内部没有this

- 严格模式下和非严格模式下的函数默认指向不一样

- 以及严格模式下有些什么（原因？为了向ES6过度，有一些规则，譬如with不用，变量必须声明等）
```

- 第2问：问了prototype，__proto__继承问题

大概回答了，核心是基于`[[prototype]]`（__proto__），譬如

```js
var a = {};

a.__proto__ === Object.prototype; // true
```

就是默认会基于`__proto__`回溯

而`new Foo()`内部发生的大概是：

```js
var obj = {}；

obj。__proto__ = Foo.prototype;

Foo.apply(obj, arguments)
```

- 第3问：自适应正方形，宽等于父元素的宽，高等于自己的宽

回答是（有误）：

```js
width: 100%
height: 100%
```

当时解释说：宽度100%是基于父元素的宽的，高度100%也是基于父元素宽的，
但是实际验证下来，并不是，高度100%是基于父元素的高的？

结果：

```html
<div class="parent">
    <div class="child">
        
    </div>
</div>
```

```js
.parent {
    background: red;
    width: 200px;
    height: 400px;
}
            
.child {
    background: blue;
    width: 100%;
    height: 100%;
}
```

结果子元素的高度是`200px`，宽度是`100px`

为何？

```js
因为如果父元素具有高度，那么height: 100%就是父元素的高度
如果父元素没有具体的高度，那么100%相当于是缺省值auto，自动计算了
```

最终发现：

```js
子元素竖向的margin，padding这种是基于父元素宽度计算的
但是height这种是基于父元素的高度的
```

如何自适应正方形？（基于body） :

```js
.parent {
    background: red;
    width: 100%;
    height: 100vw;
    /*
     * 或者
     height:0;
     padding-bottom: 100%;
     */
}
```

- 第4问：DOM事件

说了下捕获以及冒泡机制

```js
parent(捕获) -> child(捕获) -> child(冒泡) -> parent(冒泡)
```

以及addEventlistener的传入参数：（漏掉了options，wantsUntrusted参数）

```js
dom.addEventlistener('click', func, options, useCapture, wantsUntrusted);

options包括：
capture:  Boolean（表示 listener 会在该类型的事件捕获阶段传播到该 EventTarget 时触发）
once:  Boolean（表示 listener 在添加之后最多只调用一次）
passive: Boolean（表示 listener 永远不会调用 preventDefault()）

wantsUntrusted：
如果为 true , 则事件处理程序会接收网页自定义的事件（此参数只适用于 Gecko）
```

是否所有的dom事件都会冒泡？

并不是，譬如focus之类的就不会

- 第5问：对es6的了解

列举了几个：`Class 箭头函数 Promise`

本来是想介绍Promise是属于mictask的，但是并没有被深入，而是出了一个题目

```js
new Promise(resolve => {
    console.log(1);
    resolve(3);
    Promise.resolve().then(()=> console.log(4))
}).then(num => {
    console.log(num)
});
console.log(2)
```

回答的时候，`Promise.resolve().then...`顺序没有弄对，搞错了，实际的结果是：

```js
1
2
4
3
```

分析：

```js
总体顺序：
宏任务->微任务->浏览器->下一轮宏任务

同步输出1（promise的函数默认执行）
mictask队列添加（在函数执行完毕后，resolve(3)-会在下一次then时生成一个新的promise，进入链式调用）
Promise.resolve().then，mictask直接添加这个任务（顺序比下一次then时早）
同步输出2

执行mictask，
里面依次是Promise.resolve().then，resolve对应的then
```

关键：

- Promise.resolve生成一个解析特定值后的promise对象

- 顺序为，先将Promise.resolve().then加入mictask，然后return后再讲resolve对应的then加入mictask

- 第6问：同源策略

讲了下浏览器的同源策略，ajax跨域，iframe跨域

以及cors(jsonp,ping)等解决跨域的方案

以及cookie域名拆分的优化方案

并将cors方案的原理解释了一遍：

```js
ajax（复杂） -> options(orign) -> (allow-headers, allow->method, allow->oprigin)
    
-> post
```

主要需要服务端进行配置解决

并且ajax跨域时默认不会带cookie，需要开启配置`credential`，并且开启配置时`origin`不能为`*`

- 第7问：算法题，括号的匹配

```js
isBalanced('}{')                      // false
isBalanced('{{}')                     // false
isBalanced('foo { bar { baz } boo }') // true
isBalanced('foo { bar { baz }')       // false
isBalanced('foo { bar } }')           // false

isBalanced('(foo { bar (baz) [boo] })') // true
isBalanced('foo { bar { baz }')         // false
isBalanced('foo { (bar [baz] } )')      // false
```

分析了后写了一个算法，但是比较紧张，有些因素不够谨慎，没有周全

```js
function isBalanced(str) {
    const len = str.length;
    const stack = [];
    
    for (let i = 0; i < len; i++) {
        const ch = str.charAt(i);
        
        if (ch === '{' || ch === '[' || ch === '(') {
            stack.push(ch);
        } else if (ch === '}' || ch === ']' || ch === ')' ) {
            const left = stack.pop();
            
            if (ch === '}' && left !=== '{') {
                return false;
            } else if (ch === ']' && left !=== ']') {
                return false;
            } else if (ch === ')' && left !=== ')') {
                return false;
            }
        }
    }
    return stack.length === 0;
}
```

有失误，就是在`ch === '}' && left !=== '{'`判断时，眼拙，把`}`和`{`看成一样的了，经过提醒才发现

- 之后，聊了下项目，譬如下拉刷新，以及遇到的问题

没有展开说了，大致说了下iOS下的回弹，3d加速解决之类的

还提了下chrome浏览器自带的下拉刷新？（但是没什么印象，自己更多的是基于webview那种）

最后的问题：问了下这次面试的建议，觉得发挥有问题

大致评价了：手写算法这一块，以及es6新特性这一块需要加强（确实失误弄错了几个细节）

问了下技术栈，回答：前端vue，后端有用node.js的

总的来说：
现场面试确实有压力，没有考虑那么周全，
es6里的细节又除了点错，导致了发挥不是很好

而且，关键的是，自己提到的3d加速，复合层，mictask，js运行机制等都没有被展开，
自己熟悉的领域没有发挥，自己的优势是知识体系，没有展现出来，没有形成一个闪光点，比较遗憾

### 二面

紧接着的，那时都赶着吃饭了，导致了多细节没展开，最后问题也没问，
以及项目经验介绍时考虑的不够周全，比较遗憾

这一面没有问技术细节，基本都是：

- 介绍几个拿得出手的项目

这里介绍了两个框架（因为自己在这个公司的的主要成果）

- 详细展开下hybrid框架

大致介绍了下，API规范，框架架构之类的

- 以及推广项目的经历

介绍了下推vue失败，最终推广了m7的成果

以及说了下如果再来一次，该如何评审

- 问了下页面交互

介绍了下工作上这方面不足，然后展开了几个细节讨论

- 问了下页面优化

说明了下没有实践，但是自己整理过，知道有一些方法

但是没有被深入问下去了，没能展示。。。

- 问了下技术栈

大致说了下以前端技术为主，以js原理为主（更多的是底层机制，运行机制，框架源码），这样更容易上手新知识

以及后端会一点（譬如java web，node.js都是尝试过，练习过，做过简单项目）

最终比较匆忙的结束了面试，吃饭去了

最终，被告知工作背景（传统软件公司，没有互联网背景）和工作经验（偏移动hybrid，服务于项目，产品优化方面不足）可能不是很符合要求。。。

总结：这次失利的几个原因：

- 工作背景与经验与JD有一点差距（要求上是最后有产品实践经验的）

- 最重要的是，自己的优势没有展现出来（譬如知识体系完整，很多JS原理级别的都有研究，坚持博客，开源，业余坚持学习等等），没有闪光点，导致可能会被认为：
技术还勉强可以，但是没有亮点，然后经历有点不符合，于是pass了

所以重要的是：找住机会，推销自己的优势，形成闪光点，这样才能打动
（这次虽然埋了很多的点，譬如3d加速，复合层，js运行机制，微任务之类的词，
但有可能面试官不是很熟悉，或者说不愿意展开，所以导致了没有机会往深处拓展，
从而优势无法展现，反而那几次失误以及工作经历，背景形成了劣势）