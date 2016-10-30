---
layout: home
---

<div class="index-content blog">
    <div class="section">
        <ul class="artical-cate">
            <li class="on"><a href="/"><span> Blog</span></a></li>
            <li style="text-align:center"><a href="/project"><span>Project</span></a></li>
            <li style="text-align:right"><a href="/favour"><span>Favour</span></a></li>
        </ul>

        <div class="cate-bar"><span id="cateBar"></span></div>

        <ul class="artical-list">
        {% for post in site.categories.blog %}
            <li>
                <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
                <div class="title-desc">{{ post.description }}</div>
                
                <div class="meta"> 
                	<span class="time">
                		<time datetime="{{ post.date | date:"%Y-%m-%d" }}">{{ post.date | date:"%Y-%m-%d" }}</time>
                	</span>
                	{% if post.categories.size != 0 %}
  					| 
  					<span class="categories">
    				分类
   	 				{% for cat in post.categories %}
    				<a href="/categories/#{{ cat }}" title="{{ cat }}">{{ cat }}</a>&nbsp;
    				{% endfor %}
  					</span>
  					{% endif %}
  					{% if post.tags.size != 0 %}
  					| 
  					<span class="tags">
    				标签
    				{% for tag in post.tags %}
    				<a href="/tags/#{{ tag }}" title="{{ tag }}">{{ tag }}</a>&nbsp;
    				{% endfor %}
  					</span>
  					{% endif %}
                </div>
            </li>
        {% endfor %}
        </ul>
    </div>
    <div class="aside">
 <div class="info-card">
        <h1>DaiLc</h1>
 <a href="https://github.com/dailc" target="_blank"><img src="https://github.com/favicon.ico" alt="" width="22"/></a>
 <a href="http://weibo.com/dailichun" target="_blank"><img src="http://www.weibo.com/favicon.ico" alt="" width="25"/></a>
 <a href="http://5sing.kugou.com/54188866/default.html" target="_blank"><img src="http://5sing.kugou.com/favicon.ico" alt="" width="22"/></a>
       
      </div>
      <div id="particles-js"></div>
    </div>
</div>
