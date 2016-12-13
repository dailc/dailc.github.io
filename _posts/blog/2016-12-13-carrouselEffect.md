---
layout:     post
title:      一个H5的3D滑动组件实现(兼容2D模式)
category: blog
tags: 3d滑动 javascript css3d 旋转木马 图片轮播
favour: 3d滑动

description: 一个通用的滑动、轮播组件，同时支持3D效果和2D效果。可以拓展成图片轮播，旋转木马，页面滑动等等
---

## 起由
原始需求来源于一个项目的某个功能，要求实现3D图片轮播效果，而已有的组件大多是普通的2D图片轮播，于是重新造了一个轮子，实现了一个既支持2D，又支持3D的滑动、轮播组件。

## 实现思路
刚一开始肯定是无法直接实现3D滑动组件的，所以将功能拆分，如下步骤

* 实现一个双向循环链表，作为底层Item的数据结构
* 基于链表，实现一个无限循环的2D滑动组件
* 基于2D滑动组件做3D变化得到3D组件
* 兼容性检查以及功能封装，简化使用，确保稳定

## 双向循环链表的模拟
以前看到的轮播组件大多是用数组来作为底层数据结构，最近，整合受简书上的某一篇文章启发，觉得链表方式挺不错的，于是先动手造一个JS模拟的链表(*一些现有的资源大多不符合预期，于是重新造轮*)

### 原理
双向循环链表原理比较简单，这里不再赘述

### 实现
实现了一个双向链表，支持循环和非循环，参考 [https://github.com/dailc/jsDataStruct](https://github.com/dailc/jsDataStruct)


## 2D滑动组件的实现
在H5时代，2D滑动组件大多是通过**translate3d** 和**transition**实现的，采用X轴位移来实现滑动，所以虽说最终的效果只是2D得平面滑动，其实也是基于3D变换的。


### 实现原理描述
假设屏幕宽为W，滑动组件中有(A，B，C，D，E )5个item，每一个item的宽度都占满屏幕。采用循环模式(也就是E往右滑动可以到A)

1. 构建双向循环链表，其中从A开始

```
A._next = B;
B._next = C;
...
E._next = A;
A._prev = E;
B._prev = A;
...
E._prev = D;
```
如上，所以所有元素首尾相连，构成循环

2. 初始化组件时，各自的位置如下(只考虑X轴(→)，Y(↓)和Z(垂直屏幕)都是0)。
E(-2W)，D(-W)，A(0)，B(W)，C(2W)。
一般只会允许同时显示最多5个元素，其它位置的元素暂时隐藏

3. 通过监听滑动组件的touch，来判断当前组件应该的X轴唯一translateX

4. touchmove过程中,显示的元素进行相应的translateX位移(向左滑为负，向右滑为正)。比如A的位置为(0+translateX)，其它元素类似

5. touchend时，判断当前的translateX，如果大于item宽度的50%，则判断移到下一个位置，如果大于item宽度的150%，则移到下下个元素。同理，如果小于-50%，则移到到上各元素，小于-150%，则移动到上上个元素

6. 移动到上一个元素，各自item的translateX 减去W即可，移动到下一个元素，加上W。并且移动过程中设置 ```transition(cubic-bezier(0.165, 0.84, 0.44, 1))```

7. 由于是通过双向循环链表构建，所以每次移动只需要通过_next就可找到下一个元素，通过_prev即可找到上一个元素，并且自动循环

### 原理流程
以下为上述中向右滑动一位，的过程图述
![](https://dailc.github.io/showDemo/staticresource/carrousel/demo_js_carrousel_3.png)

### 效果预览
下图是将item的宽度设为屏幕50%后的2D滑动效果
![](https://dailc.github.io/showDemo/staticresource/carrousel/demo_js_carrousel_1.png)

## 3D滑动组件的进一步实现
上述过程中实现了2D滑动组件，那么带3D组件的组件该如何实现呢？毕竟最初的需求就是3D效果。

其实上述2D滑动组件就已经用到了3D变化了，只不过我们只用了X轴变换。所以看起来仍然是2D效果，所以接下来我们就是需要利用到另外两个轴的变换。

### 最终效果图示
最终我们需要实现如图所示的3D滑动效果
![](https://dailc.github.io/showDemo/staticresource/carrousel/demo_js_carrousel_2.png)

### 基本3D坐标轴
我们将屏幕左上角看成原点。那么

* X轴就是平行于屏幕的水平方向，从左到右
* Y轴就是平行于屏幕的垂直方向，从上到下
* Z轴就是垂直于屏幕(垂直于这个面)，由内向外(也就是从屏幕后面穿过屏幕，指向做电脑前面的人)

### 分析我们需要的3D变换
对比已经完成的2D效果和最终3D效果的图，我们发现有以下区别

* Y轴存在旋转(rotateY)，目测，左侧第一个Item的旋转角度在(30度和45度之间)
* Z轴存在纵深(translateZ或translate3d)，可以观察出，屏幕中心的Item和左侧或右侧的纵深不一样，屏幕中心的Z值更大(更突出)
* 需要找一个合适的视点(perspective)，因为存在Z轴纵深，所以肯定是需要找到一个合适的视点来观察整个组件的。

### 实际实现
实际实现过程中，和上述分析的过程一致，在2D变换的基础上，针对Y轴进行了旋转计算，针对Z轴进行了纵深计算。

基本过程是:

1. 找到一个合适的Y轴旋转计算公式(比如那左侧的Item调试，找到一个合适的点)

2. 找到合适的适应于不同屏幕分辨率的Z轴纵深以及视点位置，(比如在屏幕320时，找到一个合适的Z轴纵深和perspective，然后再屏幕768时再找到一个，进行线性插值即可)

详细过程不再赘述

### 兼容性检查以及功能封装
初步做出来的效果并不能很好的兼容各种分辨率屏幕以及功能较为简陋。

所以接下来的主要工作是:

* 找到合适的插值公式，使的3D变化适应于较多的屏幕。
* 检查代码，使的兼容更多的浏览器版本(比如Chrome，APP内嵌Webview，FireFox等等，当然了，肯定不考虑IE)
* 代码封装抽象工作，合理开放API，以及便于后续拓展(剥离第三方库的依赖，进一步封装后，使的类库代码更优雅)

基本上述工作完成后，一个崭新的3D滑动组件类库就完成了，它主要有如下功能；

1. 支持3D滑动效果(核心功能)
2. 兼容2D滑动效果(同时保证普通的使用)
3. 开放以下API

```
 * reset 重置,这个可以重写更换options
 * prev 上一个item
 * next 下一个item
 * moveTo 移动到某一个指定item,会寻找最短路径
 * bindItemChangedHandler 绑定item切换的监听回调
 * bindItemTapHandler 绑定item的tap监听
 * unBindItemTapHandler 解绑item的tap监听，会取消所有的item的tap事件以及item内部的tap
 * tap 绑定item内部某元素的tap事件，因为无法用click监听,所以单独提供了监听函数
```

4. 便于拓展，比如这个组件有提供一个图片轮播拓展示例

## 源码及效果

### 效果展示
[通用滑动组件实现示例(2D,3D)](https://dailc.github.io/showDemo/carrousel/demo_carrousel_index.html)

[滑动组件拓展，3d图片轮播示例](https://dailc.github.io/showDemo/carrousel/demo_carrousel_gallerySlider.html)

### 源码
[一个H5的3D滑动组件实现(兼容2D模式)](https://github.com/dailc/showDemo/tree/master/carrousel)

## 原文地址
原文在我个人博客上面

[一个H5的3D滑动组件实现(兼容2D模式)](https://dailc.github.io/2016/12/13/carrouselEffect.html)

## 参考链接

* [如何用H5实现一个触屏版的轮播器？](http://www.jianshu.com/p/abb0e3575c70)
