/**
 * @fileoverview
 * @author 伯才<xiaoqi.huxq@alibaba-inc.com>
 * @module xslide 1.0
 **/
KISSY.add("gallery/xslide/1.0/index",function(S, Node, Base, Drag) {
    var $ = S.all;
    var prefix = ".ks-xslide-";
    var layerCls = prefix + "layer";
    var itemCls = prefix + "item";
    var navCls = prefix + "nav";
    var navItemCls = "ks-xslide-nav-item";
    var crouselIndex = 0;
    var MIN_VELOCITY = 0.2;
    var MIN_DELTAX = 5;
    var XSlide = Base.extend({
        transform: function(el, attrs) {
            var prefixs = ['-webkit-', '-moz-', '-o-', ''];

            for (var i in attrs) {
                for (var j in prefixs) {
                    el.style[prefixs[j] + "transform"] = i + attrs[i];
                }
            }
        },
        initializer: function() {
            var self = this;
            self.userConfig = S.mix({
                autoRender: true,
                autoSlide: false,
                timeOut: 5000
            }, self.userConfig, undefined, undefined, true);
            self.userConfig.autoRender && self.render();
        },
        render: function() {
            var self = this;
            var config = self.userConfig;
            var $renderTo = self.$renderTo = $(config.renderTo);
            if (!config.renderTo || !$renderTo[0]) {
                return;
            }
            var $layer = self.$layer = $(layerCls, $renderTo);
            var $items = self.$items = $(itemCls, $layer);
            var $nav = self.$nav = $(navCls, $renderTo);
            var itemNum = self.itemNum = $items.length;
            var width = config.width || $renderTo.width() || 300;
            var height = config.height || $renderTo.height() || 50;
            var itemWidth = self.itemWidth = config.itemWidth || width;
            var itemHeight = config.itemHeight || height;
            var $navItems;

            self.curIndex = 0;
            crouselIndex = 0;

            if (!itemNum) return;
            if (itemNum <= 2) {
                config.crousel = false;
            }

            //如果是旋转木马 则多2个坑
            self.layWidth = self.itemNum * itemWidth;
            $renderTo.css({
                "height": height + "px",
                "width": width + "px",
                "overflow": "hidden",
                "position": "relative"
            });
            $layer.css({
                "position": "absolute",
                "height": itemHeight + "px",
                "width": self.layWidth
            });
            self.transform($layer[0], {
                translateX: "(0px) translateZ(2px)"
            })
            $items.css({
                "display": "block",
                "width": itemWidth + "px",
                "height": itemHeight + "px",
                "position": "absolute"
            });

            if (!$("li", $nav).length || itemNum != $("li", $nav).length) {
                var navStr = "";
                for (var i = 1; i <= self.itemNum; i++) {
                    navStr += "<li class='" + navItemCls + "'>" + i + "</li>";
                }
                $nav.html("");
                $navItems = self.$navItems = $(navStr).appendTo($nav);
            } else {
                $navItems = self.$navItems = $("li", $nav);
            }
            self.evtBind();

            $navItems.removeClass("current").item(0).addClass("current");
            for (var i = 0; i < itemNum; i++) {
                self.put(i, i);
            }
            if (self.userConfig.crousel) {
                self.put(itemNum - 1, -1)
            }

            self.userConfig.autoSlide && self.autoSlide();
        },
        pop: function(array) {
            var len = array.length;
            return array[len - 1]
        },
        getPosX: function() {
            var self = this;
            return Number(self.$layer[0].style.webkitTransform.match(/translateX\(-*\d*px\)/)[0].match(/-*\d*px/)[0].replace(/px/,""));
        },
        setPosX: function(offsetX) {
            var self = this;
            self.$layer[0].style.webkitTransition = "";
            self.transform(self.$layer[0], {
                translateX: "(" + offsetX + "px) translateZ(2px)"
            });
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
        evtBind: function() {
            var self = this;

            if (self._isEvtBind) return;

            var transX = 0;
            var records = [transX];
            var tmpTransX;
            var $renderTo = self.$renderTo;
            var $layer = self.$layer;
            var $items = self.$items;
            var $nav = self.$nav;
            var $navItems = self.$navItems;
            $renderTo.on(Drag.DRAG_START, function(e) {
                transX = self.getPosX();
                self.fire("beforeSlide", {
                    curIndex: self.curIndex
                })
                self.set("enable", true);
                self.__autoSlideOn = false;
            }).on(Drag.DRAG, function(e) {
                if (self.get("enable") == false) return;
                if (Math.abs(e.deltaX) > MIN_DELTAX || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                    //kissy mini 阻止不掉。。。
                    e.preventDefault();
                    e.stopPropagation();
                    self.judgePos();
                    tmpTransX = self.pop(records);
                    records.push(transX + e.deltaX);
                    self.setPosX(transX + e.deltaX)
                    if (tmpTransX > transX + e.deltaX) {
                        self.direction = "left";
                    } else {
                        self.direction = "right";
                    }
                    self.computePos();
                    //触发slide的过程事件
                    self.fire("slide", {
                        direction: self.direction
                    })
                } else {
                    //不可用
                    self.set("enable", false);
                }
            }).on(Drag.DRAG_END, function(e) {
                if (Math.abs(e.velocityX) < MIN_VELOCITY) {
                    self.animTo(self.judgePos());
                } else {
                    var direction = e.velocityX > 0 ? "right" : "left";
                    var curIndex = direction == "right" ? crouselIndex - 1 : crouselIndex + 1;
                    self.direction = direction;
                    self.animTo(curIndex);
                }

                setTimeout(function(){
                    self.__autoSlideOn = true;
                },2000)

            })

            self.on("beforeAnim", function() {
                self.computePos();
            })

            $layer[0].addEventListener("webkitTransitionEnd", function() {
                self.fire("afterSlide", {
                    curIndex: self.curIndex
                });
            }, false);

            self._isEvtBind = true;

        },
        //动画到第index个
        animTo: function(index) {
            var self = this;
            var $renderTo = self.$renderTo;
            var $layer = self.$layer;
            var $items = self.$items;
            var $nav = self.$nav;
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
            var duration = 0.4;
            var easing = "ease-out";
            self.transform($layer[0], {
                translateX: "(" + (-offsetX) + "px) translateZ(2px)"
            });
            $layer[0].style.webkitTransition = "-webkit-transform " + duration + "s " + easing + " 0s";
            if (self.userConfig.crousel) {
                self.curIndex = crouselIndex % itemNum < 0 ? itemNum + crouselIndex % itemNum : (crouselIndex % itemNum);
            } else {
                self.curIndex = index
            }
            self.$navItems.removeClass("current").item(self.curIndex).addClass("current");
            $items.removeClass("current").item(self.curIndex).addClass("current");
            self.fire("beforeAnim", {
                direction: self.direction
            })
        },
        //获取非整数倍的元素应当anim的位置
        judgePos: function() {
            var self = this;
            var itemNum = self.itemNum;
            var itemWidth = self.itemWidth;
            var posX = self.getPosX();
            self.direction = -posX / itemWidth - Math.floor(-posX / itemWidth) >= 0.5 ? "left" : "right";
            crouselIndex = Math.round(-posX / itemWidth);
            self.curIndex = crouselIndex % itemNum < 0 ? itemNum + crouselIndex % itemNum : (crouselIndex % itemNum);
            return crouselIndex;
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
            self.transform(self.$items.item(elIndex)[0], {
                translateX: "(" + offsetIndex * itemWidth + "px) translateZ(2px)"
            })
        },
        autoSlide: function() {
            var self = this;
            var index = self.curIndex;
            //开启动画
            self.__autoSlideOn = true;
            self.direction = "left";
            clearInterval(self.__autoSlideItv);
            self.__autoSlideItv = setInterval(function() {
                if(!self.__autoSlideOn) return;
                index = self.userConfig.crousel ? crouselIndex: self.curIndex;
                index++;
                if (!self.userConfig.crousel && index >= self.itemNum) {
                    index = 0;
                }
                self.animTo(index);
            }, self.userConfig.timeOut);
        },
        destroy: function() {
            var self = this;
            clearInteval(self.__autoSlideItv);
            self.$renderTo.detach(Drag.DRAG_START);
            self.$renderTo.detach(Drag.DRAG);
            self.$renderTo.detach(Drag.DRAG_END)
            self.detach("beforeAnim", function() {
                self.computePos();
            })
            self.$layer[0].removeEventListener("webkitTransitionEnd");
            self.$renderTo.html("");
            delete self;
        }

    });

    return XSlide;


}, {
    requires: ['node', 'base', "./drag"]
});