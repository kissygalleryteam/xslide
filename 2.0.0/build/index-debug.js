define('kg/xslide/2.0.0/index',["kg/xscroll/2.3.0/base","kg/xscroll/2.3.0/util","kg/xscroll/2.3.0/event","kg/xscroll/2.3.0/core"],function(require, exports, module) {
/**
 * @fileoverview
 * @author 伯才<xiaoqi.huxq@alibaba-inc.com>
 * @module xslide
 **/
var Base = require('kg/xscroll/2.3.0/base');
var Util = require('kg/xscroll/2.3.0/util');
var Event = require('kg/xscroll/2.3.0/event');
var XScroll = require('kg/xscroll/2.3.0/core');

var prefix = ".xslide-";
var layerCls = prefix + "layer";
var itemCls = prefix + "item";
var navCls = prefix + "nav";
var navItemCls = "xslide-nav-item";
var crouselIndex = 0;
var transform = Util.prefixStyle("transform");

 var XSlide = function(cfg) {
        XSlide.superclass.constructor.call(this,cfg);
    };

 Util.extend(XSlide, XScroll, {
    init: function(cfg) {
        var self = this;
        XSlide.superclass.init.call(this);
        self.userConfig = Util.mix(self.userConfig,{
            autoRender: true,
            autoSlide: false,
            timeOut: 5000,
            lockY:true,
            snap:true,
            scrollbarX:false,
            scrollbarY:false,
            autoSlide:true
        });
        self.userConfig.autoRender && self.render();
    },
    render: function() {
        var self = this;
        var config = self.userConfig;
        var renderTo = self.renderTo = document.querySelector(config.renderTo);
        var items = self.items = renderTo.querySelectorAll(itemCls);
        var nav = self.nav = renderTo.querySelector(navCls);
        var itemNum = self.itemNum = items.length;
        var width = config.width || renderTo.offsetWidth || 300;
        var height = config.height || renderTo.offsetHeight || 50;
        var itemWidth = self.itemWidth = config.itemWidth || width;
        var itemHeight = config.itemHeight || height;
        var navItems;
        self.curIndex = 0;
        crouselIndex = 0;

        if (!itemNum) return;
        if (itemNum <= 2) {
            config.crousel = false;
        }

        config.snapWidth = itemWidth;
        config.snapColsNum = itemNum;
        config.containerWidth = self.itemNum * itemWidth;
        config.snapHeight = itemHeight;

        XSlide.superclass.render.call(this);

        if (!nav.querySelectorAll("li").length || itemNum != nav.querySelectorAll("li").length) {
            var navStr = "";
            for (var i = 1; i <= self.itemNum; i++) {
                navStr += "<li class='" + navItemCls + "'>" + i + "</li>";
            }
            nav.innerHTML = navStr;
            navItems = self.navItems = nav.querySelectorAll("li");
        } else {
            navItems = self.navItems = nav.querySelectorAll("li");
        }
        // for(var i =0;i<navItems.length;i++){
        //     Util.removeClass(navItems[i],"current");
        // }
        // Util.addClass(navItems[0],"current");
        // for (var i = 0; i < itemNum; i++) {
        //     self.put(i, i);
        // }
        // if (self.userConfig.crousel) {
        //     self.put(itemNum - 1, -1)
        // }

        self.userConfig.autoSlide && self.autoSlide();

        self.switchTo(0);

    },
    _bindEvt:function(){
        XSlide.superclass._bindEvt.call(this);
        var self = this;
        self.on("scrollend",function(e){
             for(var i =0;i<self.navItems.length;i++){
                Util.removeClass(self.navItems[i],"current");
            }
            self.curIndex = self.snapColIndex;
            Util.addClass(self.navItems[self.curIndex],"current");
        })
    },
    pop: function(array) {
        var len = array.length;
        return array[len - 1]
    },
    getPrev: function() {
        var self = this;
        var curIndex = self.curIndex;
        return self.items.item((curIndex - 1 + self.itemNum) % self.itemNum);
    },
    getNext: function() {
        var self = this;
        var curIndex = self.curIndex;
        return self.items.item((curIndex + 1) % self.itemNum);
    },
    getCurrent: function() {
        var self = this;
        var curIndex = self.curIndex;
        return self.items.item(curIndex);
    },
    getItem: function(index) {
        if (index < 0) {
            return this.items.item(index % self.itemNum + self.itemNum);
        } else {
            return this.items.item(index % self.itemNum);
        }
    },

    //动画到第index个
    switchTo: function(index,duration,easing,callback) {
        this.snapTo(index,0,duration,easing,callback);
    },
    //旋转木马位置
    /*
                    0 => 5 0 1
                    1 => 0 1 2
                    4 => 3 4 5
            */
    computePos: function() {
        var self = this;

        var curIndex = self.curIndex;
        //最后一个索引
        var lastIndex = self.itemNum - 1;
        //旋转木马
        if (self.userConfig.crousel) {
            //考虑只有1个情况
            if (self.direction == "right") {
                self.put(curIndex - 1, crouselIndex - 1);
            } else if (self.direction == "left") {
                self.put(curIndex + 1, crouselIndex + 1);
            }
        }
    },
    //放置元素至指定位置
    put: function(elIndex, offsetIndex) {
        var self = this;
        var itemNum = self.itemNum;
        var itemWidth = self.itemWidth;
        if (elIndex < 0) {
            elIndex = itemNum - 1;
        } else if (elIndex > itemNum - 1) {
            elIndex = 0;
        }
        self.items[elIndex].style.position = "absolute";
        self.items[elIndex].style[transform] = "translateX(" + offsetIndex * itemWidth + "px)";
    },
    autoSlide: function() {
        var self = this;
        var index = self.curIndex;
        //开启动画
        self.__autoSlideOn = true;
        self.direction = "left";
        clearInterval(self.__autoSlideItv);
        self.__autoSlideItv = setInterval(function() {
            if (!self.__autoSlideOn) return;
            index = self.userConfig.crousel ? crouselIndex : self.curIndex;
            index++;
            if (!self.userConfig.crousel && index >= self.itemNum) {
                index = 0;
            }
            self.switchTo(index);
        }, self.userConfig.timeOut);
    }

});

module.exports = XSlide;
});