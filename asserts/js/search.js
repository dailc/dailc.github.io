/**
 * 作者: dailc
 * 时间: 2016-11-20
 * 描述:  博客 搜索页面
 */
(function(win) {
	var search = {
		
		/**
		 * @description 将搜索出来的值一起显示
		 */
		createSearchItems: function(data){
			var self = this;
			
			var createItemHtml = function(array){
				var html = '';
				for(var i=0,len = array.length;i<len;i++){
					var tmp = array[i];
					var strArray = tmp.title.split('&&');
					var title = strArray[0];
					var tags = strArray[1];
					var dateTime = strArray[2];
					html += '<li class="post-list-item">';	
					html += '<span class="item-meta">';
					html += dateTime;
					html += '</span>';
					html += '<a  href="'+tmp.url+'" class="item-name">'+title+'</a>';
					html += '<span class="item-tag">'+tags+'</span>';
					html += '</li>';
				}
				return html;
			};
			var html = '';
			if(data&&Array.isArray(data)&&data.length>0){
				html = createItemHtml(data);
			}else{
				var tips = typeof data === 'string' ? data:'没有查询到数据...';
				html = tips;
			}
			
			document.querySelector('.content-container .post-list').innerHTML = html;
		},
		/**
		 * @description 隐藏顶部的搜索
		 */
		hideNavSearch:function(){
			document.querySelector('.site-search').style.display = 'none';
		},
		/**
		 * @description 监听输入框
		 * @param {Array} data 数据源
		 */
		listenerInput: function(data){
			var self = this;
			var inputDom = document.querySelector('.page-title input');
			var searchBtn = document.querySelector('.page-title .search-btn');
			app.event.bindEvent(searchBtn,function(){
				var value = inputDom.value;
				self.query(value,data);
			},'click');
			app.event.bindEvent(inputDom,function(){
				var value = inputDom.value;
				self.query(value,data);
			},'change');
			
		},
		/**
		 * @description 获取来源数据,这个数据jekyll初始化时就已经生成,用来进行全站搜索
		 * @param {Function} callback 回调函数里再进行其它操作
		 */
		getSourceData:function(callback){
			var self = this;
//			var data = [{
//				"title":"秘密花园 && 读后感-英文读本 &&2016-11-19",
//				"url":"/2016/11/19/bookReview_thesecretgarden"
//			},{
//				"title":"红与黑 && 读后感_英文读本 &&2016-11-19",
//				"url":"/2016/11/19/bookReview_theredandtheblack"
//			}];
//			
			var jsonData = appAjax.ajax('/search/search_data.json', {
			dataType: "json",
			timeout: "6000", //超时时间设置为3秒；
			type: "GET",
			success: function(response) {
				if(response&&response.code == 0){
					callback&&callback(response.data);
				}else{
					callback&&callback('获取数据出错...','获取数据出错...');
				}
			},
			error: function(error) {
				callback&&callback('获取数据出错...','获取数据出错...');
			}
		});
		},
		/**
		 * @description 获取一个item的displayText
		 * @param {JSON||String} item
		 */
		displayText: function(item){
			return item.title || item;
		},
		/**
		 * @description 根据输入的字符串，进行搜索查询
		 * @param {String} str
		 * @param {Array} data 数据源
		 */
		query: function(str,data){
			var self = this;
			if(str == null || str == '' || !data){return ;}
			str = str.replace(/&&/g,'');
			//console.log("搜索:"+str);
			var out = [];
			for(var i=0,len = data.length;i<len;i++){
				var tmpTxt = self.displayText(data[i]);
				tmpTxt.toLowerCase().indexOf(str)!==-1&&out.push(data[i]);
				if(out.length >= self.maxMatch){
					break;
				}
			}
			this.createSearchItems(out);
		},
		/**
		 * @description 处理初始化时的hash
		 * @param {Array} data 数据源
		 */
		dealHash: function(data){
			var hash = window.location.href.split('#')[1];
			if(hash){
				document.querySelector('.page-title input').value = hash;
				this.query(hash,data);
			}
		},
		/**
		 * @description book页面初始化
		 */
		init: function() {
			var self = this;
			//最多匹配的个数
			self.maxMatch = 1000;
			self.hideNavSearch();
			self.getSourceData(function(data,tips){
				document.querySelector('.content-container .post-list').innerHTML = tips ||'';
				self.listenerInput(data);
				self.dealHash(data);
			});
		}
	};

	//初始化
	search.init();
})(window);