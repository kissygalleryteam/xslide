## 综述

XSlide是适用于移动设备的轮播组件，使用方便、轻巧，支持旋转木马。

* 版本：3.0.0
* 作者：伯才
* demo：


[默认](../demo/default.html)

[旋转木马](../demo/crousel.html)

[复合使用](../demo/multiple.html)

[自动播放](../demo/autoslide.html)

[结合xscroll缩放预览图](../demo/zoom.html)

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

#### duration

{ Number } 自动播放的周期 单位ms




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





























