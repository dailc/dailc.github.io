---
layout:     post
title:      JS几种数组遍历方式以及性能分析对比
category: blog
tags:  javascript 基础知识 性能分析 数组遍历
favour: 数组遍历
description: JS中几种常用数组遍历方式分析比较,包括for循环,for in，foreach，map法等

---

## 前言
这一篇与上一篇 [JS几种变量交换方式以及性能分析对比](https://dailc.github.io/2016/11/21/baseKnowlenge_javascript_exchangeValue) 属于同一个系列，本文继续分析JS中几种常用的数组遍历方式以及各自的性能对比

## 起由
在上一次分析了JS几种常用变量交换方式以及各自性能后，觉得这种方式挺好的，于是抽取了核心逻辑，封装成了模板，打算拓展成一个系列，本文则是系列中的第二篇，JS数组遍历方式的分析对比

## JS数组遍历的几种方式
JS数组遍历，基本就是for,forin,foreach,forof,map等等一些方法，以下介绍几种本文分析用到的数组遍历方式以及进行性能分析对比

### 第一种:普通for循环

代码如下:

``` 
for(j = 0; j < arr.length; j++) {
   
} 
```
简要说明:
最简单的一种，也是使用频率最高的一种，虽然性能不弱，但仍有优化空间

### 第二种:优化版for循环

代码如下:

``` 
for(j = 0,len=arr.length; j < len; j++) {
   
}
```
简要说明:
使用临时变量，将长度缓存起来，避免重复获取数组长度，当数组较大时优化效果才会比较明显。

**这种方法基本上是所有循环遍历方法中性能最高的一种**

### 第三种:弱化版for循环

代码如下:

``` 
for(j = 0; arr[j]!=null; j++) {
   
}
```
简要说明:
这种方法其实严格上也属于for循环，只不过是没有使用length判断，而使用变量本身判断

**实际上，这种方法的性能要远远小于普通for循环**

### 第四种:foreach循环

代码如下:

``` 
arr.forEach(function(e){  
   
});
```
简要说明:
数组自带的foreach循环，使用频率较高，实际上性能比普通for循环弱

### 第五种:foreach变种

代码如下:

``` 
Array.prototype.forEach.call(arr,function(el){  
   
});
```
简要说明:
由于foreach是Array型自带的，对于一些非这种类型的，无法直接使用(如NodeList)，所以才有了这个变种，使用这个变种可以让类似的数组拥有foreach功能。

实际性能要比普通foreach弱

### 第六种:forin循环

代码如下:

``` 
for(j in arr) {
   
}
```
简要说明:
这个循环很多人爱用，但实际上，经分析测试，在众多的循环遍历方式中

**它的效率是最低的**

### 第七种:map遍历

代码如下:

``` 
arr.map(function(n){  
   
});
```
简要说明:
这种方式也是用的比较广泛的，虽然用起来比较优雅，但实际效率还比不上foreach

### 第八种:forof遍历(需要ES6支持)

代码如下:

``` 
for(let value of arr) {  
   
});
```
简要说明:
这种方式是es6里面用到的，性能要好于forin，但仍然比不上普通for循环

## 各种遍历方式的性能对比
上述列举了几种方式都有一一做过对比分析，基本上可以得出的结论是: 

**普通for循环才是最优雅的**

*(PS:以上所有的代码都只是进行空的循环，没有再循环内部执行代码，仅仅是分析各自循环的时间而已)*

### 性能对比截图

#### 分析结果1
以下截图中的数据是，在chrome (支持es6)中运行了100次后得出的结论*(每次运行10次,一共10个循环，得到的分析结果)*
![](https://dailc.github.io/jsPerformanceAnalysis/staticresource/performanceAnalysis/demo_js_performanceAnalysis_jsarrayGoThrough_1.png)

可以看出,forin循环最慢。优化后的普通for循环最快

#### 分析结果2
以下截图数据是，在chrome (支持es6)中运行了1000次后得出的结论*(每次运行100次,一共10个循环，得到的分析结果)*
![](https://dailc.github.io/jsPerformanceAnalysis/staticresource/performanceAnalysis/demo_js_performanceAnalysis_jsarrayGoThrough_2.png)

## 分析工具示例Demo
如下demo中可以使用分析工具进行 JS数组遍历方式分析对比

[Js中几种常用数组遍历方式分析比较工具](https://dailc.github.io/jsPerformanceAnalysis/html/performanceAnalysis/demo_performanceAnalysis_jsarrayGoThrough.html)

## 原文地址
原文在我个人博客上面

[JS几种数组遍历方式以及性能分析对比](https://dailc.github.io/2016/11/25/baseKnowlenge_javascript_jsarrayGoThrough.html)

