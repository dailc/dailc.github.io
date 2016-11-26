/**
 * 作者: dailc
 * 时间: 2016-11-26
 * 描述:  图片点击放大效果,不依赖于第三方库(主要目的是去除js进行重新可以锻炼自己的原生js水平)
 * 目前给自己的blog用,所以基于app.js
 * 参考http://www.lanrentuku.com/js/tupian-1216.html
 * 的zoomify效果,只不过把所有jq依赖去除了
 */
(function(exports) {
	var ImageBubble = app.Class.extend({
		/**
		 * @description 一些默认设置
		 */
		defaultSetting: {
			duration: 200,
			easing: 'linear',
			scale: 0.9
		},
		/**
		 * @description 初始化,默认执行,默认针对于每一个元素
		 * @param {HTMLElement||String} element 目标元素或者选择器
		 * @param {JSON} options 一些配置参数
		 */
		init: function(element, options) {
			var self = this;
			self.element = app.dom.getDom(element);
			if(!self.element) {
				return;
			}
			self.options = app.common.extend(true, {}, self.defaultSetting, options);
			//初始化一些参数
			self.isZooming = false;
			self.isZoomed = false;
			self.timer = null;
			self.shadow = null;
			self.element.classList.add('zoomify');
			
			app.event.bindEvent(self.element, function() {
				self.zoom();
			}, 'click');
			app.event.bindEvent(window, function() {
				self.rePosition();
			}, 'resize');
			app.event.bindEvent(document, function() {
				self.rePosition();
			}, 'scroll');
		},

		/**
		 * @description css动画
		 * @param {HTMLElement} elem
		 * @param {String} value
		 */
		transition: function(elem, value) {
			app.css.setCss(elem, {
				'-webkit-transition:': value,
				'-moz-transition': value,
				'-ms-transition': value,
				'-o-transition': value,
				'transition': value
			});
		},
		/**
		 * @description 添加动画
		 * @param {HTMLElement} elem
		 */
		addTransition: function(elem) {
			this.transition(elem, 'all ' + this.options.duration + 'ms ' + this.options.easing);
		},
		/**
		 * @description 移除动画
		 * @param {HTMLElement} elem
		 * @param {Function} 回调
		 */
		removeTransition: function(elem, callback) {
			var self = this;
			clearTimeout(self.timer);
			self.timer = setTimeout(function() {
				self.transition(elem, '');
				if(app.common.isFunction(callback)) callback.call(self);
			}, self.options.duration);
		},
		/**
		 * @description 位移
		 * @param {HTMLElement} elem
		 * @param {String} value
		 */
		transform: function(elem, value) {
			var cssText = '';
			app.css.setCss(elem, {
				'-webkit-transform': value,
				'-moz-transform': value,
				'-ms-transform': value,
				'-o-transform': value,
				'transform': value
			});
		},
		/**
		 * @description 缩放和位移动画，实际图片zoomin和out的效果
		 * @param {Number} scale 缩放
		 * @param {Number} translateX x周位移
		 * @param {Number} translateY y轴位移
		 * @param {Function} callback 回调
		 */
		transformScaleAndTranslate: function(scale, translateX, translateY, callback) {
			this.addTransition(this.element);
			this.transform(this.element, 'scale(' + scale + ') translate(' + translateX + 'px, ' + translateY + 'px)');
			this.removeTransition(this.element, callback);
		},
		/**
		 * @description 位置重置
		 */
		rePosition: function() {
			if(this.isZoomed) {
				this.transition(this.element, 'none');
				this.zoomIn();
			}
		},
		/**
		 * @description 图片的缩放
		 */
		zoom: function() {
			if(this.isZooming) return;

			if(this.isZoomed) this.zoomOut();
			else this.zoomIn();
		},
		/**
		 * @description zoomin
		 */
		zoomIn: function() {
			var self = this;
			var transform = app.css.getCss(this.element, 'transform');
			self.transition(this.element, 'none');
			self.transform(this.element, 'none');

			var offset = app.offset.getOffset(this.element),
				width = app.dimensions.getElW(this.element),
				height = app.dimensions.getElH(this.element),
				//h5里的属性
				nWidth = this.element.naturalWidth || +Infinity,
				nHeight = this.element.naturalHeight || +Infinity,
				wWidth = app.dimensions.getWinWidth(),
				wHeight = app.dimensions.getWinHeight(),
				scaleX = Math.min(nWidth, wWidth * this.options.scale) / width,
				scaleY = Math.min(nHeight, wHeight * this.options.scale) / height,
				scale = Math.min(scaleX, scaleY),
				translateX = (-offset.left + (wWidth - width) / 2) / scale,
				translateY = (-offset.top + (wHeight - height) / 2 + app.dimensions.getScrollTop()) / scale;

			this.transform(this.element, transform);

			this.isZooming = true;
			this.element.classList.add('zoomed');
			app.event.trigger(this.element, 'zoom-in.zoomify');
			setTimeout(function() {
				self.addShadow();
				self.transformScaleAndTranslate(scale, translateX, translateY, function() {
					self.isZooming = false;
					app.event.trigger(self.element, 'zoom-in-complete.zoomify');
				});
				self.isZoomed = true;
			});
		},
		/**
		 * @description zoomout
		 */
		zoomOut: function() {
			var self = this;

			self.isZoomed = true;
			app.event.trigger(self.element,'zoom-out.zoomify');
			self.transformScaleAndTranslate(1, 0, 0, function() {
				self.isZooming = false;
				
				self.element.classList.remove('zoomed');
				app.event.trigger(self.element, 'zoom-out-complete.zoomify');
			});
			self.removeShadow();
			self.isZoomed = false;
		},
		//shadow background
		addShadow: function() {
			var self = this;
			if(self.isZoomed) return;

			if(self.shadow) {
				app.dom.removeDom(self.shadow);
			}
			self.shadow = app.dom.appendHtmlChildCustom('body', '<div class="zoomify-shadow"></div>');
			self.addTransition(self.shadow);
			app.event.bindEvent(self.shadow, function() {
				self.zoomOut();
			}, 'click');

			setTimeout(function() {
				self.shadow.classList.add('zoomed');
			}, 10);
		},
		removeShadow: function() {
			var self = this;
			if(!self.shadow) return;

			self.addTransition(self.shadow);
			self.shadow.classList.remove('zoomed');
			app.event.bindOne(self.element, function() {
				if(self.shadow) {
					app.dom.removeDom(self.shadow);
				}
				self.shadow = null;
			}, 'zoom-out-complete.zoomify');
		},
	});
	/**
	 * @description 初始化
	 * @param {String} selector 选择器
	 */
	exports.init = function(selector) {
		if(typeof selector !== 'string') {
			return;
		}
		var bubbleArray = [];
		var domList = document.querySelectorAll(selector);
		Array.prototype.forEach.call(domList, function(el) {
			var bubble = new ImageBubble(el);
			bubbleArray.push(bubble);
		});
		return bubbleArray;
	};
})(window.ImageBubble = {});