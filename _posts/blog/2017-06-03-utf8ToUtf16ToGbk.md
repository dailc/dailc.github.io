---
layout:     post
title:      【字符编码系列】JavaScript使用的编码-UCS-2
category: blog
tags: 字符编码
favour: 字符编码
description: 字符编码系列文章之一，介绍Javascript使用的内置编码UCS-2，介绍UCS-2与UTF-16的区别。
---

## 写在前面的话
本文属于 字符编码系列文章之一，更多请前往  [字符编码系列](http://www.jianshu.com/p/94c9086a0fe5)。

## 大纲

* 不同编码转换的理论基础
  * UTF-16转UTF-8
  * UTF-16转GBK
* UTF-16和UTF-8之间的转换
* UTF-16和GBK之间的转换

## 不同编码转换的理论基础
不同的编码直接如何转换的，这里先简单的描述下UTF-16、UTF-8、GBK直接的转换过程。

由于本文是基于JavaScript的，而JS现在的编码可以认为是UTF-16，所以都会经过UTF-16中转。

### UTF-16转UTF-8
这两者都是Unicode，所以有一个大前提就是码点一致，仅仅是对于码点的编码方式不一致而已，因为UTF-16可以认为是固定2字节的实现(4字节的比较少见)，所以参考如下Unicode和UTF-8转换关系表即可:

| Unicode编码| UTF-8字节流 |
| :------------- |:-------------|
| U+00000000 - U+0000007F | 0xxxxxxx |
| U+00000080 - U+000007FF | 110xxxxx 10xxxxxx |
| U+00000800 - U+0000FFFF | 1110xxxx 10xxxxxx 10xxxxxx |
| U+00010000 - U+001FFFFF | 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx |
| U+00200000 - U+03FFFFFF | 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx |
| U+04000000 - U+7FFFFFFF | 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx |

所以UTF16和UTF8之间的相互转换可以通过上表的转换表来实现，判断Unicode码所在的区间就可以得到这个字符是由几个字节所组成，之后通过移位来实现,分为新的多个字节来存储。

### UTF-16转GBK
UTF-16和GBK直接的转换就稍微复杂点，因为Unicode和GBK的码点不一致，因此需要GBK个Unicode的码点映射关系表才能进行相应转换。

这里GBK和Unicode的码点映射表由于太长了，就不单独列出来，可以参考:[Unicode编码和GBK的转换映射表](https://directory.fsf.org/wiki/Libiconv) (如果链接不可用可以自动搜索或者参考博客中的源码链接)

然后通用，拿到Unicode码点后可以根据映射表转换为GBK码点，然后用GBK的编码方式编码即可完成转换

## UTF-16和UTF-8之间的转换

### UTF-16转UTF-8

#### 步骤描述

* Step1:获取该字符对应的Unicode码
* Step2:判断该Unicode码所在的范围,根据不同的范围,来决定存储它的字节长度。
  * 如果介于U+00000000 – U+0000007F之间,代表该字符采取一个字节存储,那么直接通过这个新字节的unicode码,即可转换为UTF-8码(这是这里的一种简称,不同的编程语言有不同实现,例如可以用两个字节来存储一个字符的信息,解码时进行判断,如果发现是UTF-8的多字节实现,那么将多字节合并后再转为一个字符输出).转换完毕
  * 如果介于U+00000080 – U+000007FF之间,代表该字符采取两个字节存储,那么将该Unicode码转为二进制,取出高5位(这里不分大端序和小端序，只以实际的码为准，具体实现可以采取移位实现)，并加上头部110，组成第一个字节；再取出低6位(按顺序取),加上头部10，组成第二个字节。然后分别通过两个新的字节的unicode码,可以转换为相应的UTF-8码.转换完毕
  * 如果介于U+00000800 – U+0000FFFF之间,代表该字符采取三个字节存储,那么将该Unicode码转为二进制,取出高4位，并加上头部1110，组成第一个字节；再取出低6位(按顺序取),加上头部10，组成第二个字节；再取出低6位(按顺序取),加上头部10，组成第三个字节。然后分别通过三个新的字节的unicode码,可以转换为相应的UTF-8码.转换完毕
  * 如果介于U+00010000 – U+001FFFFF之间,代表该字符采取四个字节存储(实际上,四个字节或以上存储的字符是很少的),那么将该Unicode码转为二进制,取出高3位，并加上头部11110，组成第一个字节；再取出低6位(按顺序取),加上头部10，组成第二个字节；再取出低6位(按顺序取),加上头部10，组成第三个字节；再取出低6位(按顺序取),加上头部10，组成第四个字节。然后分别通过四个新的字节的unicode码,可以转换为相应的UTF-8码.转换完毕
  * 如果介于U+00200000 – U+03FFFFFF,代表该字符采取五个字节存储,那么将该Unicode码转为二进制,取出高2位，并加上头部111110，组成第一个字节；再取出低6位(按顺序取),加上头部10，组成第二个字节；再取出低6位(按顺序取),加上头部10，组成第三个字节；再取出低6位(按顺序取),加上头部10，组成第四个字节；再取出低6位(按顺序取),加上头部10，组成第五个字节。然后分别通过五个新的字节的unicode码,可以转换为相应的UTF-8码.转换完毕
  * 如果介于U+04000000 – U+7FFFFFFF,代表该字符采取六个字节存储,那么将该Unicode码转为二进制,取出高1位，并加上头部1111110，组成第一个字节；再取出低6位(按顺序取),加上头部10，组成第二个字节；再取出低6位(按顺序取),加上头部10，组成第三个字节；再取出低6位(按顺序取),加上头部10，组成第四个字节；再取出低6位(按顺序取),加上头部10，组成第五个字节；再取出低6位(按顺序取),加上头部10，组成第六个字节。然后分别通过六个新的字节的unicode码,可以转换为相应的UTF-8码.转换完毕

#### 代码实现

```
 /**
	 * @description 将utf-16编码字符串转为utf-8编码字符串
	 * @param {String} str 传入的 utf16编码字符串(javascript内置的就是utf16编码)
	 * @return {String} utf8编码的字符串,js打印会有乱码
	 */
exports.utf16StrToUtf8Str = function(str) {
    if (!str) {
        // ''字符属于ascii码,所以不必担心不同编码的转换问题
        return '';
    }
    // res是用来存放结果的字符数组,最终会转为字符串返回
    var res = [],
    len = str.length;
    for (var i = 0; i < len; i++) {
        var code = str.charCodeAt(i);
        if (code > 0x0000 && code <= 0x007F) {
            // 单字节，这里并不考虑0x0000，因为它是空字节
            // U+00000000 – U+0000007F  0xxxxxxx
            res.push(str.charAt(i));
        } else if (code >= 0x0080 && code <= 0x07FF) {
            // 双字节
            // U+00000080 – U+000007FF  110xxxxx 10xxxxxx
            // 110xxxxx
            // 0xC0 为12*16 = 192 二进制为 11000000
            // 0x1F为 31 二进制   00011111,因为第一个字节只取5位
            // code 右移六位是因为从高位开始取得,所以需要将低位的六位留到第二个字节
            var byte1 = 0xC0 | ((code >> 6) & 0x1F);
            // 10xxxxxx
            // 0x80为128 二进制为 10000000
            // 0x3F为63 二进制位 00111111,因为只需要取到低位的6位
            var byte2 = 0x80 | (code & 0x3F);
            res.push(String.fromCharCode(byte1), String.fromCharCode(byte2));
        } else if (code >= 0x0800 && code <= 0xFFFF) {
            // 三字节
            // U+00000800 – U+0000FFFF  1110xxxx 10xxxxxx 10xxxxxx
            // 1110xxxx
            // 0xE0 为224 二进制为 11100000
            // 同理,需要留下 12位给低位
            // 0x0F为15 00001111
            var byte1 = 0xE0 | ((code >> 12) & 0x0F);
            // 10xxxxxx
            // 再留6位给低位
            var byte2 = 0x80 | ((code >> 6) & 0x3F);
            // 10xxxxxx
            var byte3 = 0x80 | (code & 0x3F);
            res.push(String.fromCharCode(byte1), String.fromCharCode(byte2), String.fromCharCode(byte3));
        } else if (code >= 0x00010000 && code <= 0x001FFFFF) {
            // 四字节
            // U+00010000 – U+001FFFFF  11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
            // 同理,需要留下 18位给低位
            // 0x07 00000111
            // 0xF0  240 11110000
            var byte1 = 0xF0 | ((code >> 18) & 0x07);
            // 10xxxxxx
            // 再留12位给低位
            var byte2 = 0x80 | ((code >> 12) & 0x3F);
            // 再留6位给低位
            var byte3 = 0x80 | ((code >> 6) & 0x3F);
            // 10xxxxxx
            var byte4 = 0x80 | (code & 0x3F);
            res.push(String.fromCharCode(byte1), String.fromCharCode(byte2), String.fromCharCode(byte3), String.fromCharCode(byte4));
        } else if (code >= 0x00200000 && code <= 0x03FFFFFF) {
            // 五字节
            // U+00200000 – U+03FFFFFF  111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
            // 同理,需要留下 24位给低位
            // 0x03 00000011
            // 0xF8  248 11111000
            var byte1 = 0xF8 | ((code >> 24) & 0x03);
            // 10xxxxxx
            // 再留18位给低位
            var byte2 = 0x80 | ((code >> 18) & 0x3F);
            // 再留12位给低位
            var byte3 = 0x80 | ((code >> 12) & 0x3F);
            // 再留6位给低位
            var byte4 = 0x80 | ((code >> 6) & 0x3F);
            // 10xxxxxx
            var byte5 = 0x80 | (code & 0x3F);
            res.push(String.fromCharCode(byte1), String.fromCharCode(byte2), String.fromCharCode(byte3), String.fromCharCode(byte4), String.fromCharCode(byte5));
        } else
        /** if (code >= 0x04000000 && code <= 0x7FFFFFFF)*/
        {
            // 六字节
            // U+04000000 – U+7FFFFFFF  1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
            // 同理,需要留下 24位给低位
            // 0x01 00000001
            // 0xFC  252 11111100
            var byte1 = 0xFC | ((code >> 30) & 0x01);
            // 10xxxxxx
            // 再留24位给低位
            var byte2 = 0x80 | ((code >> 24) & 0x3F);
            // 再留18位给低位
            var byte3 = 0x80 | ((code >> 18) & 0x3F);
            // 再留12位给低位
            var byte4 = 0x80 | ((code >> 12) & 0x3F);
            // 再留6位给低位
            var byte5 = 0x80 | ((code >> 6) & 0x3F);
            // 10xxxxxx
            var byte6 = 0x80 | (code & 0x3F);
            res.push(String.fromCharCode(byte1), String.fromCharCode(byte2), String.fromCharCode(byte3), String.fromCharCode(byte4), String.fromCharCode(byte5), String.fromCharCode(byte6));
        }
    }
    return res.join('');
};
```

### UTF-8转UTF-16
#### 步骤描述

* Step1:获取该字符对应的Unicode码
* Step1:用该码的二进制和相应的关键字节相与,根据转换关系表,判断处于那一段区间,来判断是使用几个字节存储字符的,然后分别合并对应的字节数,组成新的字符输出。
  * 用该Unicode码的二进制右移7位后与(11111111)相与,如果得到了0,代表该字符只用了一个字节存储,所以直接输出该字符.转换完毕
  * 用该Unicode码的二进制右移5位后与(11111111)相与，如果得到了110(6),代表该字符占用了二个字节,所以分别获取该字符和下一个字符,然后分别取出本字节的低5位后左移6位和取出下一个字节的低6位(保持不变)，将2个字节相或，得到一个新的字节.这个字节就是最终字符的unicode码,然后转为对应的字符输出. 转换完毕
  * 用该Unicode码的二进制右移4位后与(11111111)相与，如果得到了1110(14),代表该字符占用了三个字节,所以分别获取该字符和下一个字符和下下个字符,然后分别取出本字节的低4位后左移12位和取出下一个字节的低6位后左移6位和取出下下一个字节的低6位(保持不变)，将3个字节相或，得到一个新的字节.这个字节就是最终字符的unicode码,然后转为对应的字符输出. 转换完毕
  * 用该Unicode码的二进制右移3位后与(11111111)相与，如果得到了11110(30),代表该字符占用了四个字节,所以分别获取该字符和下一个字符和下下个字符和下下下个字符,然后分别取出本字节的低3位后左移18位取出下一个字节的低6位后左移12位和和取出下下一个字节的低6位后左移6位和取出下下下一个字节的低6位(保持不变)，将4个字节相或，得到一个新的字节.这个字节就是最终字符的unicode码,然后转为对应的字符输出. 转换完毕
  * 用该Unicode码的二进制右移2位后与(11111111)相与，如果得到了111110(62),代表该字符占用了五个字节,所以分别获取该字符和下一个字符和下下个字符和下下下个字符和下下下下个字符,然后分别取出本字节的低2位后左移24位和取出下一个字节的低6位后左移18位和取出下下一个字节的低6位后左移12位和和取出下下下一个字节的低6位后左移6位和取出下下下下一个字节的低6位(保持不变)，将5个字节相或，得到一个新的字节.这个字节就是最终字符的unicode码,然后转为对应的字符输出. 转换完毕
  * 用该Unicode码的二进制右移1位后与(11111111)相与，如果得到了1111110(126),代表该字符占用了六个字节,所以分别获取该字符和下一个字符和下下个字符和下下下个字符和下下下下个字符和下下下下下个字符,然后分别取出本字节的低1位后左移30位和取出下一个字节的低6位后左移24位和取出下下一个字节的低6位后左移18位和取出下下下一个字节的低6位后左移12位和和取出下下下下一个字节的低6位后左移6位和取出下下下下下一个字节的低6位(保持不变)，将6个字节相或，得到一个新的字节.这个字节就是最终字符的unicode码,然后转为对应的字符输出. 转换完毕

#### 代码实现

```
/**
	 * @description UTF8编码字符串转为UTF16编码字符串
	 * @param {String} str utf8编码的字符串
	 * @return {String} utf16编码的字符串,可以直接被js用来打印
	 */
exports.utf8StrToUtf16Str = function(str) {
    if (!str) {
        return '';
    }
    // res是用来存放结果的字符数组,最终会转为字符串返回
    var res = [],
    len = str.length;
    for (var i = 0; i < len; i++) {
        // 获得对应的unicode码
        var code = str.charCodeAt(i);
        // 对第一个字节进行判断
        if (((code >> 7) & 0xFF) == 0x0) {
            // 0xFF 255 11111111,代表只取前8位
            // 右移7位,如果是只剩下0了,代表这个是单字节
            // 单字节
            // 0xxxxxxx
            res.push(str.charAt(i));
        } else if (((code >> 5) & 0xFF) == 0x6) {
            // 双字节 110开头  
            // 110xxxxx 10xxxxxx
            // 需要用到下一个字节
            var code2 = str.charCodeAt(++i);
            // 0x1F 31 00011111
            // 取到第一个字节的后5位,然后左移6位(这6位留给第二个字节的低6位)，由于js是number型,所以不必担心溢出
            var byte1 = (code & 0x1F) << 6;
            // 0x3F 63  00111111
            var byte2 = code2 & 0x3F;
            // 或运算,因为第一个字节第六位没有,第二个字节只有低6位,所以算是结合了
            var utf16 = byte1 | byte2;
            res.push(String.fromCharCode(utf16));
        } else if (((code >> 4) & 0xFF) == 0xE) {
            // 三字节 1110开头
            // 1110xxxx 10xxxxxx 10xxxxxx
            var code2 = str.charCodeAt(++i);
            var code3 = str.charCodeAt(++i);
            // 和00001111与后, 左移12位
            var byte1 = (code & 0x0F) << 12;
            // 和00111111与后,左移6位
            var byte2 = (code2 & 0x3F) << 6;
            // 和00111111与
            var byte3 = code3 & 0x3F
            var utf16 = byte1 | byte2 | byte3;
            res.push(String.fromCharCode(utf16));
        } else if (((code >> 3) & 0xFF) == 0x1E) {
            // 四字节 11110开头
            // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
            var code2 = str.charCodeAt(++i);
            var code3 = str.charCodeAt(++i);
            var code4 = str.charCodeAt(++i);
            // 和00000111与后, 左移18位
            var byte1 = (code & 0x07) << 18;
            // 和00111111与后,左移12位
            var byte2 = (code2 & 0x3F) << 12;
            // 和00111111与后,左移6位
            var byte3 = (code3 & 0x3F) << 6;
            // 和00111111与
            var byte4 = code4 & 0x3F
            var utf16 = byte1 | byte2 | byte3 | byte4;
            res.push(String.fromCharCode(utf16));
        } else if (((code >> 2) & 0xFF) == 0x3E) {
            // 五字节 111110开头
            // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
            var code2 = str.charCodeAt(++i);
            var code3 = str.charCodeAt(++i);
            var code4 = str.charCodeAt(++i);
            var code5 = str.charCodeAt(++i);
            // 和00000011与后, 左移24位
            var byte1 = (code & 0x03) << 24;
            // 和00111111与后,左移18位
            var byte2 = (code2 & 0x3F) << 18;
            // 和00111111与后,左移12位
            var byte3 = (code3 & 0x3F) << 12;
            // 和00111111与后,左移6位
            var byte4 = (code4 & 0x3F) << 6;
            // 和00111111与
            var byte5 = code5 & 0x3F
            var utf16 = byte1 | byte2 | byte3 | byte4 | byte5;
            res.push(String.fromCharCode(utf16));
        } else
        /** if (((code >> 1) & 0xFF) == 0x7E)*/
        {
            // 六字节 1111110开头
            // 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
            var code2 = str.charCodeAt(++i);
            var code3 = str.charCodeAt(++i);
            var code4 = str.charCodeAt(++i);
            var code5 = str.charCodeAt(++i);
            var code6 = str.charCodeAt(++i);
            // 和00000001与后, 左移30位
            var byte1 = (code & 0x01) << 30;
            // 和00111111与后,左移24位
            var byte2 = (code2 & 0x3F) << 24;
            // 和00111111与后,左移18位
            var byte3 = (code3 & 0x3F) << 18;
            // 和00111111与后,左移12位
            var byte4 = (code4 & 0x3F) << 12;
            // 和00111111与后,左移6位
            var byte5 = (code5 & 0x3F) << 6;
            // 和00111111与
            var byte6 = code6 & 0x3F
            var utf16 = byte1 | byte2 | byte3 | byte4 | byte5 | byte6;
            res.push(String.fromCharCode(utf16));
        }
    }
    return res.join('');
};
```
## UTF-16和GBK之间的转换
注意，这里为了篇幅，没有将GBK和Unicode的码表映射放进来，更多详细可以参考博文中的源码。

### UTF-16转GBK

#### 步骤描述

* Step1:获取该字符对应的Unicode码
* Step2:判断该Unicode的范围
  * 如果是普通的ASCII码,则不进行转换
  * 如果是大于127小于等于255的(标准码范围的,GBK兼容ISO-8859标准码的),根据映射表,转为对应的GBK码
  * 如果是大于255的(大于255代表一个字节装不下了,所以这时候不再是兼容模式,而是GBK的存储模式,需要两个字节来存储),就将改码根据Unicode个GBK的映射表，转换为GBK独特的双字节存储方式来存储(高字节区存储分区号,低字节去存储码号).转换完毕

#### 代码实现

```
/**
	 * @description 将utf16编码的字符串(js内置编码)转为GBK编码的字符串
	 * @param {String} str utf16编码的字符串(js内置)
	 * @return {String} 转换后gbk编码的字符串
	 */
exports.utf16StrToGbkStr = function(str) {
    if (!str) {
        return '';
    }
    // res是用来存放结果的字符数组,最终会转为字符串返回
    var res = [],
    len = str.length;
    for (var i = 0; i < len; i++) {
        // 获得对应的unicode码
        var code = str.charCodeAt(i);
        if (code < 0) {
            code += 65536;
        }
        if (code > 127) {
            code = unicode2GBKCode(code);
        }
        if (code > 255) {
            // gbk中,如果是汉字的,需要两位来表示
            // 对所收录字符进行了“分区”处理，分为若干区,每区若干码位
            // 第一个字节为“高字节”，对应不同分区
            // 第二个字节为“低字节”，对应每个区的不同码位
            var varlow = code & 65280;
            // 取得低位				
            varlow = varlow >> 8;
            // 取得高位
            var varhigh = code & 255;
            res.push(String.fromCharCode(varlow));
            res.push(String.fromCharCode(varhigh));
        } else {
            res.push(String.fromCharCode(code));
        }
    }
    return res.join('');
};
/**
	 * @description 将unicode通过查表转换,转为gbk的code
	 * @param {Number} chrCode 字符unicode编码
	 */
function unicode2GBKCode(chrCode) {
    var chrHex = chrCode.toString(16);
    chrHex = "000" + chrHex.toUpperCase();
    chrHex = chrHex.substr(chrHex.length - 4);
    var i = unicodeCharTable.indexOf(chrHex);
    if (i != -1) {
        chrHex = gbkCharTable.substr(i, 4);
    }
    return parseInt(chrHex, 16)
};
```

### GBK转UTF-16

#### 步骤描述

* Step1:获取该字符对应的Unicode码
* Step2:判断该Unicode的范围
  * 如果是普通的ASCII码,则不进行转换,直接输出
  * 否则,需要根据GBK和Unicode的对应关系,转换为Unicode码
  * 需要注意的是,这里由于GBK采取双字节编码的,所以需要用到两个字节,转码时需要将编码时的运算逆转,转为Unicode码,然后再输出相应的字符.转换完毕

#### 代码实现

```
/**
	 * @description 将GBK编码的字符串转为utf16编码的字符串(js内置编码)
	 * @param {String} str GBK编码的字符串
	 * @return {String} 转化后的utf16字符串
	 */
exports.gbkStrToUtf16Str = function(str) {
    if (!str) {
        return '';
    }
    // res是用来存放结果的字符数组,最终会转为字符串返回
    var res = [],
    len = str.length;
    for (var i = 0; i < len; i++) {
        // 获得对应的unicode码
        var code = str.charCodeAt(i);
        // 如果不是ASCII码
        if (code > 127) {
            // 转为unicode	
            // 这里左移8位是因为编码时,被右移了8位
            code = gbkCode2Unicode((code << 8) + str.charCodeAt(++i));
        } else {
            // 普通的ASCII码,什么都不做				
        }
        res.push(String.fromCharCode(code));
    }
    return res.join('');
};
/**
	 * @description将 gbk的对应的code通过查表转换,转为unicode
	 * @param {Number} chrCode gbk字符对应的编码
	 */
function gbkCode2Unicode(chrCode) {
    //以16进制形式输出字符串
    var chrHex = chrCode.toString(16);
    //
    chrHex = "000" + chrHex.toUpperCase();
    //
    chrHex = chrHex.substr(chrHex.length - 4);

    var i = gbkCharTable.indexOf(chrHex);

    if (i != -1) {
        chrHex = unicodeCharTable.substr(i, 4);
    }
    return parseInt(chrHex, 16)
};
```

### 源码
为了篇幅，如GBK何Unicode的码表映射没有直接放在文中，详细可以参考源码: [https://github.com/dailc/charset-encoding-series](https://github.com/dailc/charset-encoding-series)

## 附录
### 参考资料

* [老的CSDN博文](http://blog.csdn.net/u010979495/article/details/50601511)
* [JavaScript: 详解Base64编码和解码](https://my.oschina.net/goal/blog/201032?fromerr=vEgm5b1A#OSC_h2_1)
* [Unicode与JavaScript详解](http://www.ruanyifeng.com/blog/2014/12/unicode.html)
* [维基百科.字符编码](https://zh.wikipedia.org/wiki/%E5%AD%97%E7%AC%A6%E7%BC%96%E7%A0%81)