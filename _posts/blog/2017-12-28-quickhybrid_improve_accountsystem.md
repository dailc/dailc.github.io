---
layout:     post
title:      【quickhybrid】【完善】统一的账号体系、Cookie与Token认证
category: blog
tags: quickhybrid hybrid
favour: quickhybrid
description: 后续完善，统一的账号体系、Cookie与Token认证
---

## 前言

本文并不包含实现，大概描述下思路

基于的实际场景是：N个项目+PC+移动的账号体系

## 统一的账号体系？

还是基于一个实际场景来，大概某个公司的业务最初是这样的：

- 有一个统一的框架模版，接到的每一个项目都是按照框架模版copy+修改

- 于是乎，每一个项目都有自己的登陆注册。。。

- 然后就造成了一个尴尬的场景：某一个需求是做一个平台级的App，要求将以前的n个App的功能集成进来，作为模块（或频道），
，然后发现傻眼了，因为每一个模块的账号体系都不一样，完全无法做到互相交流

这时候，就出现了一个刚需：需要一套统一的账号认证体系，同一条线上，一个账号可以在N个模块之间通用

所以，从此以后，就有了这样方案：`sso（单点登录）机制`

关于这套机制的原理，网上已经有很多相关资料了，这里不赘述，直接上一张图总结下web-sso流程（这种图部分描述可能有点不是很适当，但暂时懒得改了，大致上差不多）

![](https://quickhybrid.github.io/staticresource/images/web-sso.png)

## 加上了移动端后的账号体系？

可以看到，上图中描述的单点登陆场景是基于web的，采用的也是cookie来传递信息。

后来某天，加上了一个移动Navtive端的业务，突然间这套方案好似就不好用了：

- 因为Navtive端都是通过纯http的接口形式请求，所以cookie并不总是合适

那用什么方案替代呢？这里用的是`token机制`。

即通过接口进行登陆，登陆成功后返回一个`token`字段，然后每次请求中在http请求中默认带上token头部。

当然了，token还得和前面的统一认证体系关联，这里为了方便，也直接上一张图总结：

![](https://quickhybrid.github.io/staticresource/images/sso-token.png)

当然了上图中的token非法后可以是通知原生端，然后原生端重新刷新token或刷新失败后重新登陆

## 最终是选择cookie还是token？

回到最初的话题，在Hybrid混合开发中，由于是基于webview的，所以也是可以直接选择cookie方案的，当然也可以选择token方案。

那么最终应该如何抉择呢？这里说下quickhybrid中计划的实现。（这里优先考虑的是前端仍然使用ajax，容器自动注入机制）

- 首先，在Android是完全可以做到自动写入cookie的（即登陆后，登陆由接口返回jsessionid，然后每次资源请求时自动写入到cookie中）

- 然后，在iOS的`UIWebview`中，cookie也比较便于管理，可以做到自动写入cookie

- 但是，在iOS的`WKWebview`中，相应开发人员有提到由于WKWebview的网络请求是系统进程，所以无法监听前端到的ajax，也就是说，不能在ajax中注入cookie。。。

而且，由于某些原因，采用了最新的WKWebview来作为iOS容器，因此就放弃了cookie方案了，转而采用token方案

所以已知采用的是token，下面仍然会将两种方案的大致流程都描述。

_PS：这里优先考虑的是前端仍然用ajax请求，配置cors解决跨域，token是由前端框架主动注入（先通过api获取然后注入）的，
这样容器就减少了工作。当然实际上，完全可以由容器提供代理方法请求网络的，这样连token注入等操作都无需前端关心了。
不同的方案都可行，仅仅是抉择问题_

## 如何用cookie进行身份验证

前文中有提到在浏览器中时，后台可通过前端请求的cookie来验证身份，恰好在混合开发时，是基于webview，就等同于一个浏览器。
这时同样可以在请求中加入cookie来作为身份认证。

如何实现？简单的说就是前端页面仍然用H5的ajax之类手段请求接口，然后容器层面在每个请求时都自动写入cookie，从而完成正确的身份验证。

具体流程以结合Android原生为例：

1.有一个登陆页面，通过账号密码，登陆后接口字段中包含一个jsessionid字段（对于后台的session）

2.原生容器层面将这个字段保存下来（同时每次刷新时也确保字段合法）

3.原生容器监听页面的请求，然后往请求中加入cookie

```js
    // <5.0
    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
        // 其它语句略去，版本判断略去
        setCookies(view.getContext(), url);
        ...
    }
    // 5.0+
    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        // 同上
        ...
    }
    
    public static void setCookies(Context context, String url) {
        if (!TextUtils.isEmpty(url)) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
                CookieSyncManager.createInstance(context);
            }
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            cookieManager.removeSessionCookie();
            // 右侧就是获取自己存储的jsessionid
            cookieManager.setCookie(url, "JSESSIONID=" + CommonInfo.getInstance().getToken().jsessionid);
            CookieSyncManager.getInstance().sync();
        }
    }
```

可以看到在Android中的关键就是CookieSyncManager来管理cookie。
当然了这里还有一个小关键，就是cookie一般是跨域的，因此前端需要主动在ajax中允许跨域cookie才能生效。

```js
setting.xhrFields = {
    // 跨域带cookie
    withCredentials: true
};
```

同时，后台也得允许跨域cookie才能正常请求（注意跨域cookie的配置是不允许用`*`的，必须是特定的域名）

理论上来说，ios的UIWebview中也能做到cookie写入，但是在用上了WKWebview后，据相应的开发人员说，由于WK中的网络请求都是系统进程。
如果页面用ajax请求，容器是无法监听到的，也就是无法在请求中写入cookie（没有更权威的人员来背书，也就认为它确实不能了）。

所以这种方式被弃用了。而采用了下面的token方案。

## 如何用token进行身份验证

token来校验身份应该是移动端中最常用的一种做法了，抛开token的原理不谈，其实就移动端来说面，流程是挺简单的。

这是native中使用token的流程。

1.有一个登陆页面，通过账号密码，登陆后接口字段中包含token字段

2.原生容器层面将token字段保存下来（一般还会有一个refreshToken字段以确保token过期时刷新token）

3.原生进行接口http请求时，在把token加入到一个头部。然后后台读取这个头部里的token字段进行验证。

```js
headers.Authorization = 'Bearer ' + token;
```

譬如token验证的头部大概长上面这样（主要是后端需要统一约定一个头部然后通信）

那么，在webview中的ajax请求呢？一样可以使用上面的方法。

在ajax请求中带上token头部即可（这一步一般有前端业务框架封装了）

不过注意，ajax请求时很多时候都会有跨域这个问题，需要一起配合解决。

当然，原生也可以提供一个代理网络请求的API，然后h5通过这个API来进行网络请求，这样token可以由原生统一添加，而且也不会有跨域问题。

所以，其实quickhybrid中，最终是可以采用这个token方案来进行身份验证的。

最后，还是得申明下，token方案的关键是token的生成（即上述的sso原理）。这里仅仅是提到而已。并没有展开将（因为展开的话整套后台逻辑并不简单，后续可以考虑单独结合后台来将）

## 返回根目录

- [【quickhybrid】如何实现一个Hybrid框架](https://github.com/quickhybrid/quickhybrid/issues/12)

## 源码

`github`上这个框架的实现

[quickhybrid/quickhybrid](https://github.com/quickhybrid/quickhybrid)
