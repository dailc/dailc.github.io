---
layout:     post
title:      洗牌算法-扑克牌原来这么玩！
category: blog
tags: 算法
favour: 算法
description: 洗牌算法的一个实际应用实例，基于洗牌算法实现扑克牌游戏中的随机发牌功能。
---

## 前言
在逛`segmentfault`论坛时，遇到了这样一个提问: **如何实现扑克牌的随机发牌算法？**
然后花了点时间解答，顺便记录于本文之中。
原题链接: [https://segmentfault.com/q/1010000008581427/a-1020000008584021](https://segmentfault.com/q/1010000008581427/a-1020000008584021)

## 思路与大纲
遇到这种需求，首先进行需求分析如下:

* 猜测是题主是在做一个扑克牌游戏
* 需要实现随机发牌功能，可能是发`1,2,...,N(N<=54)`张

因此，可以得出如下结论: **这是一个典型的洗牌算法问题**，只要解决了扑克牌随机洗牌，自然发出的牌顺序是打乱的。

同时，为了后续可能的需求变更(比如变为多幅牌发牌-`升级`游戏就是两副牌的)，需要保证代码的通用性与可拓展性。

## 代码实现(JS实现)

```
// 洗牌算法，传入一个数组，随机乱序排列,为了通用性，不污染原数组
// 这个作为公用的方法
function shuffle(arr) {
    if (!arr || !Array.isArray(arr)) {
        throw '错误，请传入正确的数组格式';
    }

    var newArr = arr.slice(0);
    for (var i = newArr.length - 1; i >= 0; i--) {
        // 随机范围[0,1)
        var randomIndex = Math.floor(Math.random() * (i + 1));
        var itemAtIndex = newArr[randomIndex];
        newArr[randomIndex] = newArr[i];
        newArr[i] = itemAtIndex;
    }

    return newArr;
}

// 扑克牌的构造函数
function Poker() {
    // 第一步:定义四个花色，这里就用中文了
    var cardType = ['黑桃', '红桃', '梅花', '方块'];

    // 第二步:定义13张普通牌
    var cardValue = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    // 第三步:定义2张特殊牌，大王与小王
    var specialCard = ['大王', '小王'];

    // 第四步:根据上述数组生成54张牌
    var allCards = [];
    for (var i = 0,
    len1 = cardType.length; i < len1; i++) {
        for (var j = 0,
        len2 = cardValue.length; j < len2; j++) {
            allCards.push(cardType[i] + cardValue[j]);
        }
    }
    allCards = allCards.concat(specialCard);

    this.originalPokers = allCards;
    this.pokers = this.originalPokers;
}

// 扑克牌的洗牌
Poker.prototype.shuffle = function() {
    // 洗牌-不污染原先的数组,每次用原始的扑克洗牌
    // 每次洗牌后都是一副新的牌
    this.pokers = shuffle(this.originalPokers);
};

// 扑克牌的发牌
Poker.prototype.dealPokers = function(num) {
    // 删除，会改变原来的pokers数组,已经没有了则会返回[]
    return this.pokers.splice(0, num);
};

// 测试用例
// 生成一副扑克牌
var poker = new Poker();
// 洗牌
poker.shuffle();
// 多次发牌
console.log(poker.dealPokers(1));
console.log(poker.dealPokers(3));
console.log(poker.dealPokers(10));
console.log("剩余扑克:");
console.log(poker.pokers);
```

### 代码详解
上述代码中核心算法是洗牌算法，其余只是基于这个洗牌算法进行拓展的实际应用代码。

## 洗牌算法
洗牌算法一般可分为两种:

* 原始洗牌算法
* 现代优化方法

以上代码其实是属于现代优化方法的。以下分别介绍原始算法与现代方法。

### 原始洗牌算法
也称为`Fisher–Yates shuffle的原始版，实现如下:

* `1-N`存储在原始列表list1中 
* 随机洗好的牌存储在新列表list2中
* 随机生成一个数字k(1到剩下的数字(包括这个数字))
* 从低位开始，得到第 k 个数字(这个数字还没有被取出)，取出，并存在list2中
* 重复第三步，重新生成k，直到所有数字都被取出
* 取出的这个列表，就是原始列表的随机排序列表，完成算法

这个算法的特点是，时间复杂度为 `O(N^2)`

### 现代优化算法
这个优化算法去除了无用的重复计算，实现如下:

* `1-N`存储在列表list中，当前索引为index=N
 * 随机生成一个数字k(1到index(包括这个数字))
* 交换第k为和第index位元素的值
* index--
* 如果index到了最后一位(1)，则退出循环，这时候list已经被随机排序了，完成算法

这个算法相比原生算法，直接将时间复杂度缩小到了`O(N)`

## 附录

### 原文链接
[https://dailc.github.io/2017/03/07/shufflePoker.html](https://dailc.github.io/2017/03/07/shufflePoker.html)
