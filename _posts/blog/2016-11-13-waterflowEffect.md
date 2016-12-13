---
layout:     post
title:      网页瀑布流效果实现的几种方式
category: blog
tags: 瀑布流 javascript css 效果展示
favour: 瀑布流

description: 网页实现瀑布流效果的几种实现,包括js元素实现瀑布流效果，css3实现瀑布流效果等
---

## 前言

> like a mountain that is in our path,wo cannot complain that it is there,we simply have to climb it

## 起由
最近,在搭建个人博客时，其中的Demo展示页面想用瀑布流形式展现，发现现有的js插件大多基于JQ的，而我稍微有点小强迫，不想基于JQ，于是就着手自己封装了一个。顺带就研究了下css3方式实现瀑布流，于是总结了下，写了几个示例demo，就有了本文。


## 几种常用的瀑布流介绍
一般瀑布流的实现常见有三种方式

* 传统的多列浮动
* css3样式定义
* js计算绝对布局

### 传统的多列浮动简介
首先固定屏幕中展示的列数，每一列中间的数据作为一组单独计算，插入数据时分别插入不同列中
优点:

* 布局最为简单,一般只依赖与一个浮动布局
* 不需要知道内容的高度，所以当有图片未加载时也不影响

缺点:

* 只适用于特定的屏幕，当屏幕size变化时，无法动态实现列数的更改
* 拓展不易

### css3样式定义瀑布流简介
利用css3中特有属性，在高级浏览器中实现瀑布流效果
优点:

* 直接使用css样式，最为简洁，不依赖于任何js
* 拓展方便，直接往容器内部添加内容即可
* 自适应，屏幕变化，布局也会变化
* 当各个item的宽度不一致时，这种方式也适用
* 像一些特殊的如固定的两列瀑布流也可以很方便实现(固定显示两列，每一列可以横着有多个item)

缺点:

* 需要高级浏览器支持(其实这个现在已经不算缺点了)
* 这种方式和普通瀑布流的原理有区别，不是分别往不同列中插入数据，而是先往一列中插入数据，达到一定高度后再往其它列中插入数据，有时候用这种方式会达不到预期效果(这个是比较关键的，这种方式有时候体验达不到预期)

### js计算绝对布局实现瀑布流简介
利用js，动态计算元素的插入位置，利用绝对布局absolute进行定位，根据屏幕的不同可以动态调整
优点:

* 便于拓展，方便数据的添加
* 自适应，屏幕变化，布局也会变化

缺点:

* 计算时需要知道内容高度，如果包含图片，需要等图片加载完毕再计算，否则会存在误差
* 各个item的宽度需要一致

**就实用性而言，传统的瀑布流比较适合业务场景较为单一的情况，比如手机中固定两列的情况，css3瀑布流布局由于有时候会造成一些不理想的局面，所以更多的被用在了面试题等上面，最后那张绝对布局的瀑布流方式是被应用的最为广泛的**

本文主要探讨css3瀑布流和绝对定位瀑布流的实现

## css3瀑布流的实现
这种实现方式是最为简单的，仅仅是基于css3的新属性(column-width或column-count)，

```
css3中增加了一个新的属性：column，来实现等高的列的布局效果。该属性有column-width宽度，column-count数量等，并且能根据窗口自适应。
```

css实现瀑布流分为两种效果，**普通横向瀑布流**与**固定列数的瀑布流**

### 普通横向瀑布流
这种瀑布流方式常常用于和js绝对布局方式比较，但是虽然从显示上来说，效果差不多，但是从用户体验的角度讲，这个不符合平常的习惯，以下是两种方式的效果图对比
![](https://dailc.github.io/showDemo/staticresource/waterfallflow/demo_js_waterfallflow_2.png)

#### 实现代码

```
.container{
		/*宽*/
        -webkit-column-width:200px;
        -moz-column-width:200px;
        -o-colum-width:200px;
        /*间距*/
        -webkit-column-gap:1px;
        -moz-column-gap:1px;
        -o-column-gap:1px;
    }
```

### 固定列数的瀑布流
这种布局用到比较少，但是某些面试题会经常提到，效果如下
![](https://dailc.github.io/showDemo/staticresource/waterfallflow/demo_js_waterfallflow_4.png)

#### 实现代码

```
.container{
        /*固定列*/
        /*-moz-column-count:2; 
		-webkit-column-count:2; 
		column-count:2;*/
        /*间距*/
        -webkit-column-gap:1px;
        -moz-column-gap:1px;
        -o-column-gap:1px;
    }
```

### 示例与源码
想看示例页面可以戳一戳 
[css3瀑布流效果](https://dailc.github.io/showDemo/waterfallflow/demo_waterfall_flow_css3.html)
源码可以查看
[https://github.com/dailc/showDemo/blob/master/waterfallflow/demo_waterfall_flow_css3.html](https://github.com/dailc/showDemo/blob/master/waterfallflow/demo_waterfall_flow_css3.html)


## js绝对布局瀑布流实现
这种实现方式是最为经典的，也是运营的最多的，网上也有很多的原生或jq插件，本文这里也用原生js重新封装了一个类库，方便调用，效果如图
![](https://dailc.github.io/showDemo/staticresource/waterfallflow/demo_js_waterfallflow_1.png)


### 实现思路
瀑布流的实现思路其实很简单，如下:

1. 获取元素容器的总宽度allWith, 每一个瀑布流元素的列宽度 itemWidth(如果大于allwidth,会有一个默认值替代)
2. 计算当前容器可以显示的列数 column  Math.floor(allwidth/itemWidth) 向下取整
3. 添加一个元素前，计算每一列当前的高度，寻找当前高度最小的列，然后根据列的序号k，确定item的left和top，lef=k*itemWidth top=当前列的高度，然后当前列插入这个元素，当前列的高度加上这个元素的高度
4. 所有元素插入完毕后，容器的高度会调整为最大列的高度
5. 初始化就是先读取页面的所有元素，然后一个一个插入，加载更多就是在已有的元素基础上，插入新的元素计算

### 实现代码
由于代码较为占用篇幅，这里就不再赘述，基本根据实现思路都能实现出来，也可以查看下面提供的源码链接

### 示例与源码
想看示例页面可以戳一戳 
[js瀑布流效果](https://dailc.github.io/showDemo/waterfallflow/demo_waterfall_flow_js.html)

源码可以查看
[https://github.com/dailc/showDemo/blob/master/waterfallflow/demo_waterfall_flow_js.html](https://github.com/dailc/showDemo/blob/master/waterfallflow/demo_waterfall_flow_js.html)

## 原文地址
原文在我个人博客上面

[网页瀑布流效果实现的几种方式](https://dailc.github.io/2016/11/13/waterflowEffect.html)

## 参考链接

* [[瀑布流布局——JS+绝对定位](http://www.cnblogs.com/slowsoul/archive/2013/02/10/2909746.html)](http://www.cnblogs.com/slowsoul/archive/2013/02/10/2909746.html)
* [基于css3 column-width 实现的瀑布流](http://xhay1122.com/2015/06/30/2015-06-30-pinterest/)
