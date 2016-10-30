---
layout: home
---

<div class="index-content favour">
    <div class="section">
        <ul class="artical-cate">
            <li ><a href="/"><span> Blog</span></a></li>
            <li style="text-align:center"><a href="/project"><span>Project</span></a></li>
            <li class="on" style="text-align:right"><a href="/favour"><span>Favour</span></a></li>
        </ul>

        <div class="cate-bar"><span id="cateBar"></span></div>

        <ul class="artical-list">
        {% for post in site.categories.favour %}
            <li>
                <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
                <div class="title-desc">{{ post.description }}</div>
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
