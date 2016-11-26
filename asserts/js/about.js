/**
 * 作者: dailc
 * 时间: 2016-11-06
 * 描述:  about页面
 */
(function(win) {
	//处理所有的flip
	var dealAllFlipItem = function() {
		var flipCallback = function(e) {
			var self = this;
			
			if(!self.classList.contains('out')){
				
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
			if(!self.classList.contains('cover-back')){
				flipCallback.call(self,e);
			}
		};
		//鼠标离开上去的方法
		var flipOutCallback = function(e) {
			var self = this;
			flipCallback.call(self,e);
			
		};
		var flipItems = document.querySelectorAll('.flip-item');
		app.event.bindEvent(flipItems, flipCallback);
		var coverFlipItem = document.querySelectorAll('.cover-flip-item');
		app.event.bindEvent(coverFlipItem, flipCoverCallback, 'mouseenter');
		app.event.bindEvent(coverFlipItem, flipOutCallback, 'mouseleave');
	};
	
	setTimeout(function(){
		dealAllFlipItem();
	},300);
	
	
	//document.querySelector('.title-container').addEventListener('mouseleave')
})(window);