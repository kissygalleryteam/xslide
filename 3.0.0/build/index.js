KISSY.add('kg/xslide/3.0.0/index',["kg/xscroll/3.0.0/util","kg/xscroll/3.0.0/base","kg/xscroll/3.0.0/xscroll"],function(S ,require, exports, module) {
 var Util = require('kg/xscroll/3.0.0/util');
var Base = require('kg/xscroll/3.0.0/base');
var XScroll = require('kg/xscroll/3.0.0/xscroll');
var crouselIndex = 0;

var XSlide = function(config) {
    XSlide.superclass.constructor.call(this, config);
    this.init(config);
};


Util.extend(XSlide, Base, {
    direction: "left",
    transform: function(el, attrs) {
        var prefixs = ['-webkit-', '-moz-', '-o-', ''];
        for (var i in attrs) {
            for (var j in prefixs) {
                el.style[prefixs[j] + "transform"] = i + attrs[i];
            }
        }
    },
    init: function(config) {
        var self = this;
        self.userConfig = Util.mix({
            autoRender: true,
            autoSlide: false,
            timeout: 4000,
            duration: 400,
            easing: "ease",
            adaptive:true,
            crousel:false,
            clsPrefix:"xslide-"
        }, config);
        self.renderTo = document.querySelector(config.renderTo);
        self.xscroll = new XScroll({
            renderTo: self.renderTo,
            scrollbarX: false,
            scrollbarY: false,
            lockX: false,
            lockY: true
        });
        self.itemCls = self.userConfig.clsPrefix + "item";
        self.navCls = self.userConfig.clsPrefix + "nav";
        self.navItemCls = self.userConfig.clsPrefix + "nav-item";
        self.userConfig.autoRender && self.render();
    },
    render: function() {
        var self = this;
        var config = self.userConfig;
        if (!self.renderTo) return;
        var items = self.items = self.renderTo.querySelectorAll("."+self.itemCls);
        var nav = self.nav = self.renderTo.querySelector("."+self.navCls);
        if(!nav){
           nav = document.createElement('ul');
           Util.addClass(nav,self.navCls);
           self.renderTo.appendChild(nav);
        }
        var itemNum = self.itemNum = self.items.length;
        var width = config.width || self.renderTo.offsetWidth || 300;
        var height = config.height || self.renderTo.offsetHeight || 50;
        var itemWidth = self.itemWidth = config.itemWidth || width;
        var itemHeight = config.itemHeight || height;
        var navItems;
        self.curIndex = 0;
        crouselIndex = 0;
        if (!itemNum) return;
        if (itemNum <= 2) {
            config.crousel = false;
        }
        if (!config.crousel) {
            self.xscroll.userConfig.boundryCheck = true;
        } else {
            for (var i = 0; i < itemNum; i++) {
                self.items[i].style.display = "block";
                self.items[i].style.width = itemWidth + "px";
                self.items[i].style.height = itemHeight + "px";
                self.items[i].style.position = "absolute";
            }
            self.xscroll.userConfig.boundryCheck = false;
        }
        self.xscroll.render();
        self.layWidth = self.itemNum * itemWidth;
        if (!nav.querySelectorAll("li").length || itemNum != nav.querySelectorAll("li").length) {
            var navStr = "";
            for (var i = 1; i <= self.itemNum; i++) {
                navStr += "<li class='" + self.navItemCls + "'>" + i + "</li>";
            }
            nav.innerHTML = navStr;
        }
        navItems = self.navItems = nav.querySelectorAll("li");
        self._bindEvt();
        if (self.userConfig.crousel) {
            for (var i = 0; i < itemNum; i++) {
                self.put(i, i);
            }
            self.put(itemNum - 1, -1)
        }
        self.animTo(0);
        self.userConfig.autoSlide && self.autoSlide();
    },
    pop: function(array) {
        var len = array.length;
        return array[len - 1]
    },
    getPrev: function() {
        var self = this;
        var curIndex = self.curIndex;
        return self.$items.item((curIndex - 1 + self.itemNum) % self.itemNum);
    },
    getNext: function() {
        var self = this;
        var curIndex = self.curIndex;
        return self.$items.item((curIndex + 1) % self.itemNum);
    },
    getCurrent: function() {
        var self = this;
        var curIndex = self.curIndex;
        return self.$items.item(curIndex);
    },
    getItem: function(index) {
        if (index < 0) {
            return this.$items.item(index % self.itemNum + self.itemNum);
        } else {
            return this.$items.item(index % self.itemNum);
        }
    },
    _bindEvt: function() {
        var self = this;
        if (self._isEvtBind) return;
        self._isEvtBind = true;
        var curIndex;
        var xscroll = self.xscroll;
        xscroll.mc.on("panstart", function(e) {
            self.direction = e.direction == 2 ? "left" : "right";
            self.__enableAutoSlide = false;
        });
        xscroll.mc.on("panend", function(e) {
            if (e.direction == 1) {
                self.animTo(self.judgePos());
            } else {
                var direction = self.direction = e.direction == 2 ? "left" : "right";
                if(self.userConfig.crousel){
                    curIndex = self.direction == "right" ? crouselIndex - 1 : crouselIndex + 1;
                }else{
                    curIndex = self.direction == "right" ? self.curIndex - 1 : self.curIndex + 1;
                }
                self.animTo(curIndex);
            }
            setTimeout(function() {
                self.__enableAutoSlide = true;
            }, 2000)
        });
        self.on("beforeslide", self.computePos, self);
    },
    //动画到第index个
    animTo: function(index, duration, easing, callback) {
        var self = this;
        var itemWidth = self.itemWidth;
        var itemNum = self.itemNum;
        if (self.userConfig.crousel) {
            crouselIndex = index;
        }
        if (index < 0) {
            index = 0
        } else if (index > self.itemNum - 1) {
            index = self.itemNum - 1
        }
        var offsetX = self.userConfig.crousel ? itemWidth * crouselIndex : itemWidth * index;
        self.xscroll.scrollLeft(offsetX, duration || self.userConfig.duration, easing || self.userConfig.easing, function() {
            callback && callback();
            self.trigger("afterslide", {
                curIndex: self.curIndex
            })
        });
        if (self.userConfig.crousel) {
            self.curIndex = crouselIndex % itemNum < 0 ? itemNum + crouselIndex % itemNum : (crouselIndex % itemNum);
        } else {
            self.curIndex = index
        }
        for (var i = 0; i < self.itemNum; i++) {
            Util.removeClass(self.navItems[i], "current");
            Util.removeClass(self.items[i], "current");
        }
        Util.addClass(self.navItems[self.curIndex], "current");
        Util.addClass(self.items[self.curIndex], "current");
        self.trigger("beforeslide", {
            direction: self.direction
        })
    },
    judgePos: function() {
        var self = this;
        var itemNum = self.itemNum;
        var itemWidth = self.itemWidth;
        var posX = self.xscroll.getScrollLeft();
        self.direction = posX / itemWidth - Math.floor(posX / itemWidth) >= 0.5 ? "left" : "right";
        crouselIndex = Math.round(posX / itemWidth);
        self.curIndex = crouselIndex % itemNum < 0 ? itemNum + crouselIndex % itemNum : (crouselIndex % itemNum);
        return crouselIndex;
    },
    /*
            0 => 5 0 1
            1 => 0 1 2
            4 => 3 4 5
    */
    computePos: function() {
        var self = this;
        //旋转木马
        if (self.userConfig.crousel) {
            //考虑只有1个情况
            if (self.direction == "right") {
                self.put(self.curIndex - 1, crouselIndex - 1);
            } else if (self.direction == "left") {
                self.put(self.curIndex + 1, crouselIndex + 1);
            }
        }
    },
    put: function(elIndex, offsetIndex) {
        var self = this;
        var itemNum = self.itemNum;
        var itemWidth = self.itemWidth;
        if (elIndex < 0) {
            elIndex = itemNum - 1;
        } else if (elIndex > itemNum - 1) {
            elIndex = 0;
        }
        self.transform(self.items[elIndex], {
            translateX: "(" + offsetIndex * itemWidth + "px) translateZ(0px)"
        })
    },
    autoSlide: function() {
        var self = this;
        var index = self.curIndex;
        if(self.itemNum < 2) return;
        self.__enableAutoSlide = true;
        clearInterval(self.__itv);
        self.__itv = setInterval(function() {
            if (!self.__enableAutoSlide) return;
            self.direction = "left";
            index = self.userConfig.crousel ? crouselIndex : self.curIndex;
            index++;
            if (!self.userConfig.crousel && index >= self.itemNum) {
                index = 0;
            }
            self.animTo(index);
        }, self.userConfig.timeout);
    },
    destroy: function() {
        var self = this;
        clearInteval(self.__itv);
        self.off("beforeslide", self.computePos);
        delete self;
    }

});

return XSlide;
});