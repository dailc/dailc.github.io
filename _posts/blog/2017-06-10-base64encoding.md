---
layout:     post
title:      【字符编码系列】Base64编码原理以及实现
category: blog
tags: 字符编码 base64编码
favour: base64编码
description: 字符编码系列文章之一，介绍Base64编码原理以及实现
---

## 写在前面的话
本文属于 字符编码系列文章之一，更多请前往  [字符编码系列](http://www.jianshu.com/p/94c9086a0fe5)。

## 大纲

* 简介
* 编码原理
* 转码对照表
* 示例步骤分析
* 源码实现

## 简介
Base64是一种编码方式，通常用于将二进制数据编码为可打印字符组成的数据格式。

### 为什么要有Base64编码
在很久以前，发送邮件时只支持ASCII字符的发送，如果有非ASCII码字符，则发送不了，于是需要在不改变传统协议的情况下，做一种扩展方案来支持这类字符的传送。Base64编码应运而生。

### Base64的常见误区
很多开发者喜欢直接用Base64进行加密解密工作，实际上这个是完全无意义的，因为Base64这种编码规则是公开的，基本只要有程序能力都能解开，所以请勿用作加密用途。

Base64编码的主要的作用不在于安全性，而在于让内容能在网络间无错的传输。(常用语编码特殊字符，编码小型二进制文件等)

## 编码原理

* 将数据按照 3个8位字节一组的形式进行处理，每3个8位字节在编码之后被转换为4个6位字节
  * 即`3*8=24`变为`4*6=24`
  * 在编码后的6位的前面补两个0，形成8位一个字节的形式
  * 这样，编码后3个8位字节则自动转化成4个6位字节了
  * 原因是2的6次方为64，所以每6个位为一个单元，可以转换为对应64个字符中的某一个
* 当数据的长度无法满足3的倍数的情况下，最后的数据需要进行填充操作
  * 当原数据不是3的整数倍时，会自动补0。也就是说，如果原数据剩余1个字节，那么，另外两个都是补的0，如果剩余2个字节，另外一个字节补得0。
  * 然后编码时，对于后面自动补0的字符，会用`=`作为填充字符(这里`=`不是第65个字符，仅仅做填充作用)
 * 之所以要用`=`号进行填充是为了解码时方便还原(因为`=`号只需要还原为`0`即可)

### 解码

* 解码是编码的逆过程
* 其中的`=`号还原为`0`即可

## 转码对照表
每6个单元高位补2个零形成的字节位于0~63之间，通过在转码表中查找对应的可打印字符。“=”用于填充。如下所示为转码表。

![](http://upload-images.jianshu.io/upload_images/3437876-ea79a939654e9fa6.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 示例步骤分析
以”Word”字符串的编码和解码为例。

### 编码

```
├  原始字符 | W | o | r | d(由于不是3的倍数,所以要补0) |
├─────────────────────────────────|
├ ASCII码 |  87 | 111 | 114 | 100 |
├─────────────────────────────────|
├ 8bit字节 |  01010111 | 01101111 | 01110010 | 01100100 | 00000000 | 00000000 |
├─────────────────────────────────|
├ 6bit字节 |  010101 | 110110 | 111101 | 110010 | 011001 | 000000 | 000000 | 000000 |
├─────────────────────────────────|
├ B64十进制 |  21 | 54 |   61 |    50 | 25 | 0(注意,这里有两位是d里面的,所以是正常的0) | 异常(需要补上=号) | 异常 |
├─────────────────────────────────|
├ 对应编码 |  V | 2 | 9 | y | Z | A | = | = |
└───────────────────────────────────────────
```
所以’Word’的编码结果是V29yZA==

### 解码

```
├ 原始编码 |  V | 2 | 9 | y | Z | A | = | = |
├─────────────────────────────────|
├ B64十进制 |  21 | 54 |   61 |    50 | 25 | 0 | 异常 | 异常 |
├─────────────────────────────────|
├ 6bit字节 |  010101 | 110110 | 111101 | 110010 | 011001 | 000000 | 000000 | 000000 |
├─────────────────────────────────|
├ 8bit字节 |  01010111 | 01101111 | 01110010 | 01100100 | 00000000 | 00000000 |
├─────────────────────────────────|
├ ASCII码 |  87 | 111 | 114 | 100 |异常 |异常 |
├─────────────────────────────────|
├  对应字符 | W | o | r | d | 无 | 无 |
└───────────────────────────────────────────
```
由此可见,解码过程就是编码过程的逆过程。

## 源码实现
需要注意的是,实际编码时需要注意程序内部的编码,例如Javascript内置的编码现在可以看成是UTF-16,所以如果编码成GBK或UTF-8时需要经过一定的转换

```
/**
 * @description 创建一个base64对象
 */
(function(base64) {
    /**
     * Base64编码要求把3个8位字节（3*8=24）转化为4个6位的字节（4*6=24），
     * 之后在6位的前面补两个0，形成8位一个字节的形式。
     * 由于2的6次方为64， 所以每6个位为一个单元， 对应某个可打印字符。
     * 当原数据不是3的整数倍时， 如果最后剩下两个输入数据，
     * 在编码结果后加1个“=；如果最后剩下一个输入数据，编码结果后加2个“=；
     * 如果没有剩下任何数据，就什么都不要加，这样才可以保证资料还原的正确性。
     */
    /**
     * base64转码表,最后一个=号是专门用来补齐的
     */
    var keyTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    /**
     * @description 将一个目标字符串编码为base64字符串
     * @param {String} str 传入的目标字符串
     * 可以是任何编码类型,传入什么类型就输出成了什么样的编码
     * 由于js内置是utf16编码,而服务器端一般不使用这种,
     * 所以传入的编码一般是采取utf8或gbk的编码
     * @return {String} 编码后的base64字符串
     */
    function encodeBase64(str) {
        if (!str) {
            return '';
        }
        // 遍历索引
        var i = 0;
        var len = str.length;
        var res = [];
        var c1, c2, c3 = '';
        // 用来存对应的位置
        var enc1, enc2, enc3, enc4 = '';
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xFF;
            c2 = str.charCodeAt(i++);
            c3 = str.charCodeAt(i++);
            enc1 = c1 >> 2;
            enc2 = ((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F);
            enc3 = ((c2 & 0x0F) << 2) | ((c3 & 0xC0) >> 6);
            enc4 = c3 & 0x3F;
            // 专门用来补齐=号的
            if (isNaN(c2)) {
                enc3 = enc4 = 0x40;
            } else if (isNaN(c3)) {
                enc4 = 0x40;
            }
            res.push(keyTable.charAt(enc1));
            res.push(keyTable.charAt(enc2));
            res.push(keyTable.charAt(enc3));
            res.push(keyTable.charAt(enc4));
            c1 = c2 = c3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        }
        return res.join('');
    };
    /**
     * @description 解码base64字符串，还原为编码前的结果
     * @param {String} str 传入的目标字符串
     * 可以是任何编码类型,传入什么类型就输出成了什么样的编码
     * 由于js内置是utf16编码,而服务器端一般不使用这种,
     * 所以传入的编码一般是采取utf8或gbk的编码
     * @return {String} 编码后的base64字符串
     */
    function decodeBase64(str) {
        if (!str) {
            return '';
        }
        // 这里要判断目标字符串是不是base64型,如果不是,直接就不解码了
        // 两层判断
        if (str.length % 4 != 0) {
            return "";
        }
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if (base64test.exec(str)) {
            return "";
        }
        var len = str.length;
        var i = 0;
        var res = [];
        var code1, code2, code3, code4;
        var c1, c2, c3 = '';
        while (i < len) {
            code1 = keyTable.indexOf(str.charAt(i++));
            code2 = keyTable.indexOf(str.charAt(i++));
            code3 = keyTable.indexOf(str.charAt(i++));
            code4 = keyTable.indexOf(str.charAt(i++));

            c1 = (code1 << 2) | (code2 >> 4);
            c2 = ((code2 & 0xF) << 4) | (code3 >> 2);
            c3 = ((code3 & 0x3) << 6) | code4;

            res.push(String.fromCharCode(c1));

            if (code3 != 64) {
                res.push(String.fromCharCode(c2));
            }
            if (code4 != 64) {
                res.push(String.fromCharCode(c3));
            }
        }
        return res.join('');
    };

    /**
     * @description 将字符串进行base64编码，之后再进行uri编码
     * @param {String} str 传入的utf16编码
     * @param {String} type 类别，是utf8，gbk还是utf16，默认是utf16
     * @param {Boolean} isUri 是否uri编码
     * @return {String} 编码后并uri编码的base64字符串
     */
    base64.encode = function(str, type, isUri) {
        type = type || 'utf16';
        if (type == 'gbk') {
            // 转成 gbk
            str = exports.utf16StrToGbkStr(str);
        } else if (type == 'utf8') {
            // 转成 utf8
            str = exports.utf16StrToUtf8Str(str);
        }
        // 否则就是默认的utf16不要变
        // 先b64编码，再uri编码(防止网络传输出错)
        var b64Str = encodeBase64(str);
        if (isUri) {
            b64Str = encodeURIComponent(b64Str);
            console.log(b64Str);
        }
        return b64Str;
    };

    /**
     * @description 将字符串先进行uri解码，再进行base64解码
     * @param {String} str 传入的编码后的base64字符串
     * @param {String} type 类别，是utf8，gbk还是utf16，默认是utf16
     * @param {Boolean} isUri 是否uri解码
     * @return {String} 编码后并uri编码的base64字符串
     */
    base64.decode = function(str, type, isUri) {
        type = type || 'utf16';
        if (isUri) {
            str = decodeURIComponent(str);
        }
        var decodeStr = decodeBase64(str);
        if (type == 'gbk') {
            return exports.gbkStrToUtf16Str(decodeStr);
        } else if (type == 'utf8') {
            return exports.utf8StrToUtf16Str(decodeStr);
        }
        // 否则就是默认的utf16不要变
        return decodeStr;
    };
})(exports.Base64 = {});
```

### 源码
详细可以参考源码: [https://github.com/dailc/charset-encoding-series](https://github.com/dailc/charset-encoding-series)

## 附录
### 参考资料

* [老的CSDN博文](http://blog.csdn.net/u010979495/article/details/50601511)
* [JavaScript: 详解Base64编码和解码](https://my.oschina.net/goal/blog/201032?fromerr=vEgm5b1A#OSC_h2_1)