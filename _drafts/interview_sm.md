# 石墨文档面试记

大致问题：

- 面试官主动提出的： github上的下拉刷新，quickhybrid介绍

    - onScroll，touch，以及手势判断
    
    - iOS的回弹bug

- 自己主动引发的：（由minirefresh引发）

    - 浏览器进程，线程，JS单线程
    
    - 浏览器渲染，Layout，Recalculate ，reflow，Update layer tree
    
    - css首屏渲染，关键渲染路径（白屏时间过长的问题），CSS inline（内联优化，防止样式丢失等），css合并，CDN缓存
    
    - css文档流，absolute，translate3d的区别？包括复合图层，简单图层
    
    - HTTP数量的限制-5个，可以多个域名（因为它是由域名决定的）
    
    - http headers：Cache-Control，content-type。OPTIONS，referer，CSRF，CORS，cookie（跨域cookie）
    
    - XMLHTTPRequest，ES6 fetch，promise
    
- 最后算法。。。

    - [3, 2, 5, 4, 6, 8]，寻找丢失的x，`n < x < m`，一个等差数列求和而已，可惜一紧张想了很久，不过仍然弄出来了
    
    - [2, 3, 5, 3, 2, 1, 4, 6]，6,tow sum，不能有重复。一紧张思路忘了，用暴力法解了。实际上应该是map映射法
    

总结，心态很重要。一紧张，只能发挥60%。其次，要尽量往自己擅长的方向引。
es6一些关键API得掌握
    