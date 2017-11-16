---
layout:     post
title:      【开源】canvas图像裁剪、压缩、旋转
category: blog
tags: 图像处理工具 图像处理
favour: 图像处理工具
description: 基于canvas，对图像进行裁剪、缩放、压缩、旋转等操作
---

## 前言

前段时间遇到了一个移动端对图像进行裁剪、压缩、旋转的需求。
考虑到已有各轮子的契合度都不高，于是自己重新造了一个轮子。

## 关于图像裁剪、压缩

在HTML5时代，`canvas`的功能已经非常强大了，可以进行像素级的操作。像图像裁剪、压缩就都是基于`canvas`来实现的。

关于其中原理，无非就是利用`canvas`自带的API，复杂一点的就是裁剪框以及旋转后的坐标计算，因此不再赘述。

本文中的图像裁剪、压缩都是基于`canvas`完成的。


## 图像裁剪

功能包括：

- `canvas`绘制图片

- 裁剪框选择裁剪大小

- 旋转功能

- 放大镜（方便旋转）

- 裁剪功能

- 缩放、压缩功能（通过参数控制）

## 示例

[https://dailc.github.io/image-process/examples/clip.html](https://dailc.github.io/image-process/examples/clip.html)

![](https://dailc.github.io/image-process/screenshot/qrcode_clip.png)

### 效果

![](https://dailc.github.io/image-process/screenshot/imageclip1.png)
![](https://dailc.github.io/image-process/screenshot/imageclip2.png)
![](https://dailc.github.io/image-process/screenshot/imageclip3.png)
![](https://dailc.github.io/image-process/screenshot/imageclip4.png)
![](https://dailc.github.io/image-process/screenshot/imageclip.gif)

### 使用

引入

```js
dist/image-clip.css
dist/image-clip.js
```

全局变量

```js
ImageClip
```

调用方法

```js
var cropImage = new ImageClip(options);

cropImage.method()
```

### API

__resetClipRect__

重置裁剪框，重新变为最大

```js
cropImage.resetClipRect();
```

__clip__

裁剪图像，根据当前的裁剪框进行裁剪

```js
cropImage.clip();
```

__getClipImgData__

获取已裁剪的图像

```js
var base64 = cropImage.getClipImgData();
```

__rotate__

旋转图片

```js
cropImage.clip(isClockWise);
```

__destroy__

销毁当前的裁剪对象

如果一个容器需要重新生成裁剪对象，一定要先销毁以前的

```js
cropImage.destroy();
```

### 更多

关于详细参数说明与更多使用

请参考`源码`

## 图像缩放

上述的图片裁剪中其实已经附带缩放功能，但是鉴于那是基于整套裁剪流程的，不满足一些场景（譬如只要针对图片压缩的）。

因此，单独又将图像缩放提取成一个模块，以适用于此类场景。

功能包括：

- 图像的缩放、压缩

- 一些常用的缩放算法（双立方，双线性，近邻）

## 示例

[https://dailc.github.io/image-process/examples/scale.html](https://dailc.github.io/image-process/examples/scale.html)

[https://dailc.github.io/image-process/examples/scale_compress.html](https://dailc.github.io/image-process/examples/scale_compress.html)

![](https://dailc.github.io/image-process/screenshot/qrcode_scale1.png)

### 效果

__示例较为粗糙__

![](https://dailc.github.io/image-process/screenshot/imagescale1.png)

### 使用

引入

```js
dist/image-scale.js
```

全局变量

```js
ImageScale
```

调用方法

```js
ImageScale.method()
```

### API

__scaleImageData__

对`ImageData`类型的数据进行缩放，将数据放入新的`ImageData`中

```js
ImageScale.scaleImageData(imageData, newImageData, {
    // 0: nearestNeighbor
    // 1: bilinearInterpolation
    // 2: bicubicInterpolation
    // 3: bicubicInterpolation2
    processType: 0,
});
```

__scaleImage__

对`Image`类型的对象进行缩放，返回一个`base64`字符串

```js
var base64 = ImageScale.scaleImage(image, {
    width: 80,
    height: 80,
    mime: 'image/png',
    // 0: nearestNeighbor
    // 1: bilinearInterpolation
    // 2: bicubicInterpolation
    // 3: bicubicInterpolation2
    processType: 0,
});
```

__compressImage__

compressImage，返回一个`base64`字符串

与scale的区别是这用的是canvas自动缩放，并且有很多参数可控

```js
var base64 = ImageScale.compressImage(image, {
    // 压缩质量
    quality: 0.92,
    mime: 'image/jpeg',
    // 压缩时的放大系数，默认为1，如果增大，代表图像的尺寸会变大(最大不会超过原图)
    compressScaleRatio: 1,
    // ios的iPhone下主动放大一定系数以解决分辨率过小的模糊问题
    iphoneFixedRatio: 2,
    // 是否采用原图像素（不会改变大小）
    isUseOriginSize: false,
    // 增加最大宽度，增加后最大不会超过这个宽度
    maxWidth: 0,
    // 使用强制的宽度，如果使用，其它宽高比系数都会失效，默认整图使用这个宽度
    forceWidth: 0,
    // 同上，但是一般不建议设置，因为很可能会改变宽高比导致拉升，特殊场景下使用
    forceHeight: 0,
});
```


### 更多

关于详细参数说明与更多使用

请参考`源码`

## 完善与不足

虽然说一些注意的功能都已经实现，但是从细节角度考虑，还是有很多有待完善的地方的。

譬如，裁剪框的实现方式不优雅。

譬如，旋转不支持其它角度。

譬如，内部源码有待优化。

...

虽然说有计划未来某段时间重构，但考虑到实际的时间安排，可能得等到很后了。

## 源码

图像裁剪：

[https://github.com/dailc/image-process/blob/master/src/clip/README.md](https://github.com/dailc/image-process/blob/master/src/clip/README.md)

图像缩放：

[https://github.com/dailc/image-process/blob/master/src/scale/README.md](https://github.com/dailc/image-process/blob/master/src/scale/README.md)

