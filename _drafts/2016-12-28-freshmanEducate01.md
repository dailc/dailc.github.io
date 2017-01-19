---
layout:     post
title:      新人教学系列(一)
category: blog
tags: 新人教学
favour: 新人教学
description: 新人教学系列中实际过程记录。篇章(一)
---

## 说明

> 本系列文档是新人教学系列中实际过程记录。主要目的为:渐进式，教导一个新人学会主动分析解决问题。

*(部分语言存在艺术加工，但是整体流程没有变)*

## 原始问题描述

### 代码
	
	<body>
		<script>
			var input = document.getElementById('input');
			function getValue(){
				console.log(input.value);
			}
		</script>
		<input id="input" />
		<button onclick="getValue()">获取值</button>
	</body>

### 描述
上述代码本来是想要实现这样一个需求:

* 点击button，输出input的值

但是，由于是新人写代码，所以使用了上述这种代码方式，实际执行时才发现，报错:`Uncaught TypeError: Cannot read property 'value' of null`

那么，接下来为了解决这个问题，发生了如下步骤的情况。


## 第一话

### 新人
报错了

	var input = document.getElementById('input');
	...
	console.log(input.value);//报错

### 导师
报什么错？

### 新人
`input.value`报错了，`cannot read property 'value' of null`

### 导师
首先得分析这是什么问题:

* 得确定input是否存在

* 单独打印下input试试

### 新人
input为null，为什么会这样呢？

### 导师
听说过雅虎的Web优化原则么?

### 新人
不知道。没听过。。。

### 导师
。。。
所有的script放body最后面，你用这个原则试试呢？  然后你会发现可以用了的。

按照这个改了后，试了能用后     去找找原因呢。为什么前面不行，后面行。
然后找到后告诉我，或者找不到也可以问我。

## 第二话

### 新人
不清楚原因，还是麻烦告诉我吧。

### 导师

* 首先现在script放到后面后是不是已经能正常用了？

* 然后现在你这样做:
	* 将script再度放到body前面
	* 把所有的代码统一放到window.onload里面
	```
	window.onload = function(){
		//todo
	};
	```

* 成功的话，再找找原因呢？为什么这样可以，可以去搜一下关键字的，找到后可以告诉我，找不到也可以问我。

### 新人
这样不行，以下代码放在window.onload中，会报错`getValue is not defined`

	window.onload = function(){
		var input = document.getElementById('input');
		function getValue(){
			console.log(input);
			console.log(input.value);
		}
	};
	
### 导师
遇到问题就慢慢分析

* 为什么上述中放到window.onload中时，函数`getValue`找不到？
* 如何才能正常在window.onload里面用到`getValue`函数。

现在你试试将`getValue`改成`window.getValue=function(){...}`试试呢？

### 过了一段时间
...

### 导师
怎么样，现在能用了么？

### 新人
可以

## 第三话

### 导师
那你现在知道了前面两个主要问题的原因了么？	
*PS:你还记得是哪两个问题么？*

### 新人

* 为什么用onload可以获取到input
* 还有脚本放在下面可以获取到input

### 导师
实际上，不全对，这两个是同一个问题。这个是问题一。

那现在你知道了问题一的原因么？

* script放前面，且不用window.onload时，无法找到input dom对象
* script放前面，且放到window.onload时，可以使用input dom对象
* script放后面，且不用window.onload时，可以使用input dom对象

### 新人
嗯，知道了

* 页面加载的执行顺序是从上到下的；
* window.onload的事件是必需页面全部加载完成才执行的，所以放上放下无所谓，都要等页面加载完才调用；
* 同1，先加载完页面--执行脚本，遵循从上到下的执行顺序

那为什么要用以下代码呢？

	window.getValue = function(){
		//todo
	};
	
为什么直接写出`function getValue(){}` 不行？

### 导师
简单的来说，可以先这样理解。

另外，下面那个是属于第二个问题，我们慢慢分析。

## 第四话

### 导师
接下来开始分析第二个问题。
如果要你自己去分析 这两种方式造成不同结果的原因(window.与function)。你会有什么样的思路？

### 新人
。。。没思路，问百度把。看window.的用法有没有什么局限或规定

### 导师
那我先提供一个简单的思路呢。

	<body>
		<input id="input" />
		<button onclick="getValue()">获取值</button>
		<button onclick="getValue2()">获取值2</button>
		<button onclick="getValue3()">获取值3</button>
		<script>
			function getValue() {
				console.log(input.value);
			}
			window.onload = function() {
				var input = document.getElementById('input');
				window.getValue2 = function(){
					console.log(input.value);
				};
				function getValue3() {
					console.log(input.value);
				}
			};
		</script>
	</body>
	
这样试试呢？看看自己能发现什么？

## 第五话

### 导师
怎么样？现在有发现 这三个函数不同的地方？

### 新人
好像onclick写法必须是`window.getValue=function(){}`这样写，不然检索不到。会报这个is not defined ；

为啥html检索不到？

### 导师
你试着在以前代码后面加上如下代码呢？

	...
	setTimeout(function(){
		console.log(window.getValue);
		console.log(window.getValue2);
		console.log(window.getValue3);
	},300);
	
那么现在你有发现什么呢？

### 新人
undefined与is not defined不一样嘛

没。

### 导师
这里可以直接解释:

* 这个"undefined"是你在输出时`window.getValue3`的值。
	*(这时候window对象存在，window.getValue3不存在，所以输出默认值undefined)*
* is not defined则是报错内容，就比如你调用 a.b  但是a本身就不存在，这时候就会抛出错误，a is not defined

那么继续分析，getValue和getValue3的最大区别是什么？

### 新人
window.getValue存在，window.getValue3不存在

### 导师
这是在结果上而言。那么在代码层次呢。这两个函数最大的不同在哪里？

### 新人
不知道

### 导师
。。。以前有学过其它编程语言么？*(如c,c++,java等)*，有听说过“变量作用域”么？

### 新人
没学过*(非科班出身)*。

听说过，是局部变量与全局变量么？

你的意思是getValue是全局变量，getValue3是局部变量？

### 导师
简单的来说，可以这样理解:

* getValue是一个全局变量
* getValue3是一个局部变量
* html dom里的onclick默认只会找全局变量

好吧，接下来继续分析其它问题。

### 未完待续
...

## 原文地址
原文在我个人博客上面

[新人教学系列(一)](https://dailc.github.io/2016/12/28/freshmanEducate01.html)
