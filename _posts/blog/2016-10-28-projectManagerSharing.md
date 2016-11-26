---
layout:     post
title:      一次项目经理之旅
category: blog
tags: 经验分享 项目经验分享
favour: 项目经验
description: 某一次机缘巧合的成为了某个项目的项目经理，总结下经验
---
## 前言
> 无数开发人员，设计人员在心里咒骂着项目经理，但谁又能明白他们心里的苦！

## 背景
本文中的项目经理一般是指一些“传统软件”公司中的项目主负责人，往往由开发人员担任。

正常来说，项目经理往往是把控着整个项目，掌握着生杀大权，而且很专业，懂开发又会管理。但是由于某些中小型公司往往会把项目经理由一些“软件实施”担任*(而这些实施大部分都对开发不熟悉)*，再加上这些中小公司由于成本原因，又不会再开设产品经理一职，所以在这些公司中，项目经理往往也担任着产品经理的角色，常常基于客户的某些“灵机一动”各种改需求，所以自然而然也同时背负着产品经理特有的“被骂，被吐嘈光环”。

> 产品说: 怪我喽！

本文中的项目经理正是这种环境下的特定产物。

## 初次担任项目经理
**其实一开始我是拒绝的...** 当我从老大那得知要我担任××项目的项目经理时，我心里有点忐忑。因为这是我以前没有接触过得领域，恰好也是我比较薄弱的环节，但是一想到这是一次绝佳的锻炼自己的机会，再加上上级的任务也不好直接拒绝，所以就开始扛起了这个项目。

## 第一关:和客户沟通需求
接手这个项目，打开需求文档，一看有点蒙圈*(因为需求文档都是一些通用的官方用语,什么建设××项目，包括××功能，但是仔细琢磨起来根本就不知道做什么---这里稍微吐嘈下，需求文档是商务直接起草的)*

所以不得不拿起电话，和客户沟通起具体的需求*(当时的心里其实非常忐忑，为了打出那个沟通电话，自己盯着手机考虑了半个多小时，组织和各种可能的讲话场景，最终才下定决心拨出了那个电话)*

* 或许是因为我本身是一个内向性格，不爱主动沟通，所以内心是比较排斥这些繁琐的沟通工作的，但奈何工作要求，不得不挑战自己
* 再加上我一向又是一个“三思而后行”的人，每次做一件事情都得思前想后，所以才会这么艰难的和客户沟通

不过这也间接的证明了一点，**术业有专攻** 平时一些开发人员“瞧不起”的项目经理，至少在和沟通方面是要普遍强于那些普通开发人员的，所以请不要以自己的价值观和世界观去评判他人，因为你自身的认知是有局限的，**你无法在自己不熟悉不专业的领域去否定他人**

## 第二关:项目预算把控
了解了项目需求后，由于我本身是一个开发人员，是做前端相关技术研究性工作的，再加上也做过一些简单的后台开发，会初步评估一些后台工作量，再加上对改项目相关领域比较熟悉*(也正是由于这个原因才成为了项目经理)* 所以先自行评估了下工作量，初步算算预算。

初步评估完后，心里感觉慌慌的-因为我觉得这么点的项目预算根本就无法完成这个项目的这些需求。

于是都得各种忙里忙外的沟通，找上级，找客户，最终沟通下来:

* 页面不要走设计流程了，参考××项目就行了*(因为按照恼人的规范流程，一套设计流程走下来预算就去掉了一大把...)*
* 不要实施人员，自己及时和客户进行沟通*(因为实施人员意味着经常会驻场，和客户沟通，耗费的都是项目预算，所以这种小型项目直接可以砍掉了)*
* 开发人员尽量少，自己操刀担任前端开发，再分配一个后台开发即可*(那时候觉的专业的后台人员会比较后,简直too naive)*

做完上述工作，感觉这个项目完成下来，应该还能省下不少预算，当时还觉的挺满意的。

**说明下:某些公司接手项目后，一般是先会根据实际情况，拨出一个预算的，整个项目进行预算不能超过这个额度，否则相应奖金就靠不住了，甚至有可能受罚**

## 第三关:协调开发人员
到了这一步，开始正式开发了，于是又是各种沟通，最终终于征用到了某个部门的××实习生来写后台*(实习生是个深坑，请慎用～)*

然后自己为了省预算，无耻的仿照了××项目*(小项目，不面向大众，所以无奈之举，请勿模仿～)* 

这样一套下来，相当于整个项目只用到了2个人，自然而然预算也会耗费的比较少。

## 第四关:项目开发进度的把控
这一步也是实际开发人员的工作*(平时一些负责项目业务开发的人员的工作基本上就是参与各个项目的开发)*

项目开发一般按照比较规范的开发流程，又分外:

* 前端页面开发*(这里为了省预算,省去了原型,设计部分,直接仿××项目进行页面开发)*
* 模拟接口数据定义*(前后端分离，前端会先用模拟接口，省去和后台人员对接工作)*
* 后台同时业务，接口开发*(这样后台,前端同时开发，同时后台可以根据模拟接口进行自测，开发效率较高)*
* 整体对接调试*(最终将所有对接工作一次性走流程过掉，省去大部分的沟通损耗)*
* 后期测试，bug修改工作*(这里由于当初贪心，为了省预算，直接省去了测试流程，所以导致了后期各种遇坑，所以提醒下，不管怎么样，测试否不能少...)*

开发中，除了担任开发进行功能开发工作外，作为项目经理的我还得不停的催促后台人员进度*(没办法，每个人的想法都不一样，有的人你不催促他，他就不会动，或许这就是所谓了拖延症，懒癌...)*

## 第五关: 埋坑之第一弹

只有和某些实习生合作过，你才会明白他们给你带来的各种伤害*(各种问题不会，找你帮忙调试bug，各种粗心，导致隐藏bug，各种突发情况，不来上班，导致项目无法继续，以及各种给后来人员埋的深坑)*

**当然，先声明，我这里并没有歧视实习生的意思(毕竟每个人曾经都是实习生)，我这里指的是那些没有责任意识，没有进取心的某些人**

在这过程中，我帮他调试了无数bug，指出了无数的不足，最终的结果就是 **实习生走了，换来了一位新的兄弟继续着这个项目...**

> 多么痛得领悟，我总是最后才知道...

## 第六关: 埋坑之第二弹
好不容易把所有功能都弄完了，最后直接进行上线试运行*(因为省预算直接自行简单测试，省去了标准流程)*

但是正是由于省去了测试，导致试运行中出现了各种问题 **这里得提一下，开发人员的思路和普通用户是不一样的，对你来说合情合理的东西，对用户来说可能不可理解，所以往往最终会出现一些意料不到的问题，所以还是奉劝进行严谨的测试**

于是，只能不断的打补丁，勉强维持着项目的运行
> 程序中的bug是无尽的，所以请尽量避免自己挖坑往里面跳，这样会造成很多不必要的损耗！

## 第七关: 艰难的项目验收
终于所有功能都已经完成了，项目也已经试运行一段时间了，接下来就可以让客户验收了。

但正是这个验收工作确实如此的艰难，大致流程是这样的:

* 身为项目经理的我不想自己去客户那验收，因此申请商务验收*(就是签下合同的那位仁兄)*
* 商务仁兄很忙，不愿意浪费时间在这个小项目上，因此提出按照规定应该是项目经理去验收
* 身为项目经理的我觉的面对客户特别忐忑*(有一部分原因是觉的做出来的东西太×了，自己心里过不去---诚实的少年)*，再加上最终本身就是要商务收款的，所以继续申请商务去验收
* 然后大家都因为很忙，把这件事件抛在脑后，忘记了*(也许是主观的忘记，不愿想起而已～)*
* 很长一段时间后，才在上级的催促下“主动记忆”起这件事情，硬着头皮去验收。
* 最终，发现验收离开发完成，已经前前后后过了好几个月了

之后我就开始反思，为何会这么艰难，为什么平时都很认真负责的我，对于验收这件事情这么排斥和拒绝呢？我觉得:

* 第一:因为在我潜意识里，觉的项目已经试运行了，客观上已经完成了，我的主要工作已经完成了，接下来不想再去面对自己排斥的事情了
* 第二:正式由于我排斥繁琐的沟通，所以导致了沟通工作不到位，期间闲置了很久*(很多时候，我们开发人员吐嘈项目经理，也是因为有很多项目经理不主动推进，把控力度差)*
* 第三:我主观的忘记掉了这件事情，把有限的精力投入到了更有兴趣的工作*(我觉得这应该是一个主要原因，我有一个最大的特点就是，单线程工作，只要遇到烦心事请，效率就会大大降低，所以有时候我自己会主动忘却一些我觉得不重要的烦心事情)*

整个项目结束后，我其实是对自己不太满的，觉得没有达到自己的预期，但实际上又合情合理，因为没有人能够第一次就把事情做的很完美*(一些我们眼中的牛人也许也只是对于我们而言的完美，对于他们自己的要求来说，也许并不够)*

## 2016-11-17补充
验收过程有出现了曲折，需要沟通协商双方的时间，还会被放鸽子，最终，在17日，终于完成了验收，归档了，总之，不易。对于现阶段的我来说，我宁愿去研究解决技术难点，也不愿意做这种繁琐的沟通工作(现阶段而言...)

## 总结: 项目经理与开发人员的区别
整个项目下来，最大的感受就是 项目经理确实不同于开发人员，视角不一样了，向最开始做开发人员时，一般都只会关注自己手中的工作，做完了就了事了，但是项目经理却的把控全局，推进项目，各种沟通，所以说，真正要做一个好的项目经理是很难的*(这也就是为什么优秀的项目经理并不多)*

当然了，其实我最近较长一段时间内的目标应该都是 **技术相关** 这次项目经理只是相当于一次人生体验而已～

> 好吧，人与人之间最主要的其实是沟通！

## 结束语
> 闻道有先后，术业有专攻，不要以自己的眼光去评判他人，要不然只能是井底观天！