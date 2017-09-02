---
layout:     post
title:      优雅的H5下拉刷新【minirefresh】
category: blog
tags: 下拉刷新 开源项目 H5下拉刷新
favour: 开源项目
description: 【minirefresh】优雅的H5下拉刷新。零依赖，高性能，多主题，易拓展。
---

## 序

严格的来说，这是我第一个完全投入的开源项目，它的出现是为了统一移动H5中的下拉刷新，想通过一套框架，多主题拓展方式，适应于任意需求下的任意下拉刷新场景。

另外，这个项目作为独立项目存在，希望能有更多的人参与进来！

[![](https://img.shields.io/npm/v/minirefresh.svg)](https://www.npmjs.com/package/minirefresh)

[【minirefresh】优雅的H5下拉刷新。零依赖，高性能，多主题，易拓展。](https://github.com/minirefresh/minirefresh)

## 特点

- 零依赖（原生JS实现，不依赖于任何库）

- 多平台支持。一套代码，多端运行，支持Android，iOS，主流浏览器

- 丰富的主题，官方提供多种主题（包括默认，applet-仿小程序，drawer3d-3d抽屉效果，taobao-仿淘宝等）

- 高性能。动画采用css3+硬件加速，在主流手机上流畅运行

- 良好的兼容性。支持和各种Scroll的嵌套（包括mui-scroll,IScroll,Swipe等），支持Vue环境下的使用

- 易拓展，三层架构，专门抽取UI层面，方便实现各种的主题，实现一套主题非常方便，而且几乎可以实现任何的效果

- 优雅的API和源码，API设计科学，简单，源码严谨，所有源码通过`ESlint`检测

- 完善的文档与示例，提供完善的showcase，以及文档

## 源码

[https://github.com/minirefresh/minirefresh](https://github.com/minirefresh/minirefresh)

[https://www.npmjs.com/package/minirefresh](https://www.npmjs.com/package/minirefresh)

## 官网与文档

[http://www.minirefresh.com](http://www.minirefresh.com)

[https://minirefresh.github.io/](https://minirefresh.github.io/)

## 效果

### 基础示例

__1. 【基础新闻列表】最基本的下拉刷新使用__

![](http://upload-images.jianshu.io/upload_images/3437876-fee5ca8f8124fe91.gif?imageMogr2/auto-orient/strip)

__2. 【多列表单容器】每次切换菜单时刷新容器__

![](http://upload-images.jianshu.io/upload_images/3437876-36d159d3706af86f.gif?imageMogr2/auto-orient/strip)

__3. 【多列表多容器】多个列表都有一个Minirefresh对象__

![](http://upload-images.jianshu.io/upload_images/3437876-11747d7447cf25b3.gif?imageMogr2/auto-orient/strip)

__4. 【Vue支持】支持Vue下的使用__

![](http://upload-images.jianshu.io/upload_images/3437876-2ee778ad2af952f2.gif?imageMogr2/auto-orient/strip)

### 嵌套示例

__1. 【Mui-Slider】内部嵌套图片轮播__

![](http://upload-images.jianshu.io/upload_images/3437876-bffde4f572065e37.gif?imageMogr2/auto-orient/strip)

__2. 【Mui-Scroll】嵌套在Mui-Scroll中__

![](http://upload-images.jianshu.io/upload_images/3437876-3e2c2da6b10cf719.gif?imageMogr2/auto-orient/strip)

__3. 【Swipe】嵌套在Swipe中__

![](http://upload-images.jianshu.io/upload_images/3437876-1afc950419ecf010.gif?imageMogr2/auto-orient/strip)

### 主题示例

__1. 【applet】仿微信小程序主题__

![](http://upload-images.jianshu.io/upload_images/3437876-d4ebd7f71b558d33.gif?imageMogr2/auto-orient/strip)

__2. 【taobao】仿淘宝刷新主题__

![](https://minirefresh.github.io/minirefresh/staticresource/screenshoot/theme_taobao.gif)

__3. 【drawer3d】3D抽屉效果主题__

![](http://upload-images.jianshu.io/upload_images/3437876-50898ed3b337de9e.gif?imageMogr2/auto-orient/strip)

__4. 【drawer-slider】滑动抽屉效果主题__

![](http://upload-images.jianshu.io/upload_images/3437876-5ee5029f9b3277d4.gif?imageMogr2/auto-orient/strip)

## showcase

可以直接在线体验效果

[https://minirefresh.github.io/minirefresh/examples/](https://minirefresh.github.io/minirefresh/examples/)

![](http://upload-images.jianshu.io/upload_images/3437876-f8d5a8830bd98f8b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 快速开始

### 引入

```html
<link rel="stylesheet" href="xxx/minirefresh.css" />
<script type="text/javascript" src="xxx/minirefresh.js"></script>
```

__或require__

```js
var MiniRefreshTools = require('xxx/minirefresh.js');
```

__或import__

```js
import { MiniRefreshTools } from 'xxx/minirefresh.js';
```

### 页面布局

```html
<!-- minirefresh开头的class请勿修改 -->
<div id="minirefresh" class="minirefresh-wrap">
    <div class="minirefresh-scroll">        
    </div>
</div>
```

### 初始化

```js
// 引入任何一个主题后，都会有一个 MiniRefresh 全局变量
var miniRefresh = new MiniRefresh({
    container: '#minirefresh',
    down: {
        callback: function() {
            // 下拉事件
        }
    },
    up: {

        callback: function() {
            // 上拉事件
        }
    }
});
```

### 结束刷新

```js
// 结束下拉刷新
miniRefresh.endDownLoading();
```

```js
// 结束上拉加载
// 参数为true代表没有更多数据，否则接下来可以继续加载
miniRefresh.endUpLoading(true);
```

### 更多

更多的使用请参考官方文档

## 贡献

__`minirefresh`需要你!__

来为项目添砖加瓦，新的`Idea`，新的主题，重大Bug发现，新的设计资源（如图标，官网设计等）

都可以通过`Issue`或`PR`的方式提交！

贡献被采纳后会加入贡献者名单，如果有杰出贡献（如持续贡献），可以加入`Manager`小组，共同开发维护`MiniRefresh`

有共同参与项目意愿的，可以申请成为`Member`，成为`Minirefresh`真正的主人！

更多参考：[https://minirefresh.github.io/minirefresh-doc/site/contribute/howtocontributor.html](https://minirefresh.github.io/minirefresh-doc/site/contribute/howtocontributor.html)

## 讨论

- [gitter](https://gitter.im/minirefreshjs/minirefresh)

- QQ群（`601988892`）

_注意，申请加入群时请添加验证信息，例如：minirefresh使用遇到问题等等_

## 最后关于灵感与参考

核心架构是参考的我自己以前的项目 [https://github.com/dailc/pulltorefresh-h5-iscroll](https://github.com/dailc/pulltorefresh-h5-iscroll)，只不过把依赖IScroll换成了原生JS与CSS3实现，并且完全的重构与优化

做这个项目的灵感与原动力是受 [https://github.com/mescroll/mescroll](https://github.com/mescroll/mescroll) 启发，但是由于那个项目里的代码不符合我的个人风格，一些主题拓展也没有达到我的要求，因此我自己重新写了一个项目而不是基于mescroll拓展

还有就是写这个项目也是对自己的一种锻炼，里面包含了

- JS与CSS3的熟练运用，并进行合理架构
- ESlint严格的代码检测
- Gulp 自动构建
- Karma+Mocha单元测试（待完善）
- Circleci，Codecov，Sauce等自动集成与测试网址，
- Gitbook构建API与教程文档
- Hexo构建官方网站（待完善）
- 域名备案，CDN加速等（待完善）
- Npm发布与Github项目团队

当然了，迫于一些原因，没有用全新的ES6或TS写，而是用的ES5严格模式。

另外，这个项目是托管在`Github`的`minirefresh`组织上的，希望有更多的人能参与，成为组织的一员，共同维护，毕竟在不断的分享交流中才能进步更快...