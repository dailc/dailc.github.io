/**
 * 作者: dailc
 * 时间: 2016-11-26
 * 描述: 通用js,提取自己的通用js
 */
(function(exports) {
	//通用补全
	(function() {
		//补全requestAnimFrame
		window.requestAnimFrame = (function() {
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				function(callback) {
					window.setTimeout(callback, 1000 / 60);
				};
		})();
		//补全map
		if(!Array.prototype.map) {
			console.log("拓展map");
			Array.prototype.map = function(fn) {
				var a = [];
				for(var i = 0; i < this.length; i++) {
					var value = fn(this[i], i);
					if(value == null) {
						continue;
					}
					a.push(value);
				}
				return a;
			};
		}
		//补全事件
		function CustomEvent(event, params) {
			params = params || {
				bubbles: false,
				cancelable: false,
				detail: undefined
			};
			//createEvent()方法返回新创建的Event对象，支持一个参数，表示事件类型，具体如下：
			//参数			事件接口	        初始化方法
			//HTMLEvents	HTMLEvent	initEvent()
			//MouseEvents	MouseEvent	initMouseEvent()
			//UIEvents		UIEvent		initUIEvent()

			var evt = document.createEvent('HTMLEvents');
			var bubbles = true;
			for(var name in params) {
				(name === 'bubbles') ? (bubbles = !!params[name]) : (evt[name] = params[name]);
			}
			evt.initEvent(event, bubbles, true);
			return evt;
		};
		//console.log('重写CustomEvent');
		CustomEvent.prototype = window.Event.prototype;
		if(typeof window.CustomEvent === 'undefined') {
			window.CustomEvent = CustomEvent;
		}
	})();
	/**
	 * Class模块,模拟Class的基类,以便模拟Class进行继承等
	 */
	(function() {
		//同时声明多个变量,用,分开要好那么一点点
		var initializing = false,
			//通过正则检查是否是函数
			fnTest = /xyz/.test(function() {
				xyz;
			}) ? /\b_super\b/ : /.*/;
		var Class = function() {};
		//很灵活的一种写法,直接重写Class的extend,模拟继承
		Class.extend = function(prop) {
			var _super = this.prototype;
			initializing = true;
			//可以这样理解:这个prototype将this中的方法和属性全部都复制了一遍
			var prototype = new this();
			initializing = false;
			for(var name in prop) {
				//这一些列操作逻辑并不简单，得清楚运算符优先级
				//逻辑与的优先级是高于三元条件运算符的,得注意下
				//只有继承的函数存在_super时才会触发(哪怕注释也一样进入)
				//所以梳理后其实一系列的操作就是判断是否父对象也有相同对象
				//如果有,则对应函数存在_super这个东西
				prototype[name] = typeof prop[name] == "function" &&
					typeof _super[name] == "function" && fnTest.test(prop[name]) ?
					(function(name, fn) {
						return function() {
							var tmp = this._super;
							this._super = _super[name];
							var ret = fn.apply(this, arguments);
							this._super = tmp;
							return ret;
						};
					})(name, prop[name]) :
					prop[name];
			}
			/**
			 * @description Clss的构造,默认会执行init方法
			 */
			function Class() {
				if(!initializing && this.init) {
					this.init.apply(this, arguments);
				}
			}
			Class.prototype = prototype;
			Class.prototype.constructor = Class;
			//callee 的作用是返回当前执行函数的自身
			//这里其实就是this.extend,不过严格模式下禁止使用
			//Class.extend = arguments.callee;
			//替代callee 返回本身
			Class.extend = this.extend;
			return Class;
		};
		exports.Class = Class;
	})();
	//common模块
	(function(exports) {
		/**
		 * each each遍历
		 * @param {type} elements
		 * @param {type} callback
		 * @returns {_L8.$}
		 */
		exports.each = function(elements, callback, hasOwnProperty) {
			if(!elements) {
				return this;
			}
			if(typeof elements.length === 'number') {
				[].every.call(elements, function(el, idx) {
					return callback.call(el, idx, el) !== false;
				});
			} else {
				for(var key in elements) {
					if(hasOwnProperty) {
						if(elements.hasOwnProperty(key)) {
							if(callback.call(elements[key], key, elements[key]) === false) return elements;
						}
					} else {
						if(callback.call(elements[key], key, elements[key]) === false) return elements;
					}
				}
			}
			return this;
		};
		var class2type = {};
		exports.each(['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error'], function(i, name) {
			class2type["[object " + name + "]"] = name.toLowerCase();
		});
		/**
		 *  isWindow(需考虑obj为undefined的情况)
		 */
		exports.isWindow = function(obj) {
			return obj != null && obj === obj.window;
		};
		exports.type = function(obj) {
			return obj == null ? String(obj) : class2type[{}.toString.call(obj)] || "object";
		};
		/**
		 *  isFunction
		 */
		exports.isFunction = function(value) {
			return exports.type(value) === "function";
		};
		/**
		 *  isObject
		 */
		exports.isObject = function(obj) {
			return exports.type(obj) === "object";
		};
		/**
		 *  isPlainObject
		 */
		exports.isPlainObject = function(obj) {
			return exports.isObject(obj) && !exports.isWindow(obj) && Object.getPrototypeOf(obj) === Object.prototype;
		};
		exports.isArray = Array.isArray ||
			function(object) {
				return object instanceof Array;
			};
		/**
		 * extend(simple)
		 * @param {type} target
		 * @param {type} source
		 * @param {type} deep
		 * @returns {unresolved}
		 */
		exports.extend = function() { //from jquery2
			var options, name, src, copy, copyIsArray, clone,
				target = arguments[0] || {},
				i = 1,
				length = arguments.length,
				deep = false;

			if(typeof target === "boolean") {
				deep = target;
				target = arguments[i] || {};
				i++;
			}
			if(typeof target !== "object" && !exports.isFunction(target)) {
				target = {};
			}
			if(i === length) {
				target = this;
				i--;
			}
			for(; i < length; i++) {
				if((options = arguments[i]) != null) {
					for(name in options) {
						src = target[name];
						copy = options[name];
						if(target === copy) {
							continue;
						}
						if(deep && copy && (exports.isPlainObject(copy) || (copyIsArray = exports.isArray(copy)))) {
							if(copyIsArray) {
								copyIsArray = false;
								clone = src && exports.isArray(src) ? src : [];

							} else {
								clone = src && exports.isPlainObject(src) ? src : {};
							}

							target[name] = exports.extend(deep, clone, copy);
						} else if(copy !== undefined) {
							target[name] = copy;
						}
					}
				}
			}
			return target;
		};
	})(exports.common = {});
	//判断系统
	(function(exports) {
		function detect(ua) {
			this.name = 'browser';
			var funcs = [
				function() { //android
					var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
					if(android) {
						this.android = true;
						this.version = android[2];
						this.isBadAndroid = !(/Chrome\/\d/.test(window.navigator.appVersion));
						this.name += '_' + 'Android';
						this.name += '_' + 'mobile';
					}
					return this.android === true;
				},
				function() { //ios
					var iphone = ua.match(/(iPhone\sOS)\s([\d_]+)/);
					if(iphone) { //iphone
						this.ios = this.os.iphone = true;
						this.version = iphone[2].replace(/_/g, '.');
						this.name += '_' + 'iphone';
						this.name += '_' + 'mobile';
					} else {
						var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
						if(ipad) { //ipad
							this.ios = this.os.ipad = true;
							this.version = ipad[2].replace(/_/g, '.');
							this.name += '_' + 'iOS';
							this.name += '_' + 'mobile';
						}
					}
					return this.ios === true;
				}
			];
			[].every.call(funcs, function(func) {
				return !func.call(exports);
			});
		}
		detect.call(exports, navigator.userAgent);

		/**
		 * @description 获取更为详细的浏览器信息
		 */
		exports.getBrowserInfo = function() {
			var agent = navigator.userAgent.toLowerCase();
			var regStr_ie = /msie [\d.]+;/gi;
			var regStr_ff = /firefox\/[\d.]+/gi
			var regStr_chrome = /chrome\/[\d.]+/gi;
			var regStr_saf = /safari\/[\d.]+/gi;
			//IE
			if(agent.indexOf("msie") > 0) {
				return agent.match(regStr_ie);
			}
			//firefox
			if(agent.indexOf("firefox") > 0) {
				return agent.match(regStr_ff);
			}
			//Safari
			if(agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0) {
				return agent.match(regStr_saf);
			}
			//Chrome
			if(agent.indexOf("chrome") > 0) {
				return agent.match(regStr_chrome);
			}
		};
		/**
		 * @description 获取当前电脑操作系统的信息
		 * 返回格式: win7
		 */
		exports.getOSInfo = function() {
			var sUserAgent = navigator.userAgent;
			var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
			var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
			if(isMac) return "Mac";
			var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
			if(isUnix) return "Unix";
			var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
			if(isLinux) return "Linux";
			if(isWin) {
				var isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;
				if(isWin2K) return "Win2000";
				var isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1;
				if(isWinXP) return "WinXP";
				var isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;
				if(isWin2003) return "Win2003";
				var isWinVista = sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;
				if(isWinVista) return "WinVista";
				var isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
				if(isWin7) return "Win7";
				var isWin10 = sUserAgent.indexOf("Windows NT 10.0") > -1 || sUserAgent.indexOf("Windows 10") > -1;
				if(isWin7) return "Win10";
				return 'other windows';
			}
			return "other";
		};
	})(exports.os = {});
	//dom模块
	(function(exports) {
		/**
		 * @description 将string字符串转为html对象,默认创一个div填充
		 * @param {String} strHtml 目标字符串
		 * @return {HTMLElement} 返回处理好后的html对象,如果字符串非法,返回null
		 */
		exports.pareseStringToHtml = function(strHtml) {
			if(strHtml == null || typeof(strHtml) != "string") {
				return null;
			}
			//创一个灵活的div
			var i, a = document.createElement("div");
			var b = document.createDocumentFragment();
			a.innerHTML = strHtml;
			while(i = a.firstChild) b.appendChild(i);
			return b;
		};
		/**
		 * @description给html对象添加子元素
		 * @param {HTMLElement} targetObj 目标dom，必须是原生对象
		 * @param {HTMLElement||String} childElem 目标html的字符串或者是dom对象
		 */
		exports.appendHtmlChildCustom = function(targetObj, childElem) {
			targetObj = exports.getDom(targetObj);
			if(targetObj == null || childElem == null || !(targetObj instanceof HTMLElement)) {
				return;
			}
			if(childElem instanceof HTMLElement) {
				targetObj.appendChild(childElem);
			} else {
				//否则,创建dom对象然后添加
				var tmpDomObk = exports.pareseStringToHtml(childElem);
				if(tmpDomObk != null) {
					targetObj.appendChild(tmpDomObk);
				}
			}
			//如果需要找到刚添加的dom,需要找el 的最后一个元素
			return targetObj.lastChild;
		};
		/**
		 * @description 找到当前node的下一个节点，排除文本
		 * @param {HTMLElement} node
		 * @param {String} className，选填，填了后会过滤特定class
		 */
		exports.getNextElement = function(node, className) {
			if(!node) {
				return null;
			}
			if(node.nextSibling && node.nextSibling.nodeType == 1) { //判断下一个节点类型为1则是“元素”节点   
				if(!className || node.classList.contains(className)) {
					//如果符合选择
					return node.nextSibling;
				} else {
					//下一个
					return exports.getNextElement(node.nextSibling);
				}

			}
			if(node.nextSibling && node.nextSibling.nodeType == 3) { //判断下一个节点类型为3则是“文本”节点  ，回调自身函数  
				return exports.getNextElement(node.nextSibling);
			}
			return null;
		};
		/**
		 * @description 找到当前node的上一个节点，排除文本
		 * @param {HTMLElement} node
		 * @param {String} className，选填，填了后会过滤特定class
		 */
		exports.getPreElement = function(node, className) {
			if(!node) {
				return null;
			}
			if(node.previousSibling && node.previousSibling.nodeType == 1) { //判断下一个节点类型为1则是“元素”节点   
				if(!className || node.classList.contains(className)) {
					//如果符合选择
					return node.previousSibling;
				} else {
					//上一个
					return exports.getPreElement(node.previousSibling);
				}

			}
			if(node.previousSibling && node.previousSibling.nodeType == 3) { //判断下一个节点类型为3则是“文本”节点  ，回调自身函数  
				return exports.getPreElement(node.previousSibling);
			}
			return null;
		};
		/**
		 * @description 获取elem
		 * @param {HTMLElement||String} elem
		 */
		exports.getDom = function(elem) {
			if(typeof elem === 'string') {
				elem = document.querySelector(elem);
			}
			return elem
		};
		/**
		 * @description 移除elem
		 * @param {HTMLElement||String} elem
		 */
		exports.removeDom = function(elem) {
			elem = exports.getDom(elem);
			elem && (elem.parentNode.removeChild(elem));
		};
	})(exports.dom = {});
	//一些简要封装的动画
	(function(exports) {
		/**
		 * @description 取得元素的实际高度
		 * @param {HTMLElement} ele
		 */
		function coculateOffset(ele) {
			var node = ele;
			var orignalHeight = node.style.height;
			var orignalDisplay = node.style.display;
			node.style.height = "";
			node.style.display = "block";
			var h = node.offsetHeight;
			node.style.height = orignalHeight;
			node.style.display = orignalDisplay;
			return(h);
		}
		/**
		 * @description 显示元素
		 * @param {HTMLElement} ele
		 */
		function show(ele) {

			var h = coculateOffset(ele)
			var i = 1;
			var t = setInterval(function() {
				i += i;
				ele.style.height = i + "px";
				ele.style.display = "";
				ele.style.opacity = ele.style.opacity * 2;
				if(i > h / 2) {
					ele.style.height = h + "px";
					ele.style.opacity = 1;
					clearInterval(t);
				}
			}, 35)
		}
		/**
		 * @description 隐藏元素
		 * @param {HTMLElement} ele
		 */
		function hide(ele) {

			var h = coculateOffset(ele);
			var t = setInterval(function() {
				if(h > 2) {
					h = h / 2;
					ele.style.opacity = ele.style.opacity / 2;
				} else {
					h = 0;
					clearInterval(t);
				}
				ele.style.height = h + "px";
			}, 50)
		}
		/**
		 * @description 简易的animate
		 * @param {String} selector 支持单个dom
		 * @param {JSON} 配置属性，只有数字才能进行动画，另外需要这个属性本身可以动画
		 * @param {Number} duration 持续时间
		 * @param {Function} callback 动画完成后的回调
		 */
		exports.animate = function(selector, options, duration, callback) {
			if(!options) {
				return
			};
			selector = app.dom.getDom(selector);
			if(options.display) {
				//如果是与display显示有关
				if(options.display === 'hide' || options.display === 'none') {
					hide(selector);
				} else if(options.display === 'show' || options.display === 'block') {
					show(selector);
				}
				return;
			}
			//默认500ms
			duration = duration || 500;
			var count = 0;
			//记录一些变化之
			var change = {};
			for(attr in options) {
				//每帧需要改变的值
				change[attr] = (options[attr] - selector[attr]) / (60 * duration / (1000));
				//经测试 scrolltop 浮点数实际上会产生效果，但是每次取得时候只会返回整形，造成了误差
			}

			var loop = function() {
				for(attr in options) {
					selector[attr] += change[attr];
				}
				count++;
				if(count >= (duration * 60 / 1000)) {
					//已经执行完毕
					callback && callback();
				} else {

					requestAnimFrame(loop);
				}
			};
			//每1000/60 会执行一次
			loop();
		};
	})(exports.animate = {});
	//event模块
	(function(exports) {
		/**
		 * @description 绑定监听事件 暂时先用click
		 * @param {HTMLElement||String} dom 单个dom,或者selector
		 * @param {Function} callback 回调函数
		 * @param {String} 事件名
		 */
		exports.bindEvent = function(dom, callback, eventName) {
			eventName = eventName || 'click';
			if(typeof dom === 'string') {
				//选择
				dom = document.querySelectorAll(dom);
			}
			if(!dom) {
				return;
			}
			if(dom.length > 0) {
				for(var i = 0, len = dom.length; i < len; i++) {
					dom[i].addEventListener(eventName, callback);
				}
			} else {
				dom.addEventListener(eventName, callback);
			}
		};
		/**
		 * @description 绑定一次的事件
		 * @param {HTMLElement||String} dom 单个dom,或者selector
		 * @param {Function} callback 回调函数
		 * @param {String} 事件名
		 */
		exports.bindOne = function(dom, callback, eventName) {
			eventName = eventName || 'click';
			if(typeof dom === 'string') {
				//选择
				dom = document.querySelectorAll(dom);
			}
			if(!dom) {
				return;
			}
			var callbackFilter = function(el){
				callback&&callback.apply(this);
				this.removeEventListener(eventName,callbackFilter);
			};
			if(dom.length > 0) {
				for(var i = 0, len = dom.length; i < len; i++) {
					dom[i].addEventListener(eventName, callbackFilter);
				}
			} else {
				dom.addEventListener(eventName, callbackFilter);
			}
		};
		/**
		 * @description trigger event,这里为h5的实现
		 * @param {HTMLElement} element 目标元素,默认为整个document
		 * @param {string} eventType
		 * @param {JSON} eventData 额外的数据
		 * @returns {Global}
		 */
		exports.trigger = function(element, eventType, eventData) {

			element.dispatchEvent(new CustomEvent(eventType, {
				detail: eventData,
				bubbles: true,
				cancelable: true
			}));
			return this;
		};
	})(exports.event = {});
	//屏幕分辨率相关
	(function(exports) {
		/**
		 * @description 获取滚动条在Y轴上的滚动距离
		 * @return {Number} 返回具体距离
		 */
		exports.getScrollTop = function() {
			var scrollTop = 0,
				bodyScrollTop = 0,
				documentScrollTop = 0;
			if(document.body) {
				bodyScrollTop = document.body.scrollTop || 0;
			}
			if(document.documentElement) {
				documentScrollTop = document.documentElement.scrollTop || 0;
			}
			scrollTop = (bodyScrollTop > documentScrollTop) ? bodyScrollTop : documentScrollTop;
			return scrollTop;
		}

		/**
		 * @description 获取文档的总高度
		 * @return {Number} 返回具体高度
		 */
		exports.getScrollHeight = function() {
			var scrollHeight = 0,
				bodyScrollHeight = 0,
				documentScrollHeight = 0;
			if(document.body) {
				bodyScrollHeight = document.body.scrollHeight;
			}

			if(document.documentElement) {
				documentScrollHeight = document.documentElement.scrollHeight;
			}
			scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
			return scrollHeight;
		};
		/**
		 * @description 浏览器视口的高度
		 * @return {Number} 返回具体高度
		 */
		exports.getWinHeight = function() {
			var windowHeight = 0;
			if(document.compatMode == "CSS1Compat") {
				windowHeight = document.documentElement.clientHeight;
			} else {
				windowHeight = document.body.clientHeight;
			}
			return windowHeight;
		};
		/**
		 * @description 浏览器视口的宽度
		 * @return {Number} 返回具体宽度
		 */
		exports.getWinWidth = function() {
			var windowWidth = 0;
			if(document.compatMode == "CSS1Compat") {
				windowWidth = document.documentElement.clientWidth;
			} else {
				windowWidth = document.body.clientWidth;
			}
			return windowWidth;
		};

		/**
		 * @description 获取元素的宽度
		 */
		exports.getElW = function(elem) {
			elem = app.dom.getDom(elem);
			return elem.offsetWidth;
		};
		/**
		 * @description 获取元素的高度
		 */
		exports.getElH = function(elem) {
			elem = app.dom.getDom(elem);
			return elem.offsetHeight;
		};
	})(exports.dimensions = {});
	//offset模块
	(function(exports) {
		exports.getTop = function(elem) {
			elem = app.dom.getDom(elem);
			return elem.offsetParent ? (elem.offsetTop + exports.getTop(elem.offsetParent)) : elem.offsetTop;
		};
		exports.getLeft = function(elem) {
			elem = app.dom.getDom(elem);
			return elem.offsetParent ? (elem.offsetLeft + exports.getLeft(elem.offsetParent)) : elem.offsetLeft;
		};
		exports.getOffset = function(elem) {
			elem = app.dom.getDom(elem);
			return {
				left: exports.getLeft(elem),
				top: exports.getTop(elem),
			};
		};
	})(exports.offset = {});
	// css模块
	(function(exports) {
		/**
		 * @description 将目标字符串转为camel格式
		 * 注意 -ms-a 转换后是MSA，比较特殊
		 */
		function camelCase(str) {
			str = str.replace(/^-ms/, 'MS');
			return str.replace(/-(\w)/g, function(x) {
				return x.slice(1).toUpperCase();
			});
		}
		/**
		 * @description 设置css
		 * @param {HTMLElement} elem 对应元素
		 * @param {JSON} options 配置,各自的属性,需要将-转为camel
		 */
		exports.setCss = function(elem, options) {
			for(var item in options) {
				elem.style[camelCase(item)] = options[item];
			}
		};
		/**
		 * @description 得到css
		 * @param {HTMLElement} elem 对应元素
		 * @param {String} item 对应属性
		 */
		exports.getCss = function(elem, item) {
			return elem.style[camelCase(item)];
		};
	})(exports.css = {});
	// 执行blog的默认代码
	(function() {
		/**
		 * @description 处理头部的toggle按钮
		 */
		function dealWithCollapsedBtn() {
			var collapsedBtn = document.querySelector('.header .collapsed');
			if(collapsedBtn) {
				var menuContainer = document.querySelector('.header .menu-container');
				app.event.bindEvent(collapsedBtn, function() {
					//console.log("点击");
					if(menuContainer.classList.contains('hideMenu')) {
						app.animate.animate(menuContainer, {
							"display": "show"
						});
						menuContainer.classList.remove('hideMenu');
					} else {
						app.animate.animate(menuContainer, {
							"display": "hide"
						});
						menuContainer.classList.add('hideMenu');
					}
				}, 'click');
			}
		}
		/**
		 * @description 处理搜索
		 */
		function dealSearch() {
			var inputDom = document.querySelector('.site-search input');
			app.event.bindEvent(inputDom, function() {
				var value = inputDom.value;
				window.location.href = '/search/search#'+value;
			}, 'change');
		}
		window.onload = function() {
			console.log("这里是戴荔春的个人博客!");
			console.log("联系方式: https://dailc.github.io/about/about.html");
			dealWithCollapsedBtn();
			dealSearch();
		};
	})();
})(window.app = {});