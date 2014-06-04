## 综述

XSlide是适用于移动设备的轮播组件，使用方便、轻巧，支持旋转木马。

* 版本：1.0
* 作者：伯才
* demo：


[default.html](../demo/default.html)

[crousel.html](../demo/crousel.html)

[multiple.html](../demo/multiple.html)

[shadow.html](../demo/shadow.html)

[autoplay.html](../demo/autoplay.html)

## 初始化组件
		
    S.use('gallery/xslide/1.0/index', function (S, XSlide) {
         var xslide = new XSlide({
         	renderTo: "#J_Slide"
         });
    })


### html 结构

```

<div id="J_Slide">
	<!-- 小圆点 -->
 	<ul class="ks-xslide-nav"></ul>  
	<!-- 选项卡容器 可以默认宽度9999px-->
     	<ul class="ks-xslide-layer">
	      <li class="ks-xslide-item current"></li>
	      <li class="ks-xslide-item"></li>
	      <li class="ks-xslide-item"></li>
	</ul>
</div>



```

## API说明

### Attribute

#### renderTo  

{ id|HTMLElement } 渲染的容器，需要设置容器的宽高

#### width

{ Number } 容器宽度

#### height

{ Number } 容器高度

#### itemWidth

{ Number } 轮播项宽度

#### itemHeight

{ Number } 容器高度

#### crousel

{ Boolean } 是否开启旋转木马

#### autoSlide

{ Boolean } 是否开启自动轮播

#### autoRender

{ Boolean } 是否自动渲染 如选择否 则需要手动调用render()方法





### Method

#### render()

渲染、更新 可以重复调用进行组件更新，如卡牌数量、内容的变更

#### animTo(index)

滚动到第index个轮播项，从0开始

#### getCurrentIndex()

获取当前的index

#### getItem(index)

获取第index个轮播项，是KISSY.Node类型

#### getCurrent()

获取当前的轮播项，是KISSY.Node类型

#### getPosX()

获取当前距左侧的offset

#### destroy()

销毁当前实例



























