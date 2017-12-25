---
layout:     post
title:      【quickhybrid】API多平台支撑的实现
category: blog
tags: quickhybrid hybrid
favour: quickhybrid
description: API多平台支撑的实现
---

## 前言

在框架规划时，就有提到过这个框架的一些常用功能需要支持`H5`环境下的调用，也就是需要实现API的多平台支撑

为什么要多平台支撑？核心仍然是复用代码，比如在微信下，在钉钉下，在quick容器下，
如果没有多平台支撑，那么`quick.ui.alert`只能用于quick容器下，钉钉和微信下就得分别用其它代码实现，
代码复用率低，如果实现了多平台支撑。那么三个平台中同一个功能的代码则是一样的。

## 什么样的多平台支撑

当然了，本框架实现的多平台支撑和一般框架的有点区别。

__一般的框架中支持多个平台更多的是一个polyfill__，譬如

```js
// 假设以前不支持h5
const oldToast = quick.ui.toast;

quick.ui.toast = function(...) {
    if (os.h5) {
        // 做一些h5中做的
        ...
    } else {
        oldToast(...);
    }
};
```

这就是垫片实现，如果是新的环境，用新的实现，否则用老的实现

而__本框架中的多平台实现是直接内置到了框架核心中__，也就是说框架本身就支持多平台API的设置

```js
quick.extendModule('ui', [{
    namespace: 'toast',
    os: ['h5'],
    defaultParams: {
        message: '',
    },
    runCode(...rest) {
        // 定义h5环境中的做法
        ...
    },
}, ...];

quick.extendModule('ui', [{
    namespace: 'toast',
    os: ['quick'],
    defaultParams: {
        message: '',
    },
    runCode(...rest) {
        // 定义quick环境中的做法
        ...
    },
}, ...];
```

在框架内部定义API时，不再是直接的`quick.ui.alert = xxx`，而是通过特定的API单独给某个环境下定义实现

而且，框架中的定义，每一个API都是有`quick`，`h5`环境下的实现的。

## 多平台支撑的核心

从上述的介绍中也可以看到，多平台支撑主要是前端的实现，与原生API，原生API在这里面只能算一个环境下的实现

核心就是基于：__`Object.defineProperty`，重写set和get__

```js
Object.defineProperty(apiParent, apiName, {
    configurable: true,
    enumerable: true,
    get: function proxyGetter() {
        // 需要根据不同的环境，返回对应下的内容
        ...
    },
    set: function proxySetter() {
        // 可以提示禁止修改API
    },
});
```

本框架中的多平台实现代码可以参考源码，这里不赘述，下文中会介绍如何简单的实现一个多平台支撑API

## 实现一个多平台支撑API

我们先预设最终的结果：

```js
quick.os.quick = true;
quick.ui.alert('hello'); // quick-hello

quick.os.quick = false;
quick.ui.alert('hello'); // h5-hello

quick.ui.alert = 11; // 提示：不允许修改quick API
```

那么要达到上述的要求，应该如何做呢？

### 写一个雏形

最简单的，先假设这些实现都已经存在，然后直接基于`defineProperty`返回

```js
function alertH5(message) {
    alert('h5-' + message);
}
function alertQuick(message) {
    alert('quick-' + message);
}
const quick = {};

quick.ui = {};
quick.os = {
    quick: false,
};

Object.defineProperty(quick.ui, 'alert', {
    configurable: true,
    enumerable: true,
    get: function proxyGetter() {
        // 需要根据不同的环境，返回对应下的内容
        if (quick.os.quick) {
            return alertQuick;
        } else {
            return alertH5;
        }
    },
    set: function proxySetter() {
        // 可以提示禁止修改API
        alert('不允许修改quick API');
    },
});
```

那么，它的调用结果是

```js
quick.os.quick = true;
quick.ui.alert('hello'); // quick-hello

quick.os.quick = false;
quick.ui.alert('hello'); // h5-hello

quick.ui.alert = 11; // 提示：不允许修改quick API
```

虽然效果和预设的一样，但是很明显还需优化完善

### 增加拓展API的方法

拓展方式的定义如下

```js
const quick = {};

quick.os = {
    quick: false,
};
/**
 * 存放所有的代理 api对象
 * 每一个命名空间下的每一个os都可以执行
 * proxyapi[namespace][os]
 */
const proxysApis = {};
// 支持的所有环境
const supportOsArray = ['quick', 'h5'];

function getCurrProxyApiOs(currOs) {
    for (let i = 0, len = supportOsArray.length; i < len; i += 1) {
        if (currOs[supportOsArray[i]]) {
            return supportOsArray[i];
        }
    }

    // 默认是h5
    return 'h5';
}

// 如获取quick.ui.alert
function getModuleApiParentByNameSpace(module, namespace) {
    let apiParent = module;
    // 只取命名空间的父级,如果仅仅是xxx，是没有父级的
    const parentNamespaceArray = /[.]/.test(namespace) ? namespace.replace(/[.][^.]+$/, '').split('.') : [];

    parentNamespaceArray.forEach((item) = >{
        apiParent[item] = apiParent[item] || {};
        apiParent = apiParent[item];
    });

    return apiParent;
}

function proxyApiNamespace(apiParent, apiName, finalNameSpace) {
    // 代理API，将apiParent里的apiName代理到Proxy执行
    Object.defineProperty(apiParent, apiName, {
        configurable: true,
        enumerable: true,
        get: function proxyGetter() {
            // 确保get得到的函数一定是能执行的
            const nameSpaceApi = proxysApis[finalNameSpace];

            // 得到当前是哪一个环境，获得对应环境下的代理对象
            return nameSpaceApi[getCurrProxyApiOs(quick.os)] || nameSpaceApi.h5;
        },
        set: function proxySetter() {
            alert('不允许修改quick API');
        },
    });
}

function extendApi(moduleName, apiParam) {
    if (!apiParam || !apiParam.namespace) {
        return;
    }

    if (!quick[moduleName]) {
        quick[moduleName] = {};
    }

    const api = apiParam;
    const modlue = quick[moduleName];
    const apiNamespace = api.namespace;
    const apiParent = getModuleApiParentByNameSpace(modlue, apiNamespace);
    // 最终的命名空间是包含模块的
    const finalNameSpace = moduleName + '.' + apiNamespace;
    // 如果仅仅是xxx，直接取xxx，如果aa.bb，取bb
    const apiName = /[.]/.test(apiNamespace) ? api.namespace.match(/[.][^.]+$/)[0].substr(1) : apiNamespace;

    // 这里防止触发代理，就不用apiParent[apiName]了，而是用proxysApis[finalNameSpace]
    if (!proxysApis[finalNameSpace]) {
        // 如果还没有代理这个API的命名空间，代理之，只需要设置一次代理即可
        proxyApiNamespace(apiParent, apiName, finalNameSpace);
    }

    // 一个新的API代理，会替换以前API命名空间中对应的内容
    const apiRuncode = api.runCode;
    const oldProxyNamespace = proxysApis[finalNameSpace] || {};

    proxysApis[finalNameSpace] = {};

    supportOsArray.forEach((osTmp) = >{
        if (api.os && api.os.indexOf(osTmp) !== -1) {
            // 如果存在这个os，并且合法，重新定义
            proxysApis[finalNameSpace][osTmp] = apiRuncode;
        } else if (oldProxyNamespace[osTmp]) {
            // 否则仍然使用老版本的代理
            proxysApis[finalNameSpace][osTmp] = oldProxyNamespace[osTmp];
        }
    });
}

function extendModule(moduleName, apis) {
    if (!apis || !Array.isArray(apis)) {
        return;
    }
    if (!quick[moduleName]) {
        quick[moduleName] = [];
    }
    for (let i = 0, len = apis.length; i < len; i += 1) {
        extendApi(moduleName, apis[i]);
    }

}

quick.extendModule = extendModule;
```

上述代码中增加了些复杂度，有一个统一管理所有代理调用的池，然后每次会更新对于环境下的代理

基于上述的方式可以如下拓展对于环境下的API

```js
quick.extendModule('ui', [{
    namespace: 'alert',
    os: ['h5'],
    defaultParams: {
        message: '',
    },
    runCode(message) {
        alert('h5-' + message);
    },
}]);

quick.extendModule('ui', [{
    namespace: 'alert',
    os: ['quick'],
    defaultParams: {
        message: '',
    },
    runCode(message) {
        alert('quick-' + message);
    },
}]);
```

最终的调用如下（结果和预期一致）

```js
quick.os.quick = true;
quick.ui.alert('hello'); // quick-hello
quick.os.quick = false;
quick.ui.alert('hello'); // h5-hello
quick.ui.alert = 11; // 提示：不允许修改quick API
```

虽然就一两个API来说，这类拓展方式看起来很复杂，但是当API一多，特别是还需批量预处理时（如默认参数，Promise支持等），它的优势就出来了

### 多平台支撑在quick中的应用

quick hybrid框架中，默认支持`quick`和`h5`有种环境，核心代码就是上述列举的（当然，内部增加了一些代理，默认参数处理等，会稍微复杂一点）。

基于这个核心，然后可以将框架的定义和API定义分开打包

```js
quick.js
quick.h5.js
```

这样，最终看起来`h5`下的API定义就是一个拓展包，是没有它也不会影响quick环境下的使用，而且，如果增加一个新的环境(比如dd)，
只需要再新增另一个环境的拓展包而已，各种写法都是一样的，这样便于了统一维护

## 返回根目录

- [【quickhybrid】如何实现一个Hybrid框架](https://github.com/quickhybrid/quickhybrid/issues/12)

## 源码

`github`上这个框架的实现

[quickhybrid/quickhybrid](https://github.com/quickhybrid/quickhybrid)
