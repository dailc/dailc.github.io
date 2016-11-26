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
			app.event.bindEvent(coverFlipItem, flipCoverCallback, 'mouseenter');
			app.event.bindEvent(coverFlipItem, flipOutCallback, 'mouseleave');
		},
		/**
		 * @description 创建所有书
		 */
		createBooks: function(){
			var self = this;
			var data = {
				'readed':[{
					"cover":"https://img5.doubanio.com/lpic/s1456606.jpg",
					"href":"",
					"title":"吸血鬼",
					"titleEn":"(DRACULA)",
					"content":"故事以日记的风格展开，讲述了地产商人Jonathan Harker,与其妻子Mina,其妻子好友Lucy,热心医生 DR. Seward 以及牺牲的勇士Quincey与邪恶的吸血鬼Count Dracula之间的故事。"
				},{
					"cover":"https://img1.doubanio.com/lpic/s1034847.jpg",
					"href":"",
					"title":"少年维特的烦恼",
					"titleEn":"(THE SORROWS OF YOUNG WEATHER)",
					"content":"年轻的维特来到一个小镇，这里的自然风光、淳朴的民风、天真快乐的儿童给予他极大的快乐。一次舞会上他认识了一个叫绿蒂的少女，她的一颦一笑、一举一动都让他倾倒；绿蒂也喜欢他，却不能予以爱的回报，她已与维特好友订婚。维特陷入了尴尬和痛苦，他毅然离开此地，力图从事业上得到解脱，有所成就，然而鄙陋的环境、污浊的人际关系、压抑个性窒息自由的现存秩序，都使他无法忍受，当他怀才不遇地重返绿蒂身边时，发现绿蒂已结婚，决定以死殉情，遂用一支手枪结束了自己的生命。"
				}],
				'reading':[{
					"cover":"https://img3.doubanio.com/lpic/s3613944.jpg",
					"href":"",
					"title":"秘密花园",
					"titleEn":"THE SECRET GARDEN",
					"content":"任性而孤僻的富家小女孩玛丽因为一场突来的瘟疫变成了孤儿，被送往英国一处古老庄园里的亲戚家中收养。在幽僻宁静的乡野和淳朴的乡人中间，她的性情渐渐变得平易。一天深夜，循着神秘大宅长廊一端传来的隐隐哭声，她被带到了一个同样古怪而孤独的小生命面前。玛丽的表兄，大宅的少主人科林生来体弱，长年卧病在床，性情乖戾难测。为了帮助科林，玛丽带他进入了庄园里被关闭多年的秘密花园。孩子们在生机蓬勃的小天地里不受干扰地玩耍，学会了友爱待人，恢复了纯真快乐的天性。一个因牵涉死亡记忆而被关闭的花园，现在，因为新生命在其中焕发出的活力，被重新开启。这不能不说是自然力的秘密，生命力的奇迹。"
				}],
				'toread':[{
					"cover":"https://img3.doubanio.com/lpic/s1988674.jpg",
					"href":"",
					"title":"红与黑",
					"titleEn":"THE RED AND THE BLACK",
					"content":"小说主人公于连,是一个木匠的儿子,年轻英俊,意志坚强,精明能干,从小就希望借助个人的努力与奋斗跻身上流社会。在法国与瑞士接壤的维立叶尔城，坐落在山坡上，美丽的杜伯河绕城而过，河岸上矗立着许多锯木厂。 市长德瑞那是个出身贵族，在扣上挂满勋章的人。他五十岁左右，他的房子有全城最漂亮的花园，他的妻子是最有钱而又最漂亮的妻子，但他才智不足，“他只能办到严格地收讨他人的欠债，当他自己欠人家的债时，他愈迟还愈好”。在这座城市还有一个重要人物，是贫民寄养所所长——哇列诺先生。他花了一万到一万两千法郎才弄到这个职位，他体格强壮棕红色的脸，黑而精粗的小胡子，在别人眼中他是个美男子，连市长都惧他三分。但市长为了显示自己高人一等，决心请一个家庭教师。"
				}]
			};
			
			var createBookHtml = function(bookArray){
				var html = '';
				for(var i=0,len = bookArray.length;i<len;i++){
					var tmp = bookArray[i];
					html += '<div class="flip-container book-card">';	
					html += '<div class=" viewport-flip cover-flip-item" >';
					html += '<div class="flip-item flip  cover-flip-front ">';
					html += '<a class="demo-img" href="'+tmp.href+'">';
					html += '<img src="'+tmp.cover+'">';
					html += '</a>';
					html += '</div>	';
					
					html += '<div class="flip-item flip out cover-flip-back">';
					html += '<h3 class="demo-title">';
					html += '<a " href="'+tmp.href+'">';
					html += tmp.title;
					html += '</a>';
					html += '<p class="title-en">'+tmp.titleEn+'</p>';
					html += '</h3>';
					html += '<p>'+tmp.content+'<p>';
					html += '</div>	';
					
					html += '</div>	';
					html += '</div>	';
				}
				return html;
			};
			var readedHtml = createBookHtml(data.readed);
			var readingHtml = createBookHtml(data.reading);
			var toreadHtml = createBookHtml(data.toread);
			document.querySelector('.book-read-before').innerHTML = readedHtml;
			document.querySelector('.book-read-now').innerHTML = readingHtml;
			document.querySelector('.book-read-after').innerHTML = toreadHtml;
		},
		/**
		 * @description book页面初始化
		 */
		init: function() {
			var self = this;
			//self.createBooks();
			//jekyll里面通过模板动态生成，更自动
			//处理书籍的翻转效果
			self.dealAllFlipItem();
		}
	};

	//初始化
	book.init();
})(window);