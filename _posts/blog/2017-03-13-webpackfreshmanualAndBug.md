---
layout:     post
title:      Webpack入门之遇到的那些坑，系列示例Demo
category: blog
tags: webpack node.js
favour: webpack
description: 整理一些Webpack入门过程中遇到的那些坑，最后有提供相应的系列示例Demo
---

## 前言
网上关于webpack的教程已经数不胜数了，也无意再重新写一篇复制文。但是实际操作过程中，发现各种教程版本都不一致，有的教程已经过时了，有的教程模糊不清，因此还是遇到了各种问题，因此特将自身实际操作过程中遇到的问题记录下来，并附上相应的示例demo，也希望能给他人带来帮助！

本文主要是记录的一些遇到的问题以及提供了示例，如果想要看入门教程还是去官网上或者参考参考资源中的链接。

问题记录较多，想要直接看示例Demo的请拉到最下方。

另外，此文会持续更新。

## 题纲

* 遇到的那些问题
* 示例，各阶段的示例demo，配有`README`

## 遇到的那些问题

### 问题一:package.json注释带来的问题
**说明:**项目的package.json中，只要带有注释，必然编译不能通过

**解决:**禁止在package.json中注释

### 问题二:全局安装带来的问题
**说明:**在最开始做项目时，由于本地已经全局安装过了对应的依赖包，因此没有再重新在本地安装，导致运行时报错，全局安装版本与本地依赖的版本不一致导致。

**解决:**每一个项目中，**所有的依赖包均在本地安装**，依赖情况通过`npm install *** --save -dev`注入`package.json`中，其中一些环境以外的依赖，比如第三方库`express`等可以通过`npm install *** --save`安装。

所有的依赖包都在本地安装是一个好习惯，因为这样可以随时打包带走与重新装箱。

### 问题三:`css-loader`省略`-loader`带来的问题
**说明:**在老版本的webpack中，经常会用省略的写法来写loader，比如

```
loaders: [{
  test: /\.css$/, 
  loader: "style!css"
 }],
```
但是，使用此种写法后，编译时会报错。

**解决:**现在新版本中，已经不允许省略了，比如使用全称，比如:

```
loaders: [{
  test: /\.css$/, 
  loader: "style-loader!css-loader"
 }],
```

### 问题四:默认情况，在js中`require(css)`后，样式嵌入在js中，没有独立的css文件
**说明:**webpack的默认设置中，如果没有引入特殊的第三方插件，在js中require的css文件是会自动写入到相应打包出的js中的，这样一来有一些缺点:
* js是阻塞加载的，样式会出现很慢
* 没有单独的css文件，缓存也不便，而且不符合开发习惯

**解决:**需要引入一个第三方插件`extract-text-webpack-plugin`，具体如下:

```
//头部引入css打包插件
const ExtractTextPlugin = require("extract-text-webpack-plugin");

//声明对应的loaders
loaders: [{
  test: /\.css$/,
  //请注意loader里的写法，有一些低版本的例子中是过时的写法
  loader: ExtractTextPlugin.extract({
    fallback: "style-loader",
    use: "css-loader"
  })
}],

plugins: [
  ...
  //这样会定义，所有js文件中通过require引入的css都会被打包成相应文件名字的css
  new ExtractTextPlugin("[name].css"),
],
```
注意，以上loaders和plugins中都必须声明，缺一不可

### 问题五:ExtractTextPlugin 插件loader写法不对导致报错
**说明:**最初在引用ExtractTextPlugin 插件时，使用了如下写法，导致了报错

```
loaders: [{
  test: /\.css$/,
  loader: ExtractTextPlugin.extract(["style-loader","css-loader"])
}],
```
**解决:**原因是这种写法已经过时，根据命令台中的提示，修改为最新写法即可:

```
loaders: [{
  test: /\.css$/,
  loader: ExtractTextPlugin.extract({
    fallback: "style-loader",
    use: "css-loader"
  })
}],
```

### 问题六:在js中直接`require(html)`不会输出成html
**说明:**在使用webpack时，习惯性的用了万物皆模块这个概念，于是在js中引入html，如下:

```
//***.js中
require('./index.html')
...
```
结果是并不会生成一个index.html的文件，而是会将html代码嵌入到js中，作为模块代码而存在。

**解决:** 一般webpack项目中，会用`htmlPagePluginConfig`插件来引入html(这时候会给每一个html制定一个入口js文件)，然后接下来所有操作都可以从这个入口js文件中进行(比如引入css，比如逻辑操作)

需要注意的是，这个插件声明html时，对应引入的js路径一定要对，如:

```
{
  template: 'pages/index.html',
  // 如果是只声明index，由于路径不对，则不会自动插入
  chunks: ['js/index'],
}
```

### 问题七:html中的img资源不会被自动替换
**说明:**开发过程中使用的`htmlPagePluginConfig`插件加载html，但是发现构建过程中，html内部引入的img等标签不会被自动替换。

**解决:**需要引入`html-loader`插件，有了这个插件后，引入，默认会将html内部的img自动替换掉

### 问题八:在html中`link(css)`后，不会替换对应的css，或者是会报错
**说明:**正常开发是所有css都是在js中引入的，但是在某一次尝试中，准备尝试在html里用原始的link方式引入css，并引入了html-loader，如下:

```
<meta charset="utf-8" />
<link rel="stylesheet" href="test.css" />
```

```
loaders: [{
  test: /\.html$/,
  use: [{
    loader: 'html-loader',
    options: {
    minimize: false,
   }
}],
```
结果按上述的方法进行后发现对于的html里的css路径没有替换，这时发现`html-loader`默认是不会替换css，于是又做如下改动

```
loaders: [{
  test: /\.html$/,
  use: [{
    loader: 'html-loader',
    options: {
    minimize: false,
    //开启link的替换
    attrs: ['img:src', 'link:href']
   }
}],
```
但是采用上述配置后，提示:`Error: "extract-text-webpack-plugin" loader is used without the corresponding plugin`

**解决:**webpack中ExtractTextPlugin需要配合js模块化引入css使用。
如果想要实现html内部linkcss，**目前没有找到完美的解决方法**，只知道使用webpack构建项目时，css都通过js `require`引入就不会有错了

### 问题九:css-loader中,`.min.css`重复压缩会报错
**说明:**在项目中引入第三方lib文件后，发现，如果引入的文件本身已经压缩过了(如min.css文件)，这时候再采用压缩配置`css-loader?minimize`，则会报错

**解决:**采用了正在表达式进行了过滤，含有.min.css的文件不会压缩，其它css则会压缩，如下:

```
loaders: [{
  //20170314更新:以下是错误写法，比如common.css也无法匹配的
  //test: /[^((?!\.min\.css).)*$]\.css$/,
  //以下是正确写法
  test: /^((?!\.min\.css).)*\.css/,
  loader: ExtractTextPlugin.extract({
    fallback: "style-loader",
    use: "css-loader?minimize&-autoprefixer"
   })
}, {
  test: /\.min\.css$/,
  loader: ExtractTextPlugin.extract({
    fallback: "style-loader",
    use: "css-loader"
   })
}],
```

**20170320更新**
最终发现重复压缩错误的原因是因为`.min.css`文件中包含如下代码:

```
 background-image: url('data:image/svg+xml;charset=utf-8,<svg viewBox=\'0 0 120 120\' xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\'><defs><line id=\'l\' x1=\'60\' x2=\'60\' y1=\'7\' y2=\'27\' stroke=\'%236c6c6c\' stroke-width=\'11\' stroke-linecap=\'round\'/></defs><g><use xlink:href=\'%23l\' opacity=\'.27\'/><use xlink:href=\'%23l\' opacity=\'.27\' transform=\'rotate(30 60,60)\'/><use xlink:href=\'%23l\' opacity=\'.27\' transform=\'rotate(60 60,60)\'/><use xlink:href=\'%23l\' opacity=\'.27\' transform=\'rotate(90 60,60)\'/><use xlink:href=\'%23l\' opacity=\'.27\' transform=\'rotate(120 60,60)\'/><use xlink:href=\'%23l\' opacity=\'.27\' transform=\'rotate(150 60,60)\'/><use xlink:href=\'%23l\' opacity=\'.37\' transform=\'rotate(180 60,60)\'/><use xlink:href=\'%23l\' opacity=\'.46\' transform=\'rotate(210 60,60)\'/><use xlink:href=\'%23l\' opacity=\'.56\' transform=\'rotate(240 60,60)\'/><use xlink:href=\'%23l\' opacity=\'.66\' transform=\'rotate(270 60,60)\'/><use xlink:href=\'%23l\' opacity=\'.75\' transform=\'rotate(300 60,60)\'/><use xlink:href=\'%23l\' opacity=\'.85\' transform=\'rotate(330 60,60)\'/></g></svg>');
```

所以包含这种代码的css使用css-loader的minify时会报错，解决方法是暂时将这类的css单独放入文件中，并且不进行minify

### 问题十:css中和html中的img路径引用出错，不符合预期
**说明:**在将项目划分目录结构后，html内和css内都有引用img或font，采用`html-loader`替换html内部资源，之后发现构建出来后的文件中,img和font等资源的引用路径不对。如:

```
本来应该是路径 ../img.***.img
结果直接就变成了 img/***.img 
导致路径不一致
```

**解决:**默认打包路径无法替换为相对路径。这时候需要引入`publicPath`这个变量，将所有的资源用全局路径替换，如:

```
output: {
// 用来解决css中的路径引用问题
publicPath: config.publicPath,
	},
```
以上publicPath由开发者自身根据实际情况进行配置，一般是指向项目的发布路径根目录，比如`http://localhost:8080/dist/`，可以自由切换开发模式和发布模式

### 问题十一:`webpack-dev-serve`配置错误带来的问题
**说明:**在使用`webpack-dev-serve`时遇到了如下问题:

**one:**

* helloworld项目时，`webpack-dev-server --port 8082`即可开启服务，并且自动监听进行刷新(并且支持iframe刷新与inline刷新)
* 但是在config的output中加入了`publicPath`后，默认的服务端配置，启动后不会自动监听进行刷新
* 问题最终分析出了，是因为`devServer`和构建的路径outputPath不一致导致的，如
  
```
Project is running at  http://localhost:8082/
webpack output is served from http://localhost:8080/dist/
```

* 解决方法为:增加devServer的配置，自动读取publicPath，如下:(默认用了iframe刷新)

```
	//dev版才有serve
	devServer: {
		historyApiFallback: true,
		hot: false,
		//不使用inline模式,inline模式一般用于单页面应用开发，会自动将socket注入到页面代码中
		inline: false,
		//content-base就是 codeResource -需要监听源码
		contentBase: path.resolve(__dirname, config.codeResource),
		watchContentBase: true,
		// 默认的服务器访问路径，这里和配置中一致，需要提取成纯粹的host:ip
		public: /https?:\/\/([^\/]+?)\//.exec(config.publicPath)[1]
	},
```

**two:**

* 在运行devServer时，将contentBase指向了发布目录，如`contentBase:"dist"`，但是却发现修改dist里的任何文件，服务端都不会刷新
* 最终发现是功能理解错误，在启动devServer的命令中，并不会构建出dist，也就是说，它并不是访问的dist目录下的文件，而是基于源码src直接发布到服务端的
* 解决方法，将contentBase指向src目录，修改src目录下的文件就可以看到自动刷新了(一定要注意，server用到的不是dist下的文件)

**three:**

* 使用devServe时，开启了`inline`和`hot`，但是热更新无效
* 原因是，没有引入这个插件`HotModuleReplacementPlugin`，需要如下声明

```
new webpack.HotModuleReplacementPlugin()
```

**four:**

* 热更新模式下，提示`ERR_NAME_NOT_RESOLVED`，不能实时刷新，一直都无法找到原因
* 说实话，正常情况下不会遇到这个问题，一般遇到这个问题请检查是否版本号不对应，也可去github上找issue
* 但是，我这里仅仅是因为自己设置devServe时的public路径设置错误了

```
//正常设置
localhost:8080
//我的设置
http://localhost:8080
```

* 从而导致了提示`Project is running at http://http://localhost:8080/`，所以只需要改成正常配置即可
* 另外需要注意的是，如果想要`iframe`刷新，inline和hot都要是false


**five:**(20170322更新)

* `webpack-dev-server`默认只能在localhost访问，换为内网ip就不行了(比如192.×××，就算是本机也不行的)
* 解决: 修改server的默认配置，如

```
//这个配置可以运行其它机器访问
host: '0.0.0.0',

//或者运行时
-- host  0.0.0.0
```

### 问题十二:`hash`与`chunkhash`造成的问题
**说明:**项目发布时，为了解决缓存，需要进行md5签名，这时候就需要用到`hash`和`chunkhash`等了，但是却遇到了如下问题:(hash系列问题的解决大多参考了参考来源中的博客)

**one:**(hash问题)

* 使用`hash`对js和css进行签名时，每一次hash值都不一样，导致无法利用缓存
* 原因是因为,`hash`字段是根据每次编译compilation的内容计算所得，也可以理解为项目总体文件的hash值，而不是针对每个具体文件的。(所以每一次编译都会有一个新的hash，并不适用)
* 解决:不用hash，而用`chunkhash`(js和css要使用chunkhash)，`chunkhash`的话每一个js的模块对应的值是不同的(根据js里的不同内容进行生成)

**two:**(img的chunkhash问题)

* 前面有提到，hash在js和css中不实用，所以在项目中所有的文件都准备用`chunkhash`，但是又有了新的问题-img和font等资源中，使用`chunkhash`会报错
* 解决:因为`chunkhash`只适用于js和css，img中是没有这种东西的，仍然需要用到`hash`(这个hash有点区别，每一个资源本身有自己的hash)

**three:**(chunkhash重复问题)

* 打包时发现，js和js引入的css的`chunkhash`是相同的，导致无法区分css和js的更新，如下

```
index2-ddcf83c3b574d7c94a42.css
index2-ddcf83c3b574d7c94a42.js
```

* 原因是因为webpack的编译理念，webpack将css视为js的一部分，所以在计算chunkhash时，会把所有的js代码和css代码混合在一起计算
*解决:css是使用`ExtractTextPlugin`插件引入的，这时候可以使用到这个插件提供的`contenthash`，如下(使用后css就有独立于js外的指纹了)，


```
new ExtractTextPlugin("[name]-[contenthash].css")
```

* 需要注意的是，在新版本中，亲自测试过，修改css的内容并不会引起js中的`chunkhash`变动(原因估计是webpack内置的算法变为了只计算js chunk)，所以css请务必使用`contenthash`，否则修改后无法生成新的签名，而是会覆盖以前的资源

### 问题十三:提示`UNMET PEER DEPENDENCY node-sass`，依赖包安装失败
**说明:**刚开始试了下，sass的编译，里面有引入`node-sass`这个依赖包，之后基于这个出现了一些问题

**one:**(安装`node-sass`失败)

* 在用`sass`时，依赖了这个包，但是用npm安装时，安装失败
* 原因是这个包放在github上的，导致装不下了
* 解决:使用淘宝镜像安装或者使用淘宝的`cnpm`安装，安装cnpm如下

```
npm install -g cnpm --registry=https://registry.npm.taobao.org  
```

**two:**(`node-sass`引起的其它安装包安装失败)

* 使用node.js安装某个依赖包时，提示UNMET PEER DEPENDENCY node-sass，而且关键是这个包本身不会依赖于它，提示如下:

```
+-- UNMET PEER DEPENDENCY node-sass@^4.0.0
 -- webpack-dev-server@2.4.1 extraneous
```

* 原因是，以前这个项目中曾经有安装过node-sass，但是安装失败了，导致node_modules里一直记录了这个任务，后续安装时都会先尝试去安装它。
* 解决:去node_modules目录下，删除与node-sass这个依赖包的相关内容(可以全局搜索)，重新安装即可

### 问题十四:`sourceMap`配置带来的问题
**说明:**在使用sourceMap时，遇到了以下问题

**one:**(uglify压缩去掉了sourceMap)

* 在使用sourceMap时，由于用到了uglify压缩插件，所以默认去除了js尾部的注释，导致无法找到map文件
* 解决: uglify插件加上如下配置

```
sourceMap:true,
```

* 另外config里的output可以配置`sourceMapFilename:'maps/[name].map'`，将map文件放入maps文件夹中

### 问题十五:`htmlPagePluginConfig`配置带来的问题
**20170318更新**
**说明:** 同时引入了`html-loader`和`html-webpack-plugin`后，两个插件都设置了minify属性，则会编译生成时报错，错误配置如下:

```
loader: 'html-loader',
options: {
  minimize: config.isRelease ? true : false,
}

new HtmlWebpackPlugin({
  ***
  minify: config.isRelease ? {
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyJS: true,
    minifyCSS: true
}: null,
 
})
```

**解决:**只需要将HtmlWebpackPlugin中对应的minify属性去掉即可。

### 问题十六:`webpack`中JS手动引入的图片问题
**20170318更新**
**说明:** webpack是万物皆模块，但也就是说，不通过require引入的就不会算成模块了(插件中的另算，那是处理过的)。所以，在JS中手动引入图片时会遇到问题就是对应的图片并不会被打包，导致之后找不到路径。如下:

```
var GalleryData = [{
    id: "testgallery1",
    title: "",
    //为空
    //保持目录结构
    url: "../../static/img/gallery/img_testgallery1.jpg"
},
{
    id: "testgallery2",
    title: "",
    //为空
    url: "../../static/img/gallery/img_testgallery2.jpg"
}];
```
以上的url就是引入的源码本地图片，但是却发现并不会被打包出来。

**解决:** 

* 将以上的`static`文件夹作为静态资源，用`copy-webpack-plugin`插件提取出来(这时候需要遵守的一个约定就是`static`文件夹下的是专门给js引入或者外部资源访问的，平时正常的css,html中的引入请放入其它文件夹中，比如`img`，避免相互影响，这就是约定大于配置)

* 或者，通过require引入图片后再设置，如下:(但是这样会破坏代码结构，个人并不建议)

```
var imgUrl = require('./images/bg.jpg'),
imgTempl = '![]('+imgUrl+')';
```

## 示例Demo
本次进行webpack学习时。依次安装功能递增，循序渐进的写了多个demo(每一个均可正常运行)，每一个demo都有自身的`READEME.MD`说明，目录结构如下；

```
├── 01helloWorld	# 入门hellworld，一个html,一个js，一个css，css默认嵌入在js中，html采用`HtmlWebpackPlugin`加载
├   
├── 02helloWorld2	# 基于第1个进行拓展，css使用`ExtractTextPlugin`单独打包成一个文件
├   
├── 03pageWithSingleJsAndCss	# 基于第2个进行拓展，示例页面由一个变为多个，并且抽取了通用配置文件`common.config`
├   
├── 04pageWithStaticResource	# 基于第3个进行拓展，增加了`html-loader`替换静态资源，解决了css重复压缩报错问题，使用`publicPath`，解决资源文件引用路径问题，增加了`webpack-dev-server`配置
├
├── 05withCommonChunk	# 基于第4个进行拓展，增加了`CommonsChunkPlugin`提取公告js和css，增加了`UglifyJsPlugin`,修改了一些配置，更好应用于项目
├
├── 06withHashStaticAndRelease	# 基于第5个进行拓展，增加了`CopyWebpackPlugin`复制静态资源，增加了`chunkhash`,`contenthash`等指纹签名功能，增加了`alias`别名设置，增加了release版本和dev版本的开关
├   
├── 07withLocalServer	# 基于第6个进行拓展，增加了一个`api-server`，来写本地测试接口(已经进行了跨域配置)
├   
└── 08withFamilyBucket	# 基于第7个进行拓展，webpack全家桶项目，增加了`source-map`，增加了`assets-webpack-plugin`等等
```

### 源码地址:
系列demo的源码地址是: [https://github.com/dailc/webpack-freshmanual](https://github.com/dailc/webpack-freshmanual)

## 附录

### 参考资料

* [http://www.jianshu.com/p/42e11515c10f](http://www.jianshu.com/p/42e11515c10f)
* [Webpack中hash与chunkhash的区别](http://www.cnblogs.com/ihardcoder/p/5623411.html)

### 原文链接
* [https://dailc.github.io/2017/03/13/webpackfreshmanualAndBug.html](https://dailc.github.io/2017/03/13/webpackfreshmanualAndBug.html)