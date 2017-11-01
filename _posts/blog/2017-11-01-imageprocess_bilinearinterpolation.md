---
layout:     post
title:      【图像缩放】双线性插值
category: blog
tags: 图像缩放 插值算法 算法
favour: 图像插值算法
description: 图像插值算法中双线下插值的实现
---

## 前言

图像处理中有三种常用的插值算法：

- 最邻近插值

- 双线性插值

- 双立方（三次卷积）插值

本文介绍其中的`双线性插值`

如果想先看效果和源码，可以拉到最底部

## 何时进行双线性插值

相比于最邻近插值的粗糙以及双立方插值的计算量大，双线性插值的效果比较折中

- 计算量不是那么巨大

- 效果也还可以

- 一般可以作为应用中的默认处理算法

需要注意的是，使用双线性插值后有明显的模糊效果（低通滤波）

## 数学理论

双线性插值只涉及到邻近的`4`个像素点，如图

![](https://dailc.github.io/staticResource/blog/imageprocess/bilinear/4pixels.jpg)

简单分析如下：

- 目标插值图中的某像素点`(distI, distJ)`在原图中的映射为`(i + v, j + u)`

- `(i + v, j + u)`处值的计算就是邻近`4`个像素点的分别在`x`轴和`y`轴的权值和

### 插值公式

- 设`f(i, j)`为`(i, j)`坐标点的值（灰度值）

- `u`为列方向的偏差

- `v`为行方向的偏差

- 那么插值公式如下（最终`F(i + v, j + u)`处的实际值）

```js
F(i + v, j + u) = partV + partV1;

partV = v * ((1 - u) * f(i + 1, j) + u * f(i + 1, j + 1));

partV1 = (1 - v) * ((1 - u) * f(i, j) + u * f(i, j + 1));
```

上式中，分别是四个坐标点对`x`和`y`方向进行插值，简单的说

- `u`越接近`0`，`(i, j)`与`(i + 1, j)`的权值越大

- `v`越接近`0`，`(i, j)`与`(i, j + 1)`的权值越大

## 代码实现

以下是`JavaScript`代码的完整实现

```js
function getRGBAValue(data, srcWidth, srcHeight, row, col) {
    let newRow = row;
    let newCol = col;

    if (newRow >= srcHeight) {
        newRow = srcHeight - 1;
    } else if (newRow < 0) {
        newRow = 0;
    }

    if (newCol >= srcWidth) {
        newCol = srcWidth - 1;
    } else if (newCol < 0) {
        newCol = 0;
    }

    let newIndex = (newRow * srcWidth) + newCol;

    newIndex *= 4;

    return [
        data[newIndex + 0],
        data[newIndex + 1],
        data[newIndex + 2],
        data[newIndex + 3],
    ];
}

function scale(data, width, height, newData, newWidth, newHeight) {
    // 计算压缩后的缩放比
    const scaleW = newWidth / width;
    const scaleH = newHeight / height;
    const dstData = newData;

    const filter = (dstCol, dstRow) => {
        // 源图像中的坐标（可能是一个浮点）
        const srcCol = Math.min(width - 1, dstCol / scaleW);
        const srcRow = Math.min(height - 1, dstRow / scaleH);
        const intCol = Math.floor(srcCol);
        const intRow = Math.floor(srcRow);
        // 计算u和v
        const u = srcCol - intCol;
        const v = srcRow - intRow;
        // 1-u与1-v
        const u1 = 1 - u;
        const v1 = 1 - v;

        // 真实的index，因为数组是一维的
        let dstI = (dstRow * newWidth) + dstCol;

        // rgba，所以要乘以4
        dstI *= 4;

        const rgba00 = getRGBAValue(
            data,
            width,
            height,
            intRow + 0,
            intCol + 0,
        );
        const rgba01 = getRGBAValue(
            data,
            width,
            height,
            intRow + 0,
            intCol + 1,
        );
        const rgba10 = getRGBAValue(
            data,
            width,
            height,
            intRow + 1,
            intCol + 0,
        );
        const rgba11 = getRGBAValue(
            data,
            width,
            height,
            intRow + 1,
            intCol + 1,
        );

        for (let j = 0; j <= 3; j += 1) {
            const partV = v * ((u1 * rgba10[j]) + (u * rgba11[j]));
            const partV1 = v1 * ((u1 * rgba00[j]) + (u * rgba01[j]));

            dstData[dstI + j] = partV + partV1;
        }
    };

    for (let col = 0; col < newWidth; col += 1) {
        for (let row = 0; row < newHeight; row += 1) {
            filter(col, row);
        }
    }
}

export default function bilinearInterpolation(imgData, newImgData) {
    scale(imgData.data,
        imgData.width,
        imgData.height,
        newImgData.data,
        newImgData.width,
        newImgData.height);

    return newImgData;
}
```

## 运行效果

可参考同系列中的`双立方插值`中的效果图

## 开源项目

这个项目里用`JS`实现了几种插值算法，包括（最邻近值，双线性，三次卷积-包括两种不同实现等）

[https://github.com/dailc/image-process](https://github.com/dailc/image-process)

## 附录

### 参考资料

- [图像处理界双线性插值算法的优化](http://www.cnblogs.com/Imageshop/archive/2011/11/12/2246808.html)
