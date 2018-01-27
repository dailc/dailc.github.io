# 石墨文档面试记

## 一面

大致问题：

- 面试官主动提出的： github上的下拉刷新，quickhybrid介绍

    - onScroll，touch，以及手势判断
    
    - iOS的回弹bug

- 自己主动引发的：（由minirefresh引发）

    - 浏览器进程，线程，JS单线程
    
    - 浏览器渲染，Layout，Recalculate ，reflow，Update layer tree
    
    - css首屏渲染，关键渲染路径（白屏时间过长的问题），CSS inline（内联优化，防止样式丢失等），css合并，CDN缓存
    
    - css文档流，absolute，translate3d的区别？包括复合图层，简单图层
    
    - HTTP数量的限制-5个，可以多个域名（因为它是由域名决定的）
    
    - http headers：Cache-Control，content-type。OPTIONS，referer，CSRF，CORS，cookie（跨域cookie）
    
    - XMLHTTPRequest，ES6 fetch，promise
    
- 最后算法。。。

    - [3, 2, 5, 4, 6, 8]，寻找丢失的x，`n < x < m`，一个等差数列求和而已，可惜一紧张想了很久，不过仍然弄出来了
    
    - [2, 3, 5, 3, 2, 1, 4, 6]，6,tow sum，不能有重复。一紧张思路忘了，用暴力法解了。实际上应该是map映射法
    

总结，心态很重要。一紧张，只能发挥60%。其次，要尽量往自己擅长的方向引。
es6一些关键API得掌握

## 二面

大致问题：

- 面试官主动问的：

    - github上的quickhybrid，主要谈架构（需要注意从更高层级的角度上展开），
    下次要尽量从架构角度思考，这一块要自我补充下
    
        - rollup与webpack稍微提了下
        
        - mocha单元测试稍微提了下
    
    - 代码白板手写（石墨协作）：
 
1.实现这样一个功能：（传入一个type后。可以进行选择，并且返回）

```js
const result = target(type)
.match('add', () => {
  return '+';
})
.match('substract', () => {
  return '-';
})
.others(() => {
  return '?'
});
```

现场答案（不一定最优）：

```js
function Target(type) {
    this.type = type; 
    this.isMatch = false;
    this.matchValue;
}
Target.prototype = {
    match: function(type, fn) {
        if (this.type === type) {
            this.isMatch = true;
            this.matchValue = fn && fn();
        }
        return this;
    },
    others: function(fn) {
        if (!this.isMatch) {
            this.matchValue = fn &&  fn();
        }
        
        // 最后一个返回选择值
        return this.matchValue;
    }
};

const target = function(type) {
    return new Target(type);
};
```

2.代码实现
```js
e(d(c(b(a(1, 2, 3)))))

flow([
  a,
  b,
  c,
  d,
  e
])(1, 2, 3);
```

实现 flow，达到上述效果

现场手写

```js
function flow(funcs) {
    // 暂时不做容错
    const len = funcs.length;
    
    return function() {
        let currRes = funcs[0].apply(null, arguments);
        
        for (let i = 1; i  < len; i--) {
            currRes = funcs[i](currRes);
        }
        
        return currRes;
    };
}
```

3.代码

```js
// pure function
1 => 2
2 => 4
```

实现：

```js
// push([], 1) => [1]
// push([1], 2) => [1, 2]
```

现场手写（其实主要是immutable）

```js
function push(arr, element) {
    return arr.slice(0).push(element);
}
```

其它问题：

- 数组有哪些方法（生成新数组）：slice，concat

- some和every的区别，some返回后会继续么（这点答错了，实际上返回true后不会再执行）

- promise的一些API用法，all，catch，then等

- es7的await（同步promise），以及是否可以try-catch这个块？

- 问到了网页优化这一块：稍微提了下渲染流程，资源合并，下载多域名优化等
实际上可以再加上精灵图之类的

- pwa的一些认识，稍微谈了下

最后，谈了下未来的计划：
回答vue源码重现，react源码重现，基础知识整理

一些问题：

- valueOf对于对象无法隐式转换的问题研究（现场第一题目时第一想法是改valueOf，但失败了）

- http2.0（这点当时短路了，没想起来）

## 三面-技术领导面

介绍了下在这个公司最后意思的工作: 其实可以回答成果是 hybrid框架以及移动前端框架

介绍了下hrybid的选型,迭代之路
介绍了下移动前端框架选型迭代,以及现实原因的一些痛楚,
譬如缺少工程化,规范无法强制要求,导致代码质量不可控

后续可以思考下:与vue相比,m7的缺点?譬如大量滥用DOM,影响性能

介绍了下mvvm的原理-稍微便底层的有些没答出，还需恶补下，近来正好可以写一篇文章

然后css处,BFC合并,以及margin:50%是基于父元素的宽50%还是高的(宽,因为高度的话可能会有overflow:hidden等因素限制,导致无法计算精确,反而宽度是最容易的)

为什么BFC会有这种规则?浏览器的原理,规定着BFC就会有这些规则

问了下单元测试,大概答了下自己使用过karma+mocha+chai

typescript是否了解

问了下webpack,rollup,gulp的大概区别

rollup的核心-tree-shaking,没能答出大概原理,以及是否适用于es5?

核心是利用export,必须基于es6的模块化,因此不适用于es5
基于ES6 modules 的静态特性才得以实现的,
因为ES6 modules 的 import 和 export statements 相比完全动态的 CommonJS require，有着本质的区别

https://www.zhihu.com/question/41922432

// 方向
react redux react-native nodejs
// 应该去向
业务组-前端