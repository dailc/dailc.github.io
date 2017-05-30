---
layout:     post
title:      【字符编码系列】JavaScript使用的编码-UCS-2
category: blog
tags: 字符编码
favour: 字符编码
description: 字符编码系列文章之一，介绍Javascript使用的内置编码UCS-2，介绍UCS-2与UTF-16的区别。
---

## 写在前面的话
在JavaScrip中，进行一些`GBK`或者`UTF-8`编码的字符操作时，打印出来的经常是乱码，其原因就是因为JavaScript当然内置编码是`UCS-2`(UTF-16的子集)。
所以弄懂JavaScript的内置编码还是很有必要的，否则对于一些字符操作，如GBK和UTF-8转换时就会模糊不清，无法完全理解。

## 大纲

* UCS-2和UTF-16的区别
* JavaScript使用哪一种编码
  * 为什么选用UCS-2
  * UCS-2的局限
  * 特别注意ES6

## UCS-2和UTF-16的区别
关于UCS与Unicode的互相关系与影响这里就不详细介绍了，详情可以参考[【字符编码系列】字符，字符集，字符编码解惑](http://www.jianshu.com/p/a5a510b31b6b)

有一点需要记住: UCS与Unicode的码点是完全一致的。

### 发布时间上的区别

* UCS-2是UCS组织开发的，于1990年公布
* UTF-16是Unicode组织开发的，与1996年7月公布

### 编码的区别

* UCS-2是一种定长的编码方式，用两位字节来表示一位码位，码位范围为: `0到0xFFFF的`
* UTF-16是一种变长编码，它兼容UCS-2，同时可以表示UCS-2无法表示的码位，范围为:`0到0x10FFFF`。在UCS-2覆盖的范围内，UTF-16用2个字节来表示，其它字符用2个字节来表示
* 在常见的字符码位中，UCS-2和UTF-16可以认为是同一个意思

### 总结

* UTF-16是UCS-2的超集

也就是是说**UTF-16取代了UCS-2，或者说UCS-2整合进入了UTF-16**。所以现在一般只有UTF-16，没有UCS-2。

## JavaScript使用哪一种编码
**JavaScript使用的编码是UCS-2**

### 为什么使用UCS-2而不是UTF-16
因为在JavaScript出现的时候，还没有UTF-16。

* 1990年公布UCS-2
* 1995年5月，Brendan Eich用了10天设计了JavaScript语言
* 10月，第一个解释引擎问世
* 1996年11月，Netscape正式向ECMA提交语言标准
1996年7月公布UTF-16

所以，JavaScript诞生的时候，没有选择，只能使用UCS-2。

*关于为什么不使用UTF-8，则是因为UCS-2编码在内存方面的操作及使用效率会更高*

### UCS-2的局限
由于JavaScript只能处理UCS-2编码，造成所有字符在这门语言中都是2个字节，如果是4个字节的字符，会当作两个双字节的字符处理。

所以，遇到本身应该用4个字节表示的字符时，JavaScript读出来就会不准确，甚至乱码。

例如:`亖`这个字符为例，它的UTF-16编码是4个字节的0xD834 DF06。
4个字节的编码不属于UCS-2，JavaScript不认识，只会把它看作单独的两个字符U+D834和U+DF06。这两个码点是空的，所以JavaScript会认为`亖`是两个空字符组成的字符串！

### 特别注意ES6
以上使用UCS-2的JavaScript只针对于ES5及以前的版本。
对于ES6及以后的JavaScript，是支持识别4个字节码点的。

也就是说: **ES6及其以后的JavaScript可以认为内置编码是UTF-16**

*tips: 是否支持ES6由具体的实现引擎决定*



## 附录
### 参考资料

* [Unicode与JavaScript详解](http://www.ruanyifeng.com/blog/2014/12/unicode.html)
* [JavaScript的内部字符编码是UCS-2还是UTF-16](http://www.techweb.com.cn/network/system/2016-10-11/2407639.shtml)
* [UTF-16与UCS-2的区别](http://demon.tw/programming/utf-16-ucs-2.html)
* [维基百科.字符编码](https://zh.wikipedia.org/wiki/%E5%AD%97%E7%AC%A6%E7%BC%96%E7%A0%81)