/**
 * 作者: dailc
 * 时间: 2016-11-12 
 * 描述:  瀑布流类，可以以瀑布流展示内容，预设有 装载，加载更多等几个api
 * 算法步骤:基于absolute布局
 * 1.获取元素容器的总宽度allWith, 每一个瀑布流元素的列宽度 itemWidth(如果大于allwidth,会有一个默认值替代)
 * 2.计算当前容器可以显示的列数 column  Math.floor(allwidth/itemWidth) 向下取整
 * 3.添加一个元素前，计算每一列当前的高度，寻找当前高度最小的列，然后根据列的序号k，确定item的left和top
 * lef=k*itemWidth top=当前列的高度，然后当前列插入这个元素，当前列的高度加上这个元素的高度
 * 4.所有元素插入完毕后，容器的高度会调整为最大列的高度
 * 
 * 为了便于使用和拓展，提供了几个api:
 * load(加载数据) 主动通过this.load(html)调用,可以添加一个item,注意，每次只添加一个
 * options.loadSuccess(this,isInit)(传入的options参数,由这个函数通知页面已经加载完毕,isInit代表是否是初始化完毕)
 * 
 * 这个js库，不依赖于任何第三方库，可以通过Class.extend来拓展这个类的功能
 * 
 * 欢迎大家使用~使用前请顺手star,说明下参考引用来源~
 * © 2016 https://github.com/dailc
 */
(function(exports) {
	/**
	 * @description 模拟Class的基类,以便模拟Class进行继承等
	 * 参考的源码是mui的源码 http://dev.dcloud.net.cn/mui/ui/
	 * 通过WaterfallFlow.extend({}) 可以拓展这个类
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
	///定义一个瀑布流类，便于继承修改
	//不依赖于第三方组件，通过计算使用绝对布局定位，适配移动端
	var flow = exports.Class.extend({
		/**
		 * @description Class构造时会自动执行对象的init函数
		 * @param {HTMLElement||String} element 瀑布流的容器
		 * 容器下级需要有一个div用来控制宽高
		 * @param {JSON} options 传入参数,包括
		 * itemSelector 每一个原生的selector符号,便于计算元素高度
		 * columnWidth 每一列的宽度
		 * gutter 列与列之间的间隔
		 */
		init: function(element, options) {
			var self = this;
			if(typeof element === 'string') {
				element = document.querySelector(element);
			}
			if(!element) {
				throw "WaterfallFlow need container 'element'!";
			}
			options = options || {};
			if(!options.itemSelector || !options.gridSelector) {
				throw "WaterfallFlow need 'itemSelector' and 'gridSelector' !";
			}
			//计算容器的宽度
			//容器
			self.container = element;
			//element是container下的grid节点
			self.element = self.container.querySelector(options.gridSelector);

			options.gutter = options.gutter || 20;
			self.gutter = options.gutter;
			self.itemSelector = options.itemSelector;
			self.options = options;
			//触发一次重置事件即可
			self.resize();
			self.listenResize();
			self.doExtendJob&&self.doExtendJob();
		},
		/**
		 * @description 重置事件
		 */
		resize: function() {
			var self = this;
			self.wrapWith = self.getElW(self.container);
			self.columnWidth = (self.options.columnWidth > 0 && self.options.columnWidth < self.wrapWith) ? self.options.columnWidth : self.wrapWith - 2 * self.gutter;
			//当前有多少列
			self.column = Math.floor((self.wrapWith + self.gutter) / (self.columnWidth + self.gutter));
			self.waitImg(self.element, function() {
				//计算当前容器内部的items
				self.caculateAllItems();
			});
		},
		/**
		 * @description 等待某一个dom下的所有img加载完毕
		 * 因为img没有加载完毕时计算高度有误差
		 * @param {HTMLElement} dom
		 */
		waitImg: function(dom, callback) {
			var self = this;
			var imgArray = dom.querySelectorAll('img');
			var len = imgArray.length;
			var count = 0;
			Array.prototype.forEach.call(imgArray, function(el) {
				if(el.complete) {
					count++;
				} else {
					var countFun = function() {
						count++
						if(count >= len) {
							callback && callback();
							return;
						}
					};
					el.onload = countFun;
					el.onerror = countFun;
				}
			});
			if(count >= len) {
				callback && callback();
			}
		},
		/**
		 * @description监听resize事件
		 * 必须确保grid的parent存在
		 * 也就是确保的dom结构是
		 * 更上级的dom(样式不做要求)->父节点(margin padding都为0)->grid->griditem
		 */
		listenResize: function() {
			var self = this;
			window.addEventListener('resize', function() {
				var originCol = self.column;
				var newWith = self.getElW(self.container);
				var newCol = Math.floor((newWith + self.gutter) / (self.columnWidth + self.gutter));
				if(newCol !== originCol) {
					//resize事件
					self.resize();
				}
			});
		},
		/**
		 * @description 计算当前容器内部的items
		 */
		caculateAllItems: function() {
			var self = this;
			//当前的所有列的高度存储，便于知道当前那一列高度最小
			var cosHeightArray = [];
			self.cosHeightArray = cosHeightArray;
			for(var i = 0; i < self.column; i++) {
				//防止初始化时没有item,导致后续数组计算出错的失误
				cosHeightArray[i] = 0;
			}
			//获取所有当前的items
			var items = self.element.querySelectorAll(self.itemSelector);
			//遍历
			for(var i = 0, len = items.length; i < len; i++) {
				if(i < self.column) {
					//这个时候，进来的都是第一行内容，无需计算,需要初始化列的高度数组
					cosHeightArray[i] = self.getElH(items[i]) + self.gutter;
					self.setItem(items[i], i * self.columnWidth + i * self.gutter, 0);
				} else {
					self.appendItem(items[i]);
				}
			}
			self.resetEl();
			self.options.loadSuccess && self.options.loadSuccess(self, true);
		},
		/**
		 * @description 添加一个item
		 * @param {HTMLElement} el
		 */
		appendItem: function(el) {
			var self = this;
			//这时候需要计算如何添加了
			var minColHeight = self.getMinColHeight();
			var currColIndex = self.getMinColIndex(minColHeight);
			self.setItem(el, currColIndex * self.columnWidth + currColIndex * self.gutter, minColHeight);
			self.cosHeightArray[currColIndex] += self.getElH(el) + self.gutter;
		},
		/**
		 * @description 设置item为absolute
		 * @param {HTMLElement} el
		 * @param {Number} left
		 * @param {Number} top
		 */
		setItem: function(el, left, top) {
			var self = this;
			el.style.position = 'absolute';
			el.style.left = left + 'px';
			el.style.top = top + 'px';
			el.style.width = self.columnWidth + 'px';
		},
		/**
		 * @description 获取当前最小高度的列的高度
		 */
		getMinColHeight: function() {
			var self = this;
			var minHeight = Math.min.apply(null, self.cosHeightArray);
			return minHeight;
		},
		/**
		 * @description 获取当前最大高度的列的高度
		 */
		getMaxColHeight: function() {
			var self = this;
			var maxHeight = Math.max.apply(null, self.cosHeightArray);
			return maxHeight;
		},
		/**
		 * @description 获取当前高度最小的列的表
		 * @param {Number} minHeight 当前最小高度的列
		 */
		getMinColIndex: function(minHeight) {
			var self = this;
			for(var i = 0, len = self.cosHeightArray.length; i < len; i++) {
				if(self.cosHeightArray[i] === minHeight) {
					return i;
				}
			}
		},
		/**
		 * @description 获取元素的宽度
		 * @param {HTMLElement} el
		 */
		getElW: function(el) {
			return el.offsetWidth;
		},
		/**
		 * @description 获取元素的高度
		 * @param {HTMLElement} el
		 */
		getElH: function(el) {
			return el.offsetHeight;
		},
		/**
		 * @description 将string字符串转为html对象,默认创一个div填充
		 * @param {String} strHtml 目标字符串
		 * @return {HTMLElement} 返回处理好后的html对象,如果字符串非法,返回null
		 */
		pareseStringToHtml: function(strHtml) {
			if(strHtml == null || typeof(strHtml) != "string") {
				return null;
			}
			//创一个灵活的div
			var i, a = document.createElement("div");
			var b = document.createDocumentFragment();
			a.innerHTML = strHtml;
			while(i = a.firstChild) b.appendChild(i);
			return b;
		},
		/**
		 * @description给html对象添加子元素
		 * @param {HTMLElement} targetObj 目标dom，必须是原生对象
		 * @param {HTMLElement||String} childElem 目标html的字符串或者是dom对象
		 */
		appendHtmlChild: function(targetObj, childElem) {
			var self = this;
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
				var tmpDomObk = self.pareseStringToHtml(childElem);
				if(tmpDomObk != null) {
					targetObj.appendChild(tmpDomObk);
				}
			}
			//如果需要找到刚添加的dom,需要找el 的最后一个元素
			return targetObj.lastChild;
		},
		/**
		 * @description 重置el
		 * 容器的宽度适配，所以只需要给容器设置一个特定的css值,即可居中
		 */
		resetEl: function() {
			var self = this;
			var maxHeight = self.getMaxColHeight();
			//先给元素容器设置固定的style
			self.element.style.position = 'relative';
			//父容器的宽度为 column*width+(column-1)*gutter
			//self.element.style.width = self.wrapWith + 'px';
			self.element.style.width = self.columnWidth * self.column + (self.column - 1) * self.gutter + 'px';
			self.element.style.height = maxHeight + 'px';
			self.element.style.marginLeft = 'auto';
			self.element.style.marginRight = 'auto';
		},
		/**
		 * @description 拓展这个类时可以重写这个方法，然后实现自己的逻辑
		 */
		doExtendJob: function() {},
		/**
		 * @description 添加新的元素
		 * @param {String} html
		 */
		load: function(html) {
			var self = this;
			//暂时用app的添加子元素
			var dom = self.appendHtmlChild(self.element, html);
			//console.log("dom:"+dom.innerHTML);
			self.waitImg(dom, function() {
				self.appendItem(dom);
				self.resetEl();
				self.options.loadSuccess && self.options.loadSuccess(self, false);
			});
		}
	});

	WaterfallFlow.flow = flow;
})(window.WaterfallFlow = {});