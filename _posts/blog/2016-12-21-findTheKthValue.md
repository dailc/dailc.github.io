---
layout:     post
title:      两个已排序的数组求中间值(寻找k小值算法)
category: blog
tags: javascript 算法 寻找k小值 leetcode
favour: 寻找k小值

description: 有序数组(升序)，X(M个数)和Y(N个数)，数组合并后为Z(L个数)，求两个数组合并后的Z数组的中间值。寻找K小值算法
---

## 起由
这是leetcode上的一道经典题目，最近正好准备重新补下基础，于是研究了下这个算法。

## 需求描述
有序数组(升序)，X(M个数)和Y(N个数)，数组合并后为Z(L个数)，求两个数组合并后的Z数组的中间值，比如

```
[1,2,3,4] 
的中间值是(2+3)/2=2.5
[1,2,3] 
的中间值是2
```

## 算法步骤

### 前提分析
数组求中位数有两种情况(以下第×位数从1开始算起)

* 若合并后`L`为偶数，那么中间数为`第L/2位数和第(L/2+1)位数的平均值`
     其中L/2后取整
     
* 若合并后为奇数，那么中间数为     `第(L/2+1)位数`

所以，以上找中间数问题就转变成了在两个已排序数组中找第k大的数(第k小值)

### 解决思路(假设是理想状态下)

* 每次分别在X数组中和Y数组中取k/2个值进行比较(加起来正好k个)，下述为了方便，将`k/2-1`用`middle`表示
* 比较`X[middle]`和`Y[middle]`
	* 如果`X[middle]<Y[middle]`，意味着`第k位数>=Y[middle]>X[middle]`，
	所以X[middle]和之前的数肯定不会数第k位数，那么我们可以抛弃X数组中middle以及前面部分，
	
		```
		X=X.slice(middle),Y=Y,k=k-middle;
		```
		重新进行第一步比较
		
	* 如果`X[middle]>Y[middle]`，意味着`第k位数>=X[middle]>Y[middle]`，
	那么我们可以抛弃Y数组中middle以及前面部分，
	
		```
		X=X,Y=Y.slice(middle),k=k-middle;
		```
		重新进行第一步比较
		
	* 如果`X[middle]==Y[middle]`，意味着X和Y中正在比较的k位数全部<=第k个数。
	所以第k个数就在正在比较的数之中，而因为数组是升序，所以不是`X[middle]`，就是`Y[middle]`
	我们只需要取最终的值为`X[middle]`即可

### 实现步骤(以下数组是从0开始算起的)，考虑到一些可能的实际情况，找数组中第K大的数

* 第一步，我们交换两个数组的位置，确保X大小小于等于Y(如果X已经大于Y，则交换两个数组)

* 第二步，如果X数组为0，那么第k位数肯定在Y中，并且值就是`Y[k-1]`

* 第三步，如果k为1，那么只需要取`Math.min(X[0],Y[0])`，因为第一位数只可能是两个数组中的首位中的最小的一个

* 第四步，如果k不满足以上特殊值，则分别比较X数组和Y数组中特定的值

	```
	var partA = ~~Math.min(k/2,m),partB = k - partA;
	//这时候X中需要比较的值的分布可能为下述情况(当k/2为1时，则只有一个partA)
	0,...,partA-1
	//Y中需要比较的值得分布可能为
	0,...,partB-1
	//而且X中需要比较的数和Y中需要比较的数加起来刚好有k位，而且(第k位数>=X[partA-1],第k位数>=X[partB-1])
	```
	
	* 如果`X[partA-1]<Y[partB-1]`，(原理上述已经分析)
	
		```
		X=X.slice(partA),Y=Y,k=k-partA;
		```
		重新进行第一步比较

	* 如果`X[partA-1]>Y[partB-1]`，(原理上述已经分析)
	
		```
		X=X,Y=Y.slice(partB),k=k-partB;
		```
		重新进行第一步比较
		
	* 如果`X[partA-1]==Y[partB-1]`，(原理上述已经分析)
	取最终的值为`X[partA-1]`

## 算法复杂度

### 空间复杂度

```
O(1)
```
这个算法没有额外的空间要求

### 时间复杂度
这个算法每次分别去掉某一个数组中的某一部分，假设X数组长度为，Y数组长度为N。
那么复杂度计算方式为:

```
0(lgM+lg(N))=O(lgMN)<=O(2lg(M+N)) = O(lg(M+N))
```

## 算法实例
以下按照上述算法实现步骤，基于一个实例进行分析。

### 前提

```
X=[1,3,5];
Y=[1,2,3,4];
```
求X和Y的中间值

### 准备工作
可知，初始化时X中有3位，Y中有4为，所以一共7位，为奇数。
那么我们所求是第`4=(3+4)/2+1`位数

### 实现过程

* 第一步，X长度小于Y，不需要交换，其中X数组的长度m为3，Y数组的长度n为4，k为4

* 第二步，取特殊值进行比较

	```
	var partA = ~~Math.min(k/2,m);//2
	var partB = k - partA; //2
	```
* 第三步，比较`X[partA-1]`和`Y[partB-1]`，结果是`X[1]>Y[1]`，
	所以舍弃Y中部分值，重新进行比较
	
	```
	X=X,Y=Y.slice(partB),k=k-partB;
	```
	舍弃完毕后，X为`1,3,5`，Y为`3,4`，k为2
	之后交换X和为，X换为`3,4`，m为2，Y换位`1,3,5`，n为3
	
* 第四步，重新去特殊值进行比较

	```
	var partA = ~~Math.min(k/2,m);//1
	var partB = k - partA; //1
	```
	
* 第五步，比较`X[partA-1]`和`Y[partB-1]`，结果是`X[0]>Y[0]`，
	所以舍弃Y中部分值，重新进行比较
	
	```
	X=X,Y=Y.slice(partB),k=k-partB;
	```
	舍弃完毕后，X为`3,4`，Y为`3,5`，k为1
	不需要交换x与Y，此时m为2，n为2
	
* 第六步，重新比较新的数组，由于符合条件`k==1`，所以
	
	```
	第k个值 = Math.min(X[0],Y[0]); //3
	```
	至此，整个算法流程运行完毕，最终的中间值为`3`
	
### 图示
![](https://dailc.github.io/leetcode/algorithms/Median-of-Two-Sorted-Arrays/img_leetcode_medianOfTwoSortedArrays.png)

## 实现代码示例
以下是相应算法的代码实现

### JS代码实现

```
function findMedianSortedArrays2(nums1,nums2) {
		var m = nums1.length,n = nums2.length;
		var total = m+n;
		
		//找到两个排序数组中的第k个小数，内部假设m小于n
		var findKth = function(X,Y,m,n,k){
			if(m>n){
				//颠倒mn的顺序
				return findKth(Y,X,n,m,k);
			} else if(m===0){
				//如果X数组为空，那么K肯定就在Y数组中
				return Y[k-1];
			} else if(k===1){
				//只有一位，由于是升序，所以必然是X[0]或Y[0]
				return Math.min(X[0],Y[0]);
			}
			
			//divide k into two parts,最小为1
			//可以肯定得是partA和partB都<=K
			var partA = ~~Math.min(k/2,m),partB = k - partA;
			//第一位数其实是X[0]，因为程序从0开始
			//以下判断时关键，每一次都可以去掉不符合要求的一部分，进行精简
			if(X[partA-1] < Y[partB-1]){
				return findKth(X.slice(partA),Y,m-partA,n,k-partA);
			} else if(X[partA-1] > Y[partB-1]) {
				return findKth(X,Y.slice(partB),m,n-partB,k-partB);
			} else {
				//如果X数组中的第partA位和Y数组中的第partB为相等
				//由于X中有1,...,partA
				//Y中有1,...,partB
				//两者加起来刚好为k,而不管k在X中还是Y中，都必须满足X[k]>=X[partA]=X[partB]
				//所以k只可能是partA或partB(原因是X和Y中加起来已经有K个数小于等于X[k]了，所以K只能在这里面)
				return X[partA-1];
			}
		};
		
		if(total%2!==0){
			 return findKth(nums1, nums2, m,n, ~~(total / 2)+1);  
		} else {
			return (findKth(nums1, nums2, m,n, ~~(total / 2)+1 )+findKth(nums1, nums2, m,n, ~~(total / 2 )))/2;  
		}
	};
```

## 算法横向比较
上述描述的算法是寻找k小值算法，但其实寻找中间数还有其它方案

* 比如两个数组合并后，在排序，在找中间值。

这种方案的特点是简单，但是复杂度要远远大于寻找k小值算法，以下是在数组长度分别为3000和500000时，两者性能对比。

![](https://dailc.github.io/jsPerformanceAnalysis/staticresource/performanceAnalysis/leetcode/medianOfTwoSortedArray/demo_js_performanceAnalysis_leetcode_medianOfTwoSortedArray_1.png)

![](https://dailc.github.io/jsPerformanceAnalysis/staticresource/performanceAnalysis/leetcode/medianOfTwoSortedArray/demo_js_performanceAnalysis_leetcode_medianOfTwoSortedArray_2.png)

## 源码
[https://github.com/dailc/leetcode/tree/master/algorithms/Median-of-Two-Sorted-Arrays](https://github.com/dailc/leetcode/tree/master/algorithms/Median-of-Two-Sorted-Arrays)

### 性能分析页面地址
[两个排序数组求中间值性能分析](https://dailc.github.io/jsPerformanceAnalysis/html/performanceAnalysis/leetcode/demo_performanceAnalysis_leetcode_medianOfTwoSortedArrays.html)

## 原文地址
原文在我个人博客上面

[两个已排序的数组求中间值(寻找k小值算法)](https://dailc.github.io/2016/12/21/findTheKthValue.html)

## 参考链接

* [Leetcode 4 Median of Two Sorted Arrays](http://blog.csdn.net/zxzxy1988/article/details/8587244)

* [leetcode之 median of two sorted arrays](http://blog.csdn.net/yutianzuijin/article/details/11499917/)