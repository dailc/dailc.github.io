/**
 * 作者: dailc
 * 时间: 2016-11-02 
 * 描述: 通用js
 */
(function(exports) {
	/**
	 * @description 模拟Class的基类,以便模拟Class进行继承等
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
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();
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

	/**
	 * @description 判断是否是移动端
	 */
	exports.isMobile = function() {
		var Android = function() {
			return navigator.userAgent.match(/Android/i);
		};
		var iOS = function() {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		};
		return(Android() || iOS());
	};
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
		if(typeof targetObj === 'string') {
			targetObj = document.querySelector(targetObj);
		}
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
	 * @description 绑定监听事件 暂时先用click
	 * @param {HTMLElement||String} dom 单个dom,或者selector
	 * @param {Function} callback 回调函数
	 * @param {String} 事件名
	 */
	exports.bindEvent = function(dom, callcack, eventName) {
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
				dom[i].addEventListener(eventName, callcack);
			}
		} else {
			dom.addEventListener(eventName, callcack);
		}

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
	exports.getWindowHeight = function() {
		var windowHeight = 0;
		if(document.compatMode == "CSS1Compat") {
			windowHeight = document.documentElement.clientHeight;
		} else {
			windowHeight = document.body.clientHeight;
		}
		return windowHeight;
	};
	/**
	 * @description 获取元素的宽度
	 */
	exports.getElW = function(el) {
		if(typeof el === 'string') {
			el = document.querySelector(el);
		}
		return el.offsetWidth;
	};
	/**
	 * @description 获取元素的高度
	 */
	exports.getElH = function(el) {
		if(typeof el === 'string') {
			el = document.querySelector(el);
		}
		return el.offsetHeight;
	};
	/**
	 * @description 获取目标在文档中的y坐标
	 * @param {String||HTMLElement} elem
	 * @return {Number} 返回具体高度
	 */
	exports.getdomY = function(elem) {
		if(typeof elem === 'string') {
			elem = document.querySelector(elem);
		}
		var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
		return elem.offsetParent ? (elem.offsetTop + exports.getdomY(elem.offsetParent)) : elem.offsetTop;
	};
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
		if(typeof selector === 'string') {
			selector = document.querySelector(selector);
		}
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

	/**
	 * @description 处理头部的toggle按钮
	 */
	function dealWithCollapsedBtn() {
		var collapsedBtn = document.querySelector('.header .collapsed');
		if(collapsedBtn) {
			var menuContainer = document.querySelector('.header .menu-container');
			app.bindEvent(collapsedBtn, function() {
				//console.log("点击");
				if(menuContainer.classList.contains('hideMenu')) {
					app.animate(menuContainer, {
						"display": "show"
					});
					menuContainer.classList.remove('hideMenu');
				} else {
					app.animate(menuContainer, {
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
		app.bindEvent(inputDom, function() {
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
})(window.app = {});