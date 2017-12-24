---
layout:     post
title:      【quickhybrid】如何实现一个Hybrid框架
category: blog
tags: quickhybrid hybrid
favour: quickhybrid
description: 如何实现一个跨平台Hybrid框架，quickhybrid系列的开端
---

## 章节目录

- [【quickhybrid】如何实现一个跨平台Hybrid框架](https://github.com/quickhybrid/quickhybrid/issues/12)

- [【quick hybrid】架构一个Hybrid框架](https://github.com/quickhybrid/quickhybrid/issues/11)

- [【quick hybrid】H5和Native交互原理](https://github.com/quickhybrid/quickhybrid/issues/10)

- [【quick hybrid】JSBridge的实现](https://github.com/quickhybrid/quickhybrid/issues/9)

- [【quick hybrid】H5和原生的职责划分](https://github.com/quickhybrid/quickhybrid/issues/8)

- [【quick hybrid】API的分类：短期API、长期API](https://github.com/quickhybrid/quickhybrid/issues/7)

- [【quick hybrid】API规划](https://github.com/quickhybrid/quickhybrid/issues/6)

- [【quick hybrid】API多平台支撑的实现](https://github.com/quickhybrid/quickhybrid/issues/5)

- [【quick hybrid】组件（自定义）API的实现](https://github.com/quickhybrid/quickhybrid/issues/4)

- [【quick hybrid】JS端的项目实现](https://github.com/quickhybrid/quickhybrid/issues/3)

- [【quick hybrid】Android端的项目实现](https://github.com/quickhybrid/quickhybrid/issues/2)

- [【quick hybrid】iOS端的项目实现](https://github.com/quickhybrid/quickhybrid/issues/1)


## 一些感慨

踏入前端领域满打满算也两年多了。到现在，主要方向已经是由`Android`原生转到了偏前端领域。

期间，不提自己的技术进步、视野拓宽，最大的产出之一应该就是从0开始构建了一个`Hybrid`框架了。

正值最近开始进行技术梳理，因此就准备写一系列文章沉淀起来。

## 本系列包含的内容清单

- Hybrid框架的原理以及架构系列

- JavaScript部分的原理以及源码系列（包括部分API的多容器的兼容）

- Android部分的原理以及源码系列（仅覆盖核心实现以及API部分，不包含实际业务代码）

- iOS部分的部分原理（一些坑会特别提出，理论上根据原理应该可以还原出）

    - 由于本人没写过iOS应用，因此目前没有直接提供源码，后续有时间可以考虑进一步提供

## 什么样的`Hybrid`框架？

核心宗旨：__`H5`页面基于该框架可以替代`80%`以上的原生业务页面。__

更详细一点：

- 适用于需要开发大量项目级APP的场景

- 不是用于完全替代原生开发，而是替代里面的`80%`原生业务页面（模式是： 原生部分 + H5部分）

- 框架人员至少需要一名`Android`原生，一名`iOS`原生，一名`前端架构`（如果全栈，可以考虑合一）

- 部分API（如`UI`显示类）考虑到了`H5`的兼容

- 并没有做到产品级别的优化（需求优先级别较低）

之所以不基于第三方框架而是自己重新实现，是由具体的环境与需求决定的。譬如要求自己必须完全掌握源码，某些功能必须通过特定安全检测等。

__另外，本系列不与任何市面上的其他框架进行比较，仅是自己的经验总结。__

## 此框架是否有实践经验？

此框架不是平地起高楼而来的，而是在接近两年的项目实战中慢慢演化出的，内部已经迭代过多个版本

另外，它已经在一个项目型公司全面推广使用了。（`N+`级别）

这里要说明下：

- 实际项目中，Hybrid框架仅仅是其中的一部分，还会包括一些原生通用组件，业务模块等

- 但是本系列仅止步于Hybrid框架（处于诸多因素考虑，包括核心实现以及API实现）

## 如何应用与自己的项目中？

最后的源码部分仅提供核心实现以及API部分，对于一些简单项目来说，其实也就够用了，
但是如果功能较复杂的，肯定需要进一步封装自己的原生功能。

实际上推荐使用以下人员配置：

- 一名资深`Android`原生（负责`Android`容器）

- 一名资深`iOS`原生（负责`iOS`容器）

- 一名资深前端（前端部分不要小觑，要配合排查问题的）

- 总架构（推荐是以上三人中的一人担任，譬如本系列是由前端来统一架构的-但前提是必须懂点原生原理，否则抓瞎）

因为每一个人精力有限，所以除非特别厉害和全能，否则不建议一人担任两职
（譬如像我转入前端后，以前的Android就遗忘的很快，但是如果重点兼顾Android，前端水准肯定无法快速提升）

在`N+`项目时的模式大致如下：

- 三名框架人员负责核心框架容器部分(框架还需要提供一些通用模块与组件)

- 各个业务线的APP中可以专门分配不同的原生人员负责打包APP（1对N，协助排查各自可能的业务问题）

- 每一个APP中可以有若干`H5`业务开发人员(由不同的复杂度而定，主要业务都是线上的H5形式)

- 三名对于的框架人员负责处理过滤后的真正框架BUG（由业务负责人过滤）

注意，以上是最小配置。（譬如可以分配更多的框架人员，优化提升等）

最后，以上是实际的经验总结，仅做参考。

## 框架更新与迭代

实际上不同框架的更新迭代方式都是不一样的，比如本系列中就是基于需求迭代

也就是说遇到问题才修复，优化，累积一段时间后开始考虑下一代的优化提升（迫于投入的窘迫性）

一般来说，整体的交互架构以及API是由对于的负责人规划的，然后安排给对于的容器实现

版本号的化仍然是以下经典形式：

```js
大版本.小版本.修正版
```

譬如本框架在两年内迭代了`多`个大版本（涉及到底层），
使用起来变化较大就会变动小版本，
平时个别API新增和修复是修正版

这里因人而异，比如有的喜欢将API新增也变为小版本更新

## 借鉴与不足

本框架中在实现是吸取了不少市面上已有框架的经验，譬如：

- 钉钉（API设计上，可惜无法看到它底层实现...）

- phonegap,html5+,apicloud,appcan等都有接触过（但参考的不多）

- 一些`github`开源库，譬如[marcuswestin/WebViewJavascriptBridge](https://github.com/marcuswestin/WebViewJavascriptBridge)等

另外，在文章总结时，参考了一些博文，包括我以前写的文章（会在参考来源中）

## 源码

`github`上这个框架的实现

[quickhybrid/quickhybrid](https://github.com/quickhybrid/quickhybrid)
