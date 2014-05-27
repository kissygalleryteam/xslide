## 综述

Xlist是基于html5的无尽下拉列表实现

* 版本：1.0
* 作者：伯才
* demo：


[default.html](../demo/default.html)

[crousel.html](../demo/crousel.html)

[multiple.html](../demo/multiple.html)

[shadow.html](../demo/shadow.html)

## 初始化组件
		
    S.use('gallery/xlist/1.0/index', function (S, XSlide) {
         var xslide = new XSlide({
         	renderTo: "#J_Slide"
         });
    })


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



### Method

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



























