/**
 * 作者: dailc
 * 时间: 2016-11-01
 * 描述:  动态生成文章右侧TOC 仿照bootstrap的思路写
 * 但是基于原生代码，不考虑ie兼容，只在pc端生成
 */
(function(win) {

	//toc对象
	var TocObj = {
		/**
		 * @description 初始化toc的头部
		 * @return {JSON} 返回{h2:'',h3:''}
		 */
		initHeaders: function() {
			var self = this;
			var titleArray = document.querySelector('.markdown-body').querySelectorAll('h2,h3');
			var h2 = [],
				h3 = [];
			var h2Index = 0,
				h3Index = 0;
			self.allHeaders = titleArray;
			app.common.each(titleArray, function(index, item) {
				var self = this;
				//console.log(index + ',' + item);
				//console.log("遍历:"+self.tagName);
				var tmpId = '';
				if(self.tagName.toLocaleLowerCase() === 'h2') {
					h2Index++;
					//每次读到h2, h3的index就为0了
					h3Index = 0;
					tmpId = 'section-' + h2Index;
					h2.push({
						name: self.innerText,
						id: tmpId
					});
				} else if(self.tagName.toLocaleLowerCase() === 'h3') {
					h3Index++;
					tmpId = 'section-' + h2Index + '-' + h3Index;
					//这个是用来标记的
					if(!h3[h2Index - 1]) {
						h3[h2Index - 1] = [];
					}
					h3[h2Index - 1].push({
						name: self.innerText,
						id: tmpId
					});
				}
				self.id = tmpId;
			});
			return {
				h2: h2,
				h3: h3
			}
		},
		/**
		 * @description 获得Toc模板
		 * @return {JSON} 返回对应的html
		 */
		getNavTmpl: function() {
			var self = this;
			var heading = self.initHeaders();
			var h2 = heading.h2;
			var h3 = heading.h3;

			var tmpl = '<ul class="toc-sidenav">';

			for(var i = 0; i < h2.length; i++) {
				tmpl += '<li class="h2 toc-menu"><a href="#' + h2[i].id + '" data-id="' + h2[i].id + '">' + h2[i].name + '</a></li>';
				if(h3[i]) {
					for(var j = 0; j < h3[i].length; j++) {
						tmpl += '<li class="h3  toc-menu"><a href="#' + h3[i][j].id + '" data-id="' + h3[i][j].id + '">' + h3[i][j].name + '</a></li>';
					}
				}
			}
			tmpl += '</ul>';
			tmpl += '<a class="back-to-top" href="#top">返回顶部</a>';
			return tmpl;
		},
		/**
		 * @description 获得所有headers的scrolltop
		 */
		getScrollTop: function() {
			var self = this;
			//记录所有的目标title的scrolltop,然后每次滚动时根据这查询当前激活项
			var scrollTopArray = [];
			var tocArray = document.querySelector('.toc-sidenav').querySelectorAll('.h2,.h3');
			app.common.each(tocArray, function(index, item) {
				var self = this;
				var scrollTop = app.offset.getTop('#' + this.querySelector('a').getAttribute('data-id'));
				scrollTopArray.push(scrollTop);
			});
			//记录scrolltop
			self.targetScrollTop = scrollTopArray;
			self.allTocs = tocArray;
		},
		/**
		 * @description 处理a标签，使其新页面打开
		 */
		dealATag: function() {
			var links = document.links;
			for(var i = 0, linksLength = links.length; i < linksLength; i++) {
				if(links[i].getAttribute('href')&&links[i].hostname != window.location.hostname) {
					links[i].target = '_blank';
				}
			}
		},
		/**
		 * @description c初始化Toc模板
		 * @param {String||HTMLElement} dom对象,id或者是dom
		 */
		initToc: function(dom) {
			var self = this;
			var result = self.getNavTmpl();
			if(typeof dom === 'string') {
				dom = document.querySelector(dom);
			}
			dom.innerHTML = result;
			//存储当前右侧面板的对象
			self.tocSidenav = dom;
			self.getScrollTop();
			self.tocSidenavWith = self.tocSidenav.offsetWidth;
			TocObj.tocSidenav.style.width = self.tocSidenavWith + 'px';
			TocObj.tocSidenav.style.overflow = 'auto';
			TocObj.tocSidenav.style.maxHeight = app.dimensions.getWinHeight() + 'px';
			self.dealATag();
			//console.log("self.targetScrollTop:"+JSON.stringify(self.targetScrollTop));
			//监听
			app.event.bindEvent('.toc-menu,.back-to-top', function(e) {
				//阻止默认的跳转，改成用自定义跳转
				e.preventDefault();
				//console.log(this.innerHTML);
				if(this.classList.contains('back-to-top')) {
					app.animate.animate('body', {
						scrollTop: 0
					}, 500);
				} else {
					//获得当前菜单对应的title的id
					var selector = this.querySelector('a').getAttribute('data-id');
					var targetScrollTop = app.offset.getTop('#' + selector);
					//document.body.scrollTop = targetScrollTop -30;
					console.log("~~~目标top:"+targetScrollTop);
					app.animate.animate('body', {
						scrollTop: targetScrollTop
					}, 500);
				}

			});
		},
	};
	TocObj.initToc('.slideNavContainer');

	var originSidenavTop = app.offset.getTop(TocObj.tocSidenav);
	var finalHeaderTop = app.offset.getTop(TocObj.allHeaders[TocObj.allHeaders.length - 1]);
	document.addEventListener('scroll', function() {
		var tmpTop = app.dimensions.getScrollTop();
		//当前激活的选项
		var index = 0;
		var scrollTop = TocObj.targetScrollTop;
		for(var i = 0, len = scrollTop.length; i < len; i++) {
			if(tmpTop <= scrollTop[i]) {
				index = i;
				break;
			} else if(i === len - 1) {
				index = len - 1;
			}
		}
		var currActiveToc = TocObj.allTocs[index];
		for(var i = 0, len = TocObj.allTocs.length; i < len; i++) {
			TocObj.allTocs[i].classList.remove('active');
		}
		currActiveToc.classList.add('active');
		var currActiveTocTop = app.offset.getTop(currActiveToc) + 40;

		if(tmpTop > originSidenavTop + 40) {

			if(currActiveTocTop + TocObj.tocSidenav.scrollTop > app.dimensions.getWinHeight()) {
				//console.log("大于window");
				if(tmpTop + app.dimensions.getWinHeight() > finalHeaderTop) {
					//如果已经最后一个标题的 scrolltop
					TocObj.tocSidenav.style.position = 'absolute';
					TocObj.tocSidenav.style.top = (finalHeaderTop - app.dimensions.getWinHeight()) + 'px';
				} else {
					//否则
					TocObj.tocSidenav.style.position = 'fixed';
					TocObj.tocSidenav.style.top = '0px';

					//如果右侧已经到底了
					//并且控制右侧div内部的scrolltop
					TocObj.tocSidenav.scrollTop += 10;
					//console.log("currActiveTocTop:"+currActiveTocTop+',scrolltop:'+tmpTop);
				}

			} else {
				TocObj.tocSidenav.style.position = 'fixed';
				TocObj.tocSidenav.style.top = '0px';
				//如果右侧已经到头了
				//并且控制右侧div内部的scrolltop
				TocObj.tocSidenav.scrollTop -= 10;
			}
		} else {
			TocObj.tocSidenav.style.position = 'static';
		}
		//console.log("top:"+tmpTop+',finalTop:'+finalHeaderTop+',currTocTop:'+currActiveTocTop+',winHeight:'+app.dimensions.getWinHeight());
		//console.log("当前激活:"+currActiveToc.innerHTML);
	});
})(window);