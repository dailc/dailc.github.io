/**
 * 作者: dailc
 * 时间: 2016-11-09
 * 描述:  博客归档页面
 */
(function(win) {
	//toc对象
	var TocObj = {
		/**
		 * @description 初始化右侧toc的归档数字，比如2016年有多少篇
		 */
		initArchiveCount: function() {
			var self = this;
			var tocList = document.querySelector('.atchive-toc').querySelectorAll('.list-item a');
			self.tocList = tocList;
			Array.prototype.forEach.call(tocList, function(el) {
				var target = el.getAttribute('href');
				if(target) {
					target = target.replace('#', '');
					if(parseInt(target)) {
						//如果是年份才处理
						//console.log("目标:"+target);
						var targetDom = document.getElementById(target);
						//childNodes是标准的 children是非标准的,但是几乎所有浏览器支持，但是不会返回文本以及空节点
						//nextSibling 会找到文本节点，所以需要手动排除
						var targetChildsCount = app.dom.getNextElement(targetDom).children.length
						app.dom.getNextElement(el).innerText = targetChildsCount;
					}
				}
			});
		},
		/**
		 * @description 当往下滑动时,toc变为fixed
		 * 激活toc激活功能,当前最上面的才会被激活
		 */
		initTocActive: function() {
			var self = this;
			app.event.bindEvent(self.tocList, function(e) {
				//阻止默认的跳转，改成用自定义跳转
				e.preventDefault();
				//console.log(this.innerHTML);
				//获得当前菜单对应的title的id
				var selector = this.getAttribute('href');
				if(selector){
					selector = selector.replace('#','');
				}
				selector = document.getElementById(selector);
				var targetScrollTop = app.offset.getTop(selector);
				//document.body.scrollTop = targetScrollTop -30;
				//console.log("~~~目标top:"+targetScrollTop);
				app.animate.animate('body', {
					scrollTop: targetScrollTop
				}, 500);

			});
		},
		/**
		 * @description 初始化
		 */
		init: function() {
			var self = this;
			self.initArchiveCount();
			self.initTocActive();
		}
	};

	setTimeout(function() {
		//console.log("width:"+window.innerWidth);
		TocObj.init();
	}, 300);

})(window);