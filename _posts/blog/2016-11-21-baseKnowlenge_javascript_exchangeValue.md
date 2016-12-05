---
layout:     post
title:      JS几种变量交换方式以及性能分析对比
category: blog
tags:  javascript 基础知识 性能分析 变量交换
favour: 变量交换
description: JS几种数值交换方式分析比较,包括tmp变量交换,加减法，异或，数组法等

---

## 前言
“两个变量之间的值得交换”，这是一个经典的话题，现在也有了很多的成熟解决方案，本文主要是列举几种常用的方案，进行大量计算并分析对比。

## 起由
最近做某个项目时，其中有一个需求是交换数组中的两个元素。当时使用的方法是:

```
arr = [item0,item1,...,itemN];
//最初使用这段代码来交换第0个和第K(k<N)个元素
arr[0] = arr.splice(k, 1, arr[0])[0];
```
当时觉得这种方法很优雅，高逼格。。。

后来，业余时间又拿这个研究下了，顺带自己写了个分析工具，和普通方式进行对比。

结果，大大的出乎我的意料，这种方式的效率比我想象的要低的多。以下是其中一个测试结果的图

![](https://dailc.github.io/jsPerformanceAnalysis/staticresource/performanceAnalysis/demo_js_performanceAnalysis_jsexchangevalue_3.png)

于是,基于这点，又研究了下其它的几种数值交换的方式，一起整合进入了分析工具中，才有了本文的这次总结。

## JS变量交换的几种方式
其实关于JS的变量交换，使用最广泛的几种方式基本已经是前端人员必备的技能了，本文正好借此分析研究的契机，列举了本次分析中用到的几种交换方式:

### 第一种:普通临时变量交换方式
适用性: **适用于所有类型**
代码如下:

``` 
tmp = a;
a = b;
b = tmp; 
```
简要说明:
这是用到的最广泛的一种方式，经实战测试分析，性能也很高

(在JS中,这种方式效率确实很高，而且就算是其它语言中，只要tmp变量提前创建，性能也不会很低，反而是一些杂技派和少数派性能方面很低)

基本上可以说: **经典的才是最优雅的**

### 第二种:利用一个新的对象来进行数据交换
适用性: **适用于所有类型**
代码如下:

```
a = {a : b, b : a};
b = a.b
;a = a.a;
```
简要说明:
这种方式在实战中应用的很少

### 第三种:利用一个新的数组来进行数据交换
适用性: **适用于所有类型**
代码如下:

```
a = [b, b=a][0];
```
简要说明:
这种方式在各大论坛中都有看到有人使用，但经测试实际性能并不高

### 第四种:利用数组交换变量**(需EJS支持)**
适用性: **适用于所有类型**
代码如下:

```
`[a, b] = [b, a];
```
简要说明:
这也是在ES6出来后看到有人用的，实际在现有的浏览器中测试，性能很低

### 第五种:利用try catch交换
适用性: **适用于所有类型**
代码如下:

```
a=(function(){;
    try{return b}
    finally{b=a}}
)();
```
简要说明:
这种方法应该是基本没人使用的，也没有什么实用性，而且性能也是属于在各种方法中垫底的

### 第六种:异或操作交换变量第一种方式
适用性: **适用于数字或字符串**
代码如下:

```
a = (b = (a ^= b) ^ b) ^ a;
```
简要说明:
异或方法在数字或字符串时用到的比较普遍，而且性能也不低

### 第七种:异或操作交换变量第二种方式
适用性: **适用于数字或字符串**
代码如下:

```
a ^=b;
b ^=a;
a ^=b;
```
简要说明:
异或方法在数字或字符串时用到的比较普遍，而且性能也不低

### 第八种:数字之间的加减运算来实现，第一种加减方式
适用性: **仅适用于数字**
代码如下:

```
a = a + b;
b = a - b; 
a = a - b; 
```
简要说明:
这种用法在只用于数字间的交换时，性能也不弱

### 第九种:数字之间的加减运算来实现，第一种加减方式
适用性: **仅适用于数字**
代码如下:

```
a = b -a +(b = a);
```
简要说明:
这种用法在只用于数字间的交换时，性能也不弱

### 第十种:利用eval计算
适用性: **仅适用于数字和字符串**
代码如下:

```
eval("a="+b+";b="+a);
```
简要说明:
这种方式仅用于研究，实战慎用

**这种模式执行一万次耗时等于其它执行一亿次...**

### 第十一种:数组中，利用splice交换两个元素的位置
适用性: **仅适用于数组元素**
代码如下:

```
arr[0] = arr.splice(2, 1, arr[0])[0];
```
简要说明:
这种方式看起来挺优雅的，但实际上性能远远比不上临时变量那种

## 各种交换方式的性能对比
上述列举了几种方式都有一一做过对比分析，基本上可以得出的结论是: 

**还是老老实实的用回临时变量交换吧，经典，优雅，而且保证不会出什么幺蛾子**

### 性能对比截图

#### 分析结果1
以下截图中的数据是，在chrome中运行了一亿次后得出的结论*(每次运行100万次,一共100个循环，得到的分析结果)*
![](https://dailc.github.io/jsPerformanceAnalysis/staticresource/performanceAnalysis/demo_js_performanceAnalysis_jsexchangevalue_4.png)
可以看出,tmp变量交换最快,try catch最慢

#### 分析结果2
以下截图数据是，在chrome (支持es6)中运行了100万次后得出的结论*(每次运行1万次,一共100个循环，得到的分析结果)*
![](https://dailc.github.io/jsPerformanceAnalysis/staticresource/performanceAnalysis/demo_js_performanceAnalysis_jsexchangevalue_5.png)

![](https://dailc.github.io/jsPerformanceAnalysis/staticresource/performanceAnalysis/demo_js_performanceAnalysis_jsexchangevalue_3.png)
可以看出,eval最慢,splice性能较低，tmp变量交换很稳定

## 分析工具示例Demo
如下demo中可以使用分析工具进行 JS变量交换方式分析对比

[JS几种变量交换方式分析比较](https://dailc.github.io/jsPerformanceAnalysis/html/performanceAnalysis/demo_performanceAnalysis_jsexchangevalue.html)

## 原文链接
同步更新到了我个人博客上

[JS几种变量交换方式以及性能分析对比](https://dailc.github.io/2016/11/21/baseKnowlenge_javascript_exchangeValue.html)

## 参考 
[Exchange Variables Gracefully](https://jsperf.com/exchange-variables-gracefully/2)