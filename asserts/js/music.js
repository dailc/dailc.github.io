/**
 * 作者: dailc
 * 时间: 2016-11-13
 * 描述:  博客 书单页面
 */
(function(win) {
	var music = {
		/**
		 * @description 播放某首歌
		 */
		playSong: function(item) {
			var self = this;
			if(!item) {
				return;
			}
			var ap2 = new APlayer({
				element: document.querySelector('.aplayer'),
				narrow: false,
				autoplay: true,
				showlrc: false,
				music: {
					title: item.title,
					author: item.author,
					url: item.url,
					//url: 'audio/harmonica_blues_haitan_ATune.mp3',
					pic: item.pic
				},
				play: function() {
					console.log("play");
					self.switchPlayIconStatus(true, item.dom);
				},
				pause: function() {
					console.log("pause");
					self.switchPlayIconStatus(false, item.dom);

				},
				//下一首回调
				next: function() {
					console.log("下一首");
					//获取兄弟节点
					if(self.oldDom) {
						var next = app.dom.getNextElement(self.oldDom.parentNode);
						if(next&&next.innerHTML){
							console.log(next.innerHTML);
							self.playNewSongs(next.querySelector('.play-widget'));
						}
					}
				},
				//上一首回调
				pre: function() {
					console.log("上一首");
					//获取兄弟节点
					if(self.oldDom) {
						var pre = app.dom.getPreElement(self.oldDom.parentNode);
						if(pre&&pre.innerHTML){
							console.log(pre.innerHTML);
							self.playNewSongs(pre.querySelector('.play-widget'));
						}
					}
				}
			});
			self.aplayer = ap2;
			ap2.init();
		},
		/**
		 * @description 在新的dom节点播放音乐
		 * @param {HTMLElement} dom
		 */
		playNewSongs: function(dom) {
			var self = this;
			var item = {};
			item.url = dom.parentNode.getAttribute('data-music');
			item.pic = dom.parentNode.querySelector('img').getAttribute('src');
			item.title = dom.parentNode.querySelector('.title').innerText;
			item.author = dom.parentNode.querySelector('.author').innerText;
			item.dom = dom;
			if(item.url) {
				//这样才允许播放
				self.oldDom = dom;
				//否则是新的dom
				if(self.aplayer) {
					//先暂停以前的
					self.aplayer.pause();
				}
				self.playSong(item);
				//去除其它的locked,dom加上locked
				Array.prototype.forEach.call(self.playWidgets, function(el) {
					var parent = el.parentNode;
					parent.classList.remove('locked');
					//并设置为默认播放
					el.querySelector('.aplayer-play').classList.remove('aplayer-hide');
					el.querySelector('.aplayer-pause').classList.add('aplayer-hide');
				});
				self.switchPlayIconStatus(true, dom);
			}
		},
		/**
		 * @description 初始化book
		 */
		initAllItems: function() {
			var self = this;
			var playWidgets = document.querySelectorAll('.play-widget');
			self.playWidgets = playWidgets;
			app.event.bindEvent(playWidgets, function(e) {
				var playIcon = this.querySelector('.aplayer-play');
				if(playIcon.classList.contains('aplayer-hide')) {
					//如果已经播放了,现在点击的是暂停
					self.setPlayStatus(this, false);
				} else {
					self.setPlayStatus(this, true);
				}

			});
		},
		/**
		 * @description 更换悬浮播放按钮的状态
		 */
		switchPlayIconStatus: function(isPlay, dom) {
			var playIcon = dom.querySelector('.aplayer-play');
			var pauseIcon = dom.querySelector('.aplayer-pause');
			if(isPlay) {
				document.querySelector('.my-player').classList.add('locked-player');
				playIcon.classList.add('aplayer-hide');
				pauseIcon.classList.remove('aplayer-hide');
				dom.parentNode.classList.add('locked');
			} else {
				document.querySelector('.my-player').classList.remove('locked-player');
				playIcon.classList.remove('aplayer-hide');
				pauseIcon.classList.add('aplayer-hide');
				dom.parentNode.classList.remove('locked');
			}
		},
		/**
		 * @description 设置播放状态
		 * @param {HTMLElement} dom,是playwidget这个dom
		 * @param {Boolean} 是否play
		 */
		setPlayStatus: function(dom, isPlay) {
			var self = this;
			if(!isPlay) {
				//暂停
				self.switchPlayIconStatus(false, dom);
				if(self.aplayer) {
					//如果已经存在player
					self.aplayer.pause();
				}
			} else {
				//播放
				//其它的去除locked
				if(self.oldDom === dom) {
					//如果是以前播放的dom和当前一样
					//直接接着播放
					if(self.aplayer) {
						self.aplayer.play();
					}
				} else {
					console.log("新播放");
					self.playNewSongs(dom);

				}
				self.switchPlayIconStatus(true, dom);
			}

		},
		/**
		 * @description 创建音乐item
		 */
		createMusicItems: function(){
			var data = [{
				"src":'http://115.29.151.25:8012/music/harmonica_blues_haitan_ATune.mp3',
				"pic":'http://p4.music.126.net/mvOIUyknh0SjF7D56QKEwg==/5693271208664177.jpg?param=280y280',
				"title":"海滩【蓝调口琴A调】",
				"author":"dailc",
				"content":"学习口琴后录制的第一首曲子，手机唱吧录制,当初就是被这首曲子所打动，坚定了学口琴的念头。"
			},{
				"src":'http://115.29.151.25:8012/music/harmonica_blues_gengtidesiji_ATune.mp3',
				"pic":'http://p4.music.126.net/mvOIUyknh0SjF7D56QKEwg==/5693271208664177.jpg?param=280y280',
				"title":"更替的四季【蓝调口琴A调】",
				"author":"dailc",
				"content":"很喜欢这首曲子，于是就试着录了它，可行录制时学艺未精，仍然有瑕疵。"
			}];
			var createItems = function(musicArray){
				var html = '';
				for(var i=0,len = musicArray.length;i<len;i++){
					var tmp = musicArray[i];
					html += '<div class="music-card" data-music="';
					html += tmp.src;
					html += '">';
					html += '<img class="pic" src="';
					html += tmp.pic;
					html += '" />';
					html += '<div class="member-info">';
					html += '<span class="title">'+tmp.title+'</span>';
					html += '<span class="author">'+tmp.author+'</span>';
					html += '<p>';
					html += tmp.content;
					html += '</p>';
					html += '</div>';
					html += '<div class="play-widget aplayer-container"><div class="circle2 aplayer-play "><div class="play "></div></div><div class="circle2 aplayer-pause aplayer-hide"><div class=" pause"><div class="pause1"></div><div class="pause2"></div></div></div></div>';
					
					html += '</div>'; 
				}
				return html;
			};
			var html = createItems(data);
			document.querySelector('.content-container ').innerHTML = html;
		},
		/**
		 * @description book页面初始化
		 */
		init: function() {
			var self = this;
			//jekyll里动态生成
			//self.createMusicItems();
			self.initAllItems();
		}
	};

	//初始化
	music.init();
})(window);