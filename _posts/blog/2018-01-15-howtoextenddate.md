---
layout:     post
title:      如何继承Date对象？由一道题彻底弄懂JS继承。
category: blog
tags: JS继承
favour: JS继承
description: 包括使用多种黑魔法来实现Date的继承。以及ES5与ES6继承的区别。以及继承的一些原理。
---

## 前言

**见解有限，如有描述不当之处，请帮忙及时指出，如有错误，会及时修正。**

**----------长文+多图预警，需要花费一定时间----------**

故事是从一次实际需求中开始的。。。

某天，某人向我寻求了一次帮助，要协助写一个日期工具类，要求：

- 此类继承自`Date`，拥有Date的所有属性和对象

- 此类可以自由拓展方法

形象点描述，就是要求可以这样：

```js
// 假设最终的类是 MyDate，有一个getTest拓展方法
let date = new MyDate();

// 调用Date的方法，输出GMT绝对毫秒数
console.log(date.getTime());
// 调用拓展的方法，随便输出什么，譬如helloworld!
console.log(date.getTest());
```

于是，随手用JS中经典的**组合寄生法**写了一个继承，然后，刚准备完美收工，一运行，却出现了以下的情景：

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_error1.png)

但是的心情是这样的： **😳囧**

以前也没有遇到过类似的问题，然后自己尝试着用其它方法，多次尝试，均无果（不算暴力混合法的情况），其实回过头来看，是因为思路新奇，凭空想不到，并不是原理上有多难。。。

于是，借助强大的搜素引擎，搜集资料，最后，再自己总结了一番，才有了本文。

**----------正文开始前----------**

正文开始前，各位看官可以先暂停往下读，尝试下，在不借助任何网络资料的情况下，是否能实现上面的需求？（就以`10分钟`为限吧）

## 大纲

- 先说说如何快速快速寻求解答

    - stackoverflow上早就有答案了！
    
    - 倘若用的是中文搜索。
    
- 分析问题的关键

    - 经典的继承法有何问题
    
    - 为什么无法被继承？

- 该如何实现继承？

    - 暴力混合法

    - ES5黑魔法
    
    - ES6大法
    
    - ES6写法，然后babel打包
    
- 几种继承的细微区别

- ES6继承与ES5继承的区别

- 构造函数与实例对象

- 如何快速判断是否继承？

- 写在最后的话

## 先说说如何快速快速寻求解答

遇到不会的问题，肯定第一目标就是如何快速寻求解决方案，答案是：

- 先去stackoverflow上看看有没有类似的题。。。

于是，借助搜索引擎搜索了下，第一条就符合条件，点开进去看描述

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_search.png)

### stackoverflow上早就有答案了！

先说说结果，再浏览一番后，确实找到了解决方案，然后回过头来一看，惊到了，因为这个问题的提问时间是`6 years, 7 months ago`。
也就是说，`2011`年的时候就已经有人提出了。。。

感觉自己落后了一个时代**>_<**。。。

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_search2.png)

而且还发现了一个细节，那就是`viewed:10,606 times`，也就是说至今一共也才一万多次阅读而已，考虑到前端行业的从业人数，这个比例惊人的低。
以点见面，看来，遇到这个问题的人并不是很多。

### 倘若用的是中文搜索。

用中文搜索并不丢人（我遇到问题时的本能反应也是去百度）。结果是这样的：

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_search3.png)

嗯，看来英文关键字搜索效果不错，第一条就是符合要求的。然后又试了试中文搜索。

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_search4.png)
![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_search5.png)

效果不如人意，搜索前几页，唯一有一条看起来比较相近的（`segmentfault`上的那条），点进去看

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_search6.png)
![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_search7.png)

怎么说呢。。。这个问题关注度不高，浏览器数较少，而且上面的问题描述和预期的有点区别，仍然是有人回答的。
不过，虽然说问题在一定程度上得到了解决，但是回答者绕过了无法继承这个问题，有点未竟全功的意思。。。

## 分析问题的关键

借助stackoverflow上的回答

### 经典的继承法有何问题

先看看本文最开始时提到的经典继承法实现，如下：

```js
/**
 * 经典的js组合寄生继承
 */
function MyDate() {
    Date.apply(this, arguments);
    this.abc = 1;
}

function inherits(subClass, superClass) {
    function Inner() {}
    
    Inner.prototype = superClass.prototype;
    subClass.prototype = new Inner();
    subClass.prototype.constructor = subClass;
}

inherits(MyDate, Date);

MyDate.prototype.getTest = function() {
    return this.getTime();
};


let date = new MyDate();

console.log(date.getTest());
```

就是这段代码⬆，这也是JavaScript高程（红宝书）中推荐的一种，一直用，从未失手，结果现在马失前蹄。。。

我们再回顾下它的报错：

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_error1.png)

再打印它的原型看看：

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_proto.png)

怎么看都没问题，因为按照原型链回溯规则，`Date`的所有原型方法都可以通过`MyDate`对象的原型链往上回溯到。
再仔细看看，发现它的关键并不是找不到方法，而是`this is not a Date object.`

嗯哼，也就是说，关键是：**由于调用的对象不是Date的实例，所以不允许调用，就算是自己通过原型继承的也不行**

### 为什么无法被继承？

首先，看看`MDN`上的解释，上面有提到，JavaScript的日期对象只能通过`JavaScript Date`作为构造函数来实例化。

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_explain.png)

然后再看看stackoverflow上的回答：

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_explain2.png)

有提到，`v8`引擎底层代码中有限制，如果调用对象的`[[Class]]`不是`Date`，则抛出错误。

总的来说，结合这两点，可以得出一个结论：

**要调用Date上方法的实例对象必须通过Date构造出来，否则不允许调用Date的方法**

## 该如何实现继承？

虽然原因找到了，但是问题仍然要解决啊，真的就没办法了么？当然不是，事实上还是有不少实现的方法的。

### 暴力混合法

首先，说说说下暴力的混合法，它是下面这样子的：

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_mix.png)

说到底就是：内部生成一个`Date`对象，然后此类暴露的方法中，把原有`Date`中所有的方法都代理一遍，而且严格来说，这根本算不上继承（都没有原型链回溯）。

### ES5黑魔法

然后，再看看ES5中如何实现？

```js
// 需要考虑polyfill情况
Object.setPrototypeOf = Object.setPrototypeOf ||
function(obj, proto) {
    obj.__proto__ = proto;

    return obj;
};

/**
 * 用了点技巧的继承，实际上返回的是Date对象
 */
function MyDate() {
    // bind属于Function.prototype，接收的参数是：object, param1, params2...
    var dateInst = new(Function.prototype.bind.apply(Date, [Date].concat(Array.prototype.slice.call(arguments))))();

    // 更改原型指向，否则无法调用MyDate原型上的方法
    // ES6方案中，这里就是[[prototype]]这个隐式原型对象，在没有标准以前就是__proto__
    Object.setPrototypeOf(dateInst, MyDate.prototype);

    dateInst.abc = 1;

    return dateInst;
}

// 原型重新指回Date，否则根本无法算是继承
Object.setPrototypeOf(MyDate.prototype, Date.prototype);

MyDate.prototype.getTest = function getTest() {
    return this.getTime();
};

let date = new MyDate();

// 正常输出，譬如1515638988725
console.log(date.getTest());
```

一眼看上去不知所措？没关系，先看下图来理解：（原型链关系一目了然）

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/extend_date_es5_prototype.png)

可以看到，用的是非常巧妙的一种做法：

- 正常继承的情况如下：

    - `new MyDate()`返回实例对象`date`是由`MyDate`构造的

    - 原型链回溯是: `date(MyDate对象)->date.__proto__->MyDate.prototype->MyDate.prototype.__proto__->Date.prototype`

- 这种做法的继承的情况如下：

    - `new MyDate()`返回实例对象`date`是由`Date`构造的
    
    - 原型链回溯是: `date(Date对象)->date.__proto__->MyDate.prototype->MyDate.prototype.__proto__->Date.prototype`
    
可以看出，关键点在于：

- 构造函数里返回了一个真正的`Date`对象（由`Date`构造，所以有这些内部类中的关键`[[Class]]`标志），所以它有调用`Date`原型上方法的权利

- 构造函数里的Date对象的`[[ptototype]]`（对外，浏览器中可通过`__proto__`访问）指向`MyDate.prototype`，然后`MyDate.prototype`再指向`Date.prototype`。
所以最终的实例对象仍然能进行正常的原型链回溯，回溯到原本Date的所有原型方法

- 这样通过一个巧妙的欺骗技巧，就实现了完美的Date继承。不过补充一点，`MDN`上有提到**尽量不要修改对象的`[[Prototype]]`**，因为这样可能会干涉到浏览器本身的优化。
**如果你关心性能，你就不应该在一个对象中修改它的 [[Prototype]]**

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_protowarn.png)

### ES6大法

当然，除了上述的ES5实现，ES6中也可以直接继承（自带支持继承`Date`），而且更为简单：

```js
class MyDate extends Date {
    constructor() {
        super();
        this.abc = 1;
    }
    getTest() {
        return this.getTime();
    }
}

let date = new MyDate();

// 正常输出，譬如1515638988725
console.log(date.getTest());
```

对比下ES5中的实现，这个真的是简单的不行，直接使用ES6的Class语法就行了。

而且，也可以正常输出。

注意：**这里的正常输出环境是直接用ES6运行，不经过babel打包，打包后实质上是转化成ES5的，所以效果完全不一样**

### ES6写法，然后Babel打包

虽然说上述ES6大法是可以直接继承Date的，但是，考虑到实质上大部分的生产环境是：`ES6 + Babel`

**直接这样用ES6 + Babel是会出问题的**

不信的话，可以自行尝试下，Babel打包成ES5后代码大致是这样的：

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_babel.png)

然后当信心满满的开始用时，会发现：

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_error1.png)

对，又出现了这个问题，也许这时候是这样的**⊙?⊙**

因为转译后的ES5源码中，**仍然是通过`MyDate`来构造**，
而`MyDate`的构造中又无法修改属于`Date`内部的`[[Class]]`之类的私有标志，
因此构造出的对象仍然不允许调用`Date`方法（调用时，被引擎底层代码识别为`[[Class]]`标志不符合，不允许调用，抛出错误）

由此可见，ES6继承的内部实现和Babel打包编译出来的实现是有区别的。
（虽说Babel的polyfill一般会按照定义的规范去实现的，但也不要过度迷信）。

## 几种继承的细微区别

虽然上述提到的三种方法都可以达到继承`Date`的目的-混合法严格说不能算继承，只不过是另类实现。

于是，将所有能打印的主要信息都打印出来，分析几种继承的区别，大致场景是这样的：

可以参考：（ 请进入调试模式）[https://dailc.github.io/fe-interview/demo/extends_date.html](https://dailc.github.io/fe-interview/demo/extends_date.html)

从上往下，`1, 2, 3, 4`四种继承实现分别是：（排出了混合法）

- ES6的Class大法

- 经典组合寄生继承法

- 本文中的取巧做法，Date构造实例，然后更改`__proto__`的那种

- ES6的Class大法，Babel打包后的实现（无法正常调用的）

```js
~~~~以下是MyDate们的prototype~~~~~~~~~
Date {constructor: ƒ, getTest: ƒ}
Date {constructor: ƒ, getTest: ƒ}
Date {getTest: ƒ, constructor: ƒ}
Date {constructor: ƒ, getTest: ƒ}

~~~~以下是new出的对象~~~~~~~~~
Sat Jan 13 2018 21:58:55 GMT+0800 (CST)
MyDate2 {abc: 1}
Sat Jan 13 2018 21:58:55 GMT+0800 (CST)
MyDate {abc: 1}

~~~~以下是new出的对象的Object.prototype.toString.call~~~~~~~~~
[object Date]
[object Object]
[object Date]
[object Object]

~~~~以下是MyDate们的__proto__~~~~~~~~~
ƒ Date() { [native code] }
ƒ () { [native code] }
ƒ () { [native code] }
ƒ Date() { [native code] }

~~~~以下是new出的对象的__proto__~~~~~~~~~
Date {constructor: ƒ, getTest: ƒ}
Date {constructor: ƒ, getTest: ƒ}
Date {getTest: ƒ, constructor: ƒ}
Date {constructor: ƒ, getTest: ƒ}

~~~~以下是对象的__proto__与MyDate们的prototype比较~~~~~~~~~
true
true
true
true
```

看出，主要差别有几点：

1. MyDate们的__proto__指向不一样

2. Object.prototype.toString.call的输出不一样

3. 对象本质不一样，可以正常调用的`1, 3`都是`Date`构造出的，而其它的则是`MyDate`构造出的

我们上文中得出的一个结论是：**由于调用的对象不是由Date构造出的实例，所以不允许调用，就算是自己的原型链上有Date.prototype也不行**

但是这里有两个变量：**分别是底层构造实例的方法不一样，以及对象的`Object.prototype.toString.call`的输出不一样**。
（另一个`MyDate.__proto__`可以排除，因为原型链回溯肯定与它无关）

万一它的判断是根据`Object.prototype.toString.call`来的呢？那这样结论不就有误差了？

于是，根据ES6中的，`Symbol.toStringTag`，使用黑魔法，动态的修改下它，排除下干扰：

```js
// 分别可以给date2，date3设置
Object.defineProperty(date2, Symbol.toStringTag, {
    get: function() {
        return "Date";
    }
});
```

然后在打印下看看，变成这样了：

```js
[object Date]
[object Date]
[object Date]
[object Object]
```

可以看到，第二个的`MyDate2`构造出的实例，虽然打印出来是`[object Date]`，但是调用Date方法仍然是有错误

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/date_extend_error1.png)

此时我们可以更加准确一点的确认：**由于调用的对象不是由Date构造出的实例，所以不允许调用**

而且我们可以看到，就算通过黑魔法修改`Object.prototype.toString.call`，内部的`[[Class]]`标识位也是无法修改的。
（这块知识点大概是Object.prototype.toString.call可以输出内部的[[Class]]，但无法改变它，由于不是重点，这里不赘述）。

## ES6继承与ES5继承的区别

从上午中的分析可以看到一点：ES6的Class写法继承是没问题的。但是换成ES5写法就不行了。

所以ES6的继承大法和ES5肯定是有区别的，那么究竟是哪里不同呢？（主要是结合的本文继承Date来说）

区别：（以`SubClass`，`SuperClass`，`instance`为例）

- ES5中继承的实质是：（那种经典组合寄生继承法）

    - 先由子类（`SubClass`）构造出实例对象this
    
    - 然后在子类的构造函数中，将父类（`SuperClass`）的属性添加到`this`上，`SuperClass.apply(this, arguments)`
    
    - 子类原型（`SubClass.prototype`）指向父类原型（`SuperClass.prototype`）
    
    - 所以`instance`是子类（`SubClass`）构造出的（所以没有父类的`[[Class]]`关键标志）
    
    - 所以，`instance`有`SubClass`和`SuperClass`的所有实例属性，以及可以通过原型链回溯，获取`SubClass`和`SuperClass`原型上的方法
    
- ES6中继承的实质是：

    - 先由父类（`SuperClass`）构造出实例对象this，这也是为什么必须先调用父类的`super()`方法（子类没有自己的this对象，需先由父类构造）
    
    - 然后在子类的构造函数中，修改this（进行加工），譬如让它指向子类原型（`SubClass.prototype`），这一步很关键，否则无法找到子类原型（*注，子类构造中加工这一步的实际做法是推测出的，从最终效果来推测*）
    
    - 然后同样，子类原型（`SubClass.prototype`）指向父类原型（`SuperClass.prototype`）
    
    - 所以`instance`是父类（`SuperClass`）构造出的（所以有着父类的`[[Class]]`关键标志）
    
    - 所以，`instance`有`SubClass`和`SuperClass`的所有实例属性，以及可以通过原型链回溯，获取`SubClass`和`SuperClass`原型上的方法

以上⬆就列举了些重要信息，其它的如静态方法的继承没有赘述。（静态方法继承实质上只需要更改下`SubClass.__proto__`到`SuperClass`即可）

可以看着这张图快速理解：

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/extend_es5_and_es6.png)

有没有发现呢：**ES6中的步骤和本文中取巧继承Date的方法一模一样，不同的是ES6是语言底层的做法，有它的底层优化之处，而本文中的直接修改__proto__容易影响性能**

__ES6中在super中构建this的好处？__

因为ES6中允许我们继承内置的类，如Date，Array，Error等。如果this先被创建出来，在传给Array等系统内置类的构造函数，这些内置类的构造函数是不认这个this的。
所以需要现在super中构建出来，这样才能有着super中关键的`[[Class]]`标志，才能被允许调用。（否则就算继承了，也无法调用这些内置类的方法）

## 构造函数与实例对象

看到这里，不知道是否对上午中频繁提到的**构造函数**，**实例对象**有所混淆与困惑呢？这里稍微描述下：

要弄懂这一点，需要先知道`new`一个对象到底发生了什么？先形象点说：

### new MyClass()中，都做了些什么工作

```js
function MyClass() {
    this.abc = 1;
}

MyClass.prototype.print = function() {
    console.log('this.abc:' + this.abc);
};

let instance = new MyClass();
```

譬如，上述就是一个标准的实例对象生成，都发生了什么呢？

步骤简述如下：（**参考MDN**，还有部分关于底层的描述略去-如[[Class]]标识位等）

1. 构造函数内部，创建一个新的对象，它继承自`MyClass.prototype`，`let instance = Object.create(MyClass.prototype);`
    
2. 使用指定的参数调用构造函数`MyClass`，并将 this绑定到新创建的对象，`MyClass.call(instance);`，执行后拥有所有实例属性

3. 如果构造函数返回了一个“对象”，那么这个对象会取代整个`new`出来的结果。如果构造函数没有返回对象，那么new出来的结果为步骤1创建的对象。
（一般情况下构造函数不返回任何值，不过用户如果想覆盖这个返回值，可以自己选择返回一个普通对象来覆盖。当然，返回数组也会覆盖，因为数组也是对象。）

结合上述的描述，大概可以还原成以下代码：（简单还原，不考虑各种其它逻辑）

```js
let instance = Object.create(MyClass.prototype);
let innerConstructReturn = MyClass.call(instance);
let innerConstructReturnIsObj = typeof innerConstructReturn === 'object' || typeof innerConstructReturn === 'function';

return innerConstructReturnIsObj ? innerConstructReturn : instance;
```

- 注意⚠️：

    - 普通的函数构建，可以简单的认为就是上述步骤
    
    - 实际上对于一些内置类（如Date等），并没有这么简单，还有一些自己的隐藏逻辑，譬如`[[Class]]`标识位等一些重要私有属性。
    
        - 譬如可以在MDN上看到，以常规函数调用Date（即不加 new 操作符）将会返回一个字符串，而不是一个日期对象，如果这样模拟的话会无效
        
觉得看起来比较繁琐？可以看下图梳理：

![](https://dailc.github.io/staticResource/blog/basicKnowledge/extenddate/extend_new_obj.png)
        
那现在再回头看看。
        
__什么是构造函数？__

如上述中的`MyClass`就是一个构造函数，在内部它构造出了`instance`对象

__什么是实例对象？__

`instance`就是一个实例对象，它是通过`new`出来的？

__实例与构造的关系__

有时候浅显点，可以认为构造函数是xxx就是xxx的实例。即：

```js
let instance = new MyClass();
```

此时我们就可以认为`instance`是`MyClass`的实例，因为它的构造函数就是它

### 实例就一定是由对应的构造函数构造出的么？

**不一定**，我们那ES5黑魔法来做示例

```js
function MyDate() {
    // bind属于Function.prototype，接收的参数是：object, param1, params2...
    var dateInst = new(Function.prototype.bind.apply(Date, [Date].concat(Array.prototype.slice.call(arguments))))();

    // 更改原型指向，否则无法调用MyDate原型上的方法
    // ES6方案中，这里就是[[prototype]]这个隐式原型对象，在没有标准以前就是__proto__
    Object.setPrototypeOf(dateInst, MyDate.prototype);

    dateInst.abc = 1;

    return dateInst;
}
```

我们可以看到`instance`的最终指向的原型是`MyDate.prototype`，而`MyDate.prototype`的构造函数是`MyDate`，
因此可以认为`instance`是`MyDate`的实例。

但是，**实际上，`instance`却是由`Date`构造的**

我们可以继续用`ES6`中的`new.target`来验证。

**注意⚠️**

关于`new.target`，`MDN`中的定义是：**new.target返回一个指向构造方法或函数的引用**。

嗯哼，也就是说，返回的是构造函数。

我们可以在相应的构造中测试打印：

```js
class MyDate extends Date {
    constructor() {
        super();
        this.abc = 1;
        console.log('~~~new.target.name:MyDate~~~~');
        console.log(new.target.name);
    }
}

// new操作时的打印结果是：
// ~~~new.target.name:MyDate~~~~
// MyDate
```

然后，可以在上面的示例中看到，就算是ES6的Class继承，`MyDate`构造中打印`new.target`也显示`MyDate`，
但实际上它是由`Date`来构造（有着`Date`关键的`[[Class]]`标志，因为如果不是Date构造（如没有标志）是无法调用Date的方法的）。
**这也算是一次小小的勘误吧。**

所以，实际上**用`new.target`是无法判断实例对象到底是由哪一个构造构造的（这里指的是判断底层真正的`[[Class]]`标志来源的构造）**

再回到结论：**实例对象不一定就是由它的原型上的构造函数构造的，有可能构造函数内部有着寄生等逻辑，偷偷的用另一个函数来构造了下**,
当然，简单情况下，我们直接说实例对象由对应构造函数构造也没错（不过，在涉及到这种Date之类的分析时，我们还是得明白）。

## 如何快速判断是否继承？

其实，在判断继承时，没有那么多的技巧，就只有关键的一点：**`[[prototype]]`（`__ptoto__`）的指向关系**

譬如：

```js
console.log(instance instanceof SubClass);
console.log(instance instanceof SuperClass);
```

实质上就是：

- `SubClass.prototype`是否出现在`instance`的原型链上

- `SuperClass.prototype`是否出现在`instance`的原型链上

然后，对照本文中列举的一些图，一目了然就可以看清关系。有时候，完全没有必要弄的太复杂。

## 写在最后的话

由于继承的介绍在网上已经多不胜数，因此本文没有再重复描述，而是由一道Date继承题引发，展开。（关键就是原型链）

不知道看到这里，各位看官是否都已经弄懂了JS中的继承呢？

另外，遇到问题时，多想一想，有时候你会发现，其实你知道的并不是那么多，然后再想一想，又会发现其实并没有这么复杂。。。

## 附录

### 博客

初次发布`2018.01.15`于我个人博客上面

[http://www.dailichun.com/2018/01/15/howtoextenddate.html](http://www.dailichun.com/2018/01/15/howtoextenddate.html)


### 参考资料

- [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)

- [https://stackoverflow.com/questions/6075231/how-to-extend-the-javascript-date-object/30882416](https://stackoverflow.com/questions/6075231/how-to-extend-the-javascript-date-object/30882416)

- [http://exploringjs.com/es6/ch_classes.html#sec_essentials-classes](http://exploringjs.com/es6/ch_classes.html#sec_essentials-classes)

- [http://blog.csdn.net/github_36978270/article/details/71896444](http://blog.csdn.net/github_36978270/article/details/71896444)

- [http://blog.csdn.net/pcaxb/article/details/53784309](http://blog.csdn.net/pcaxb/article/details/53784309)

- [http://blog.csdn.net/kittyjie/article/details/50494915](http://blog.csdn.net/kittyjie/article/details/50494915)
