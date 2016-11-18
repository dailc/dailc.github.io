/**
 * 作者: dailc
 * 时间: 2016-11-13
 * 描述:  博客 书单页面
 */
(function(win) {
	var book = {
		/**
		 * @description 初始化book
		 */
		initBooks: function() {

		},
		/**
		 * @description 处理所有的flip item cover事件
		 */
		dealAllFlipItem: function() {
			var flipCallback = function(e) {
				var self = this;

				if(!self.classList.contains('out')) {

					//被点击的肯定是看见的
					var out = this.parentNode.querySelector('.out');
					//先隐藏自己，然后再显示out
					//内部动画的默认时间是225ms 所以这里以这个为间隔
					self.classList.remove('in');
					self.classList.add('out');
					setTimeout(function() {
						out.classList.remove('out');
						out.classList.add('in');

					}, 225);
				}

			};
			//鼠标覆盖上去的方法
			var flipCoverCallback = function(e) {
				var self = this;
				//先找到front 然后判断是否已经out
				var frontSide = self.querySelector('.cover-flip-front');
				if(!frontSide.classList.contains('out')) {
					flipCallback.call(frontSide, e);
				}
			};
			//鼠标离开上去的方法
			var flipOutCallback = function(e) {
				var self = this;
				//先找到front 然后判断是否已经out
				var backSide = self.querySelector('.cover-flip-back');
				if(!backSide.classList.contains('out')) {
					flipCallback.call(backSide, e);
				}	

			};
			var coverFlipItem = document.querySelectorAll('.cover-flip-item');
			app.bindEvent(coverFlipItem, flipCoverCallback, 'mouseenter');
			app.bindEvent(coverFlipItem, flipOutCallback, 'mouseleave');
		},
		/**
		 * @description book页面初始化
		 */
		init: function() {
			var self = this;
			self.dealAllFlipItem();
			var demoContent = [{
				demoLink: 'https://github.com/dailc',
				imgLink: 'https://dailc.github.io/staticResource/blog/hybrid/img_hybrid_base_hybridInfo_1.jpg',
				codeLink: 'https://github.com/dailc',
				title: 'Hybrid示例应用',
				relevant: 'js Hybrid模式',
				description: '混合开发，原生容器，h5+js进行业务功能开发，提升开发效率'
			}, {
				demoLink: 'https://github.com/dailc',
				imgLink: 'https://dailc.github.io/staticResource/blog/hybrid/img_hybrid_base_hybridInfo_2.jpg',
				codeLink: 'https://github.com/dailc',
				title: 'Hybrid示例应用',
				relevant: 'js Hybrid模式',
				description: '混合开发，原生容器，h5+js进行业务功能开发，提升开发效率'
			}, {
				demoLink: 'https://github.com/dailc',
				imgLink: 'https://dailc.github.io/staticResource/blog/hybrid/img_hybrid_base_hybridInfo_3.jpg',
				codeLink: 'https://github.com/dailc',
				title: 'Hybrid示例应用',
				relevant: 'js Hybrid模式',
				description: '混合开发，原生容器，h5+js进行业务功能开发，提升开发效率'
			}, {
				demoLink: 'https://github.com/dailc',
				imgLink: 'https://dailc.github.io/staticResource/blog/hybrid/img_hybrid_base_hybridInfo_3.jpg',
				codeLink: 'https://github.com/dailc',
				title: 'Hybrid示例应用',
				relevant: 'js Hybrid模式',
				description: '混合开发，原生容器，h5+js进行业务功能开发，提升开发效率'
			}];

		}
	};

	//初始化
	book.init();
})(window);