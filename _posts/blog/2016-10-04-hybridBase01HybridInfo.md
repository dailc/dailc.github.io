---
layout:     post
title:      Hybrid APP基础篇(一)->什么是Hybrid App
category: blog
tags: Hybrid
favour: Hybrid
description: Hybrid APP是目前广泛流行的一种APP开发模式,本文对其做简单介绍
---


## 前言

### 写在前面的话
**20170219更新**

时至今日，Hybrid模式也不是那么的“先进”，“潮流”了，市面上有“React-Native”，“Weex”等新型技术在冲击着它的地位。

但是，在某些领域，Hybrid技术仍然占据着大量的市场。

特别是有一些传统软件公司，他们的业务决定着他们目前更适合这种**入门低，能批量开发**的Hybrid模式，因此别因为`过时`,`落后`等标签就将`Hybrid模式` 弃如敝履。 

**毕竟，适合的才是最好的。**

**20161004更新**
初稿发布

### 楔子
现在概念上的APP诞生是在Google推出Android,Apple推出iOS后,从这时候开始,就有了App开发工程师这个职位,比如Android工程师,iOS工程师(当然了,一些被历史淘汰的,比如Symbian,win phone就暂不算进来了)

最开始的App开发只有原生开发这个概念,但自从H5广泛流行后,一种效率更高的开发模式Hybrid应运而生,它就是"Hybrid模式",本文针对这种模式做简单介绍

## Hybrid发家史

### 突然兴盛的H5
Html5是在2014年9月份正式发布的,这一次的发布做了一个最大的改变就是-"从以前的XML子集升级成为一个独立集合",也就是说,HTML5和之前的HTML是有很大区别的,这次自己不再是某门派的弟子传人了,而是成为了开宗立派的祖师爷

子Html5发布开始,就慢慢开始掀起了一股H5狂潮,比如"微信朋友圈小游戏","围住神经猫"之类的,但是真正HTML5大火之际,应该算是2015之后了,为什么,首先我们来看下谷歌公布的2015年2月份的Android系统版本分布情况
![](https://dailc.github.io/staticResource/blog/hybrid/img_hybrid_base_hybridInfo_1.jpg)

从上图中我们可以看到Android4.0以上的市场占有率已经接近90%,特别是4.4以上的比重已经超过40%了,也就是说,我们这时候开发就已经几乎可以不考虑4.0以下的系统了,而4.0以上H5的支持是要远远高于4.0以下的。所以这时候就可以使用H5技术了

### H5大行其道
我们先看下谷歌2016年4月份公布的Android系统占有率
![](https://dailc.github.io/staticResource/blog/hybrid/img_hybrid_base_hybridInfo_2.jpg)
我们可以看到,几乎所有的设备都是4.0以上了,而且4.4以上已经超过70%,特别是5.0以上都已经超过40%了,而Android 4.4以上对H5的支持就已经很不错了,所以我们几乎以及可以肆无忌惮的使用H5了

### H5渗入APP开发
我们都知道,原生APP开发中有一个webview的组件(Android中是webview,iOS7以下有UIWebview,7以上有WKWebview),这个组件可以加载Html文件。

在Html5没有兴盛之前,加载的Html往往只能用来做一些简单的静态资源显示,但是H5大行其道以后,Html5中有很多新增的功能,炫酷的效果,特别是iOS中H5支持一直都很良好,Android 4.4以上支持也足够,所以这时候发现可以将一些主要的逻辑都用H5页面来编写,然后原生直接用webview加载显示,这样大大提高了开发效率,而且体验也很不错

### Hybrid的兴盛
所谓Hybrid,即混合开发,意味着半原生半Web,其实在H5兴盛之前,Hybrid模式就已经比较成熟了,但是一直不愠不火(因为系统的一些现在以及html本身功能的限制)

但是自从H5兴盛之后,大家发现原来很多功能都可以用web来实现,然后原生作为容器显示,所以为了提高开发效率,越来越多的人使用Hybrid模式进行开发,越来越多的Hybrid开发框架,越来越多的前端专职成为Hybrid开发,也就是说Hybrid也随之兴盛起来了

## Hybrid概述

### Hybrid定义
前面有提到Hybrid这种模式,那么它是怎么样定义的呢？怎么样的开发模式才算是Hybrid模式呢?

* Hybrid是半Native半web开发模式
* Hybrid模式中,底层功能API均由原生容器通过某种方式提供,然后业务逻辑由H5页面完成,最终原生容器加载H5页面,完成整个App
* 成熟的Hybrid模式意味着业务逻辑均由H5实现
	* 一款成熟的Hybrid框架,意味着各种类型的api都很完善,那么这时候几乎所有与业务相关的逻辑都是放在H5页面中的,原生只作为容器存在
* 成熟的Hybrid模式可复用性非常高,可以跨平台开发
	* 成熟的Hybrid框架,那么原生只会提供底层API,也就是说所有的业务是H5完成,不管是什么项目,业务只由H5实现,这时候就可以发现,业务代码是可以跨平台的,也就是说,开发一次,就可以和各自原生容器结合,组成两种原生安装包了,达到了跨平台开发效果

### Hybrid App的类型划分
上面提到过Hybrid的定义,但实际上,根据Native和web的混合程度,Hybrid也可以再次细分为多种类型(参考百科上的说法)

* 多View混合型
	* 这种模式主要特点是将webview作为Native中的一个view组件,当需要的时候在独立运行显示,也就是说主体是Native,web技术只是起来一些补充作用
	* 这种模式几乎就是原生开发,没有降低什么难度,到了16年几乎已经没人使用了
* 单View混合型
	* 这种模式是在同一个view内,同时包括Native view和webview(互相之间是层叠的关系),比如一些应用会用H5来加载百度地图作为整个页面的主体内容,然后再webview之上覆盖一些原生的view,比如搜索什么的
	* 这种模式开发完成后体验较好,但是开发成本较大,一般适合一些原生人员使用
* Web主体型
	* 这种模式算是传统意义上的Hybrid开发,很多Hybrid框架都是基于这种模式的,比如PhoneGap,AppCan,Html5+等
	* 这种模式的一个最大特点是,Hybrid框架已经提供各种api,打包工具,调试工具,然后实际开发时不会使用到任何原生技术,实际上只会使用H5和js来编写,然后js可以调用原生提供的api来实现一些拓展功能。往往程序从入口页面,到每一个功能都是h5和js完成的
	* 理论上来说,这种模式应该是最佳的一种模式(因为用H5和js编写最为快速,能够调用原生api,功能够完善),但是由于一些webview自身的限制,导致了这种模式在性能上损耗不小,包括在一些内存控制上的不足,所以导致体验要逊色于原生不少
	* 当然了,如果能解决体验差问题,这种模式应当是最优的(比如由于iOS对H5支持很好,iOS上的体验就很不错)
* 多主体共存型（灵活型）
	* 这种模式的存在是为了解决web主体型的不足,这种模式的一个最大特点是,原生开发和h5开发共存,也就是说,对于一些性能要求很高的页面模块,用原生来完成,对于一些通用型模块,用h5和js来完成
	* 这种模式通用有跨平台特性,而且用户体验号,性能高,不逊色与原生,但是有一个很大的限制就是,采用这种模式需要一定的技术前提
	* 也就是说这种模式不同于web主体型可以直接用第三方框架,这种模式一般是一些有技术支持的公司自己实现的,包括H5和原生的通信,原生API提供,容器的一些处理全部由原生人员来完成,所以说,使用这种技术的前提是得有专业的原生人员(包括Android,iOS)以及业务开发人员(原生开发负责功能,前端解决简单通用h5功能)
	* 当然了,如果技术上没有问题,用这种方案开发出来的App体验是很好的,而且性能也不逊色原生,所以是一种很优的方案

## Hybrid架构

### 基本原理
如下图,痛过JSBridge,H5页面可以调用Native的api,Native也可调用H5页面的方法或者通知H5页面回调
![](https://dailc.github.io/staticResource/blog/hybrid/img_hybrid_base_hybridInfo_3.jpg)

### 内部的实现原理流程
知道了Hybrid的基本原理,那么Hybrid模式内部是如何实现的呢?H5和Native直接的通信又是如何实现的呢?

请参考[Hybrid APP基础篇(三)->Hybrid APP之Native和H5页面交互原理](https://dailc.github.io/2016/10/04/hybridBase03NativeAndH5Interaction.html)

## Hybrid的未来

### 现行多种App开发模式以及分析比较
现在的App开发,除了Hybrid,还有Native,纯web,React Native等方案,下面介绍下各种方案的分析对比

参考 [Hybrid APP基础篇(二)->Native、Hybrid、React Native、Web App方案的分析比较](https://dailc.github.io/2016/10/04/hybridBase02HybridCompareOthers.html)

### Hybrid面临的挑战
比如Facebook推出的React Native方案,这是Facebook在放弃h5后自行推出一个'反H5方案',一句话总结就是:里面可以用JS来完整的写一个原生应用

比如微信推出的小程序(16年9月份内测),这也是一个微信主导的'反H5方案',一句话总结就是:里面可以同JS+微信自制的UI方案来写一个类似于原生的应用,只不过这个应用不是发布到App Store中,而是发布到微信中

比如阿里推出的weex。

像以上技术都不断的在冲击着Hybrid模式(当然Native也会有影响),不过都很推崇JS(话说很多前端猿一直希望JS一统天下)

到现在为止*(发文时间16年10月)*,2016年已经快过去了,新的技术也不断的在涌出,各类的新技术都不断的在冲击着Hybrid模式的地位,正如一句话"长江后浪拍前浪,前浪*****",任何技术都会被时间无情的筛选,请不要奇怪,也许不久后的某天,你会突然发现Hybrid模式已经完全落伍了。

## 附录

## 原文地址
原文在我个人博客上面
[Hybrid APP基础篇(一)->什么是Hybrid Ap](https://dailc.github.io/2016/10/04/hybridBase01HybridInfo.html)

### 参考来源

* [HTML5 APP----2014年H5没火，why？2016年H5能火，why？](http://blog.csdn.net/guzhenping/article/details/50735588)
* [浅谈Hybrid技术的设计与实现](http://developer.51cto.com/art/201511/496000.htm)
* [HybridApp解决方案_No1_混合模式(Hybrid)App开发概述](http://www.cnblogs.com/yeahui/p/5026587.html)
* [你真的了解Hybrid APP吗](http://www.csdn.net/article/a/2014-11-21/15821123)
* [2016最新安卓版本分布](http://weibo.com/p/1001603961332390079517?from=singleweibo&mod=recommand_article)
* [hybrid app](http://baike.baidu.com/link?url=9Pio6VtdpBbRpzjucPeT5txhkkPM_rxgrkUjHZ_nES3AjpH4D-ODSZyMNVlzmh3MpgvcMTqO6QXPVDXh0gKQIXcLAkW_Toh8TIdpGeH18yy)
