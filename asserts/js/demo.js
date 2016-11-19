/**
 * 作者: dailc
 * 时间: 2016-11-12
 * 描述:  博客 demo页面
 */
(function(win) {
	var demo = {
		/**
		 * @description 初始化网格布局
		 */
		initGrid: function() {
			//记录添加的数据
			var index = 0;
			//如果需要适配手机端，可以修改宽度
			var flow = new WaterfallFlow.flow('.grid-container', {
				gridSelector: '.grid',
				itemSelector: '.grid-item',
				columnWidth: 240,
				gutter: 20,
				loadSuccess: function(self, isInit) {
					//console.log("success");
					if(isInit) {
						//self.load('<div class="grid-item"><a class="demo-img"href="{{demoLink}}"><img src="{{imgLink}}"></a><h3 class="demo-title"><a href="{{demoLink}}">{{title}}</a></h3><p>技术分类：{{relevant}}</p><p>{{description}}<a href="{{codeLink}}">&nbsp;&nbsp;源代码&nbsp;&nbsp;<i class="icon icon-code"></i></a></p></div>'); //可以单独添加item
					} else {
						//比如加载更多时单独添加进入的元素添加完毕
					}
				}
			});
			return flow;
		},
		/**
		 * @description 通过content生成html
		 * @param {Array} content
		 */
		getHtmlByContent: function(content) {
			var html = '';
			var litemplate =
				'<div class="grid-item"><a class="demo-img"href="{{demoLink}}"><img src="{{imgLink}}"></a><h3 class="demo-title"><a href="{{demoLink}}">{{title}}</a></h3><p>技术分类：{{relevant}}</p><p>{{description}}<a href="{{codeLink}}">&nbsp;&nbsp;源代码&nbsp;&nbsp;<i class="icon icon-code"></i></a></p></div>';
			for(var i = 0, len = content.length; i < len; i++) {
				var tmp = content[i];
				html += litemplate.replace(/\{\{demoLink\}\}/g, tmp.demoLink)
					.replace(/\{\{imgLink\}\}/g, tmp.imgLink)
					.replace(/\{\{codeLink\}\}/g, tmp.codeLink)
					.replace(/\{\{relevant\}\}/g, tmp.relevant)
					.replace(/\{\{title\}\}/g, tmp.title)
					.replace(/\{\{description\}\}/g, tmp.description);
			}
			return html;
		},
		/**
		 * @description 创建所有的item
		 */
		createAllItems: function() {
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
			var html = this.getHtmlByContent(demoContent);
			var grid = document.querySelector('.grid');
			//注意，初始化添加的item 请控制它的高度
			//有一种情况是item的高是与宽适应的，而初始化宽为100%，导致高度很高
			//所以在计算时，初始化的高度会变得不正确，这时候就需要自己去css中手动将宽度设置为传入的一致，避免误差
			grid.innerHTML = html;
			
		},
		/**
		 * @description demo页面初始化
		 */
		init: function() {
			//jekyll里动态生成
			//this.createAllItems();
			//初始化
			var flow = this.initGrid();
			//如果单独的load可以参考  initGrid里的代码  flow.load()即可添加,注意selector请和class保持一致
		}
	};

	//初始化
	demo.init();
})(window);