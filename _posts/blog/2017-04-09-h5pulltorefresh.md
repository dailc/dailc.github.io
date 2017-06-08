---
layout:     post
title:      H5下拉刷新,多种皮肤，便于拓展！
category: blog
tags: 下拉刷新 h5
favour: 下拉刷新
description: H5下拉刷新，统一了API，抽取了基类，提供了各式各样的皮肤，以及支持进行自定义皮肤的定制。
---

## 前言
下拉刷新几乎是移动H5端必用的插件，本人自踏入前端坑以来，第一个封装的h5插件也是下拉刷新，近来正好在整理下拉刷新相关知识，因此重新弄了一个下拉刷新库，统一了API，抽取了基类，提供了各式各样的皮肤，以及支持进行自定义皮肤的定制。

## 题纲

* 多种皮肤效果展示
* 有何特点
* 架构介绍
* 如何拓展自定义皮肤
* API与使用
* 是否依赖第三方库
* 使用场景
* 示例与源码
 
## 多种皮肤效果展示
提供了多种皮肤样式供选择。

* 效果1
  ![](https://dailc.github.io/pulltorefresh-h5-iscroll/staticresource/img/effect1.gif)
* 效果2
  ![](https://dailc.github.io/pulltorefresh-h5-iscroll/staticresource/img/effect2.gif)
* 效果3
  ![](https://dailc.github.io/pulltorefresh-h5-iscroll/staticresource/img/effect3.gif)
* 效果4
  ![](https://dailc.github.io/pulltorefresh-h5-iscroll/staticresource/img/effect4.gif)
* 效果5
  ![](https://dailc.github.io/pulltorefresh-h5-iscroll/staticresource/img/effect5.gif)
* 效果6
  ![](https://dailc.github.io/pulltorefresh-h5-iscroll/staticresource/img/effect6.gif)

## 有何特点
这个下拉刷新库的最大特点就是:

* UI与核心逻辑分层
* 统一API
* 便于拓展

之前在封装这个库之前就尝试找过一些H5下拉刷新的实现，但是大多都是代码比较乱，或者是依赖了第三方库，达不到自己的预期。因此这次另起炉灶重新封装了一个，里面默认就提供了多个皮肤的实现，最重要的是，由于将UI实现剥离出来了，因此可以很方便的进行自定义皮肤的拓展，只需要实现特定的UI函数，即可在里面定义自己的皮肤。

## 架构介绍
下拉刷新基于IScroll实现，为了便于拓展与维护，将这个下拉刷新库分成了以下架构:

* `IScrollProbe`-下拉刷新是基于IScroll实现的
* `PullToRefreshCore`-下拉刷新的基类，里面控制下拉刷新的核心交互逻辑(比如何时下拉，何时上拉等)
*  `PullToRefreshSkin`-下拉刷新的皮肤(UI实现类)，里面只关心UI的实现，只在特定的回调中进行UI渲染即可，这样可以减少耦合，正常情况下，这一层的下拉刷新就已经能对外使用了
* `PullToRefreshBizlogic`-这个是业务层(专门针对项目快速开发二次封装的)，仅仅是将一些常用操作再次封装而已(譬如ajax等)，不要这一层也能正常运行

## 如何拓展自定义皮肤
封装出来的下拉刷新Core中进行逻辑判断，这里面暴露了一些对应的UI hook，皮肤类只需要继承Core类，并实现这些UI hook即可完成一个自定义的皮肤(所有的skin都是共用一套下拉刷新逻辑的，只是各自的UI实现不同而已)。可供实现的UI hook如下:

```
* _initPullToRefreshTipsHook() //在这里初始化生成下拉刷新与上拉加载的提示
* _pullingHook(deltaY,thresholdHeight) //下拉过程中的钩子函数，方便实现一些渐变动画
* _pulldownLoaingAnimationHook //下拉刷新的动画
* _pulldownLoaingAnimationSuccessHook(done,isSuccess) //下拉刷新的成功动画-动画完毕后可能的成功提示,没有的话请直接执行done
* _pulldownLoaingAnimationEndHook //下拉刷新的动画完成后的回调，可以用来重置状态
* _pullupLoaingAnimationHook(isFinished) //上拉加载的动画
* _pullupLoaingAnimationSuccessHook(isFinished) //上拉加载的成功动画-动画完毕后可能的成功提示，或者重置状态
* _scrollEndHook //滑动完毕后的end回调(这个比较少用到)
* _enablePullUpHook //允许pullup后的回调
* _disablePullUpHook //禁止pullup后的回调
```
**最简单的情况下，只需要参考其它皮肤，继承Core类，哪怕这些hook都没有实现，也会有下拉刷新功能的**(只是如果不实现，则不会有相应的UI动画而已)

## API与使用
下拉刷新API是由基类统一对外提供的，所以所有的下拉刷新皮肤都有统一的API，如下:

```
	* finished //这是一个属性，用来控制当前上拉加载是否可用
	* refresh() //重置状态。譬如上拉加载关闭后需要手动refresh重置finished状态
	* pulldownLoading() //主动触发一个下拉刷新的动画(同时会触发下拉回调)
	* pullupLoading() //主动触发一个上拉加载的动画(同时会触发上拉回调)
	* endPullDownToRefresh() //关闭下拉刷新动画，重置状态
	* endPullUpToRefresh(finished) //关闭上拉加载动画，重置状态，如果finished，则不允许在上拉，除非再次refresh()
```
关于使用，遵循了一个原则就是:

* 所有的下拉刷新有统一的Dom结构与JS调用方式
* 方便的替换皮肤(更改皮肤只需要更改对应引入的文件与变量即可)

关于更多的使用说明可以参考源码中的README

## 是否依赖第三方库
下拉刷新只依赖于`IScroll5-Probe`，不依赖与其它任何文件(特例下方会有说明)

### 关于一些有特别依赖的特例
正常的下拉刷新只基于IScroll5的，但是有一些例外情况也依赖了其它文件

* 有一两个皮肤的实现依赖了`mui.css`-如果不想依赖只需要把对应样式拿出来即可
* 有一个下拉刷新业务实现类依赖了`mui.js`，这个是项目中用到的，正常情况下如果不是基于mui.js的项目，别用它就是了
* 一些专门基于mui拓展的皮肤是基于`mui.js`的(同上，这也只是在基于mui开发时的便捷封装而已)

简单的说，下拉刷新仅仅依赖于一个`IScroll5`库，一些专门为项目二次封装的文件才会去依赖于其它库。(说明下，这里的`IScroll5`是进过了一点点改造的，增加了一些功能，但是不影响原有使用)

更多的说明可以参考源码中的README

## 使用场景
这次之所以会封装这个库，起由是:
以前项目中用到了一个下拉刷新效果，现在需要更换成一个新效果(同时也考虑到以后可能会换新的效果)，因此将下拉刷新的底层实现与UI从业务中剥离了出来，这样更换皮肤时，只需要更改下引用的皮肤即可，外部的业务代码都无需变动。

另外，这次实现多个不同皮肤时，有的是用的最简单的状态切换，有的用了`canvas`动画，有的用了`css3动画`，最后发现在一些机型上，复杂的动画还是会很卡，因此如果考虑低端机型的话，还是用简单一点的实现吧。

所以，后续的皮肤拓展也会是在这个思路上进行，譬如考虑更好的背景图，图标，交互等效果替换，而不是使用那些炫酷的渐变动画。

## 示例与源码
源码与示例请参考`github`地址:

[https://github.com/dailc/pulltorefresh-h5-iscroll](https://github.com/dailc/pulltorefresh-h5-iscroll)

或者可以戳这里看下示例页面:
[https://dailc.github.io/pulltorefresh-h5-iscroll/examples/html/](https://dailc.github.io/pulltorefresh-h5-iscroll/examples/html/)