;
KISSY.add(function(S, Node, Base, Drag) {
    var $ = S.all;
    var prefix = ".ks-xslide-";
    var layerCls = prefix + "layer";
    var itemCls = prefix + "item";
    var navCls = prefix + "nav";
    var navItemCls = "ks-xslide-nav-item";
    var config, itemNum, itemHeight, itemWidth, width, height, layWidth, crousel = false;
    var $renderTo, $layer, $items, $nav, $navItems;
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
            config = self.userConfig;
            $renderTo = self.$renderTo = $(config.renderTo);
            //是否旋转木马
            crousel = config.crousel;
            if (!config.renderTo || !$renderTo[0]) {
                return;
            }
            self.curIndex = 0;
            crouselIndex = 0;
            $layer = self.$layer = $(layerCls, $renderTo);
            $items = self.$items = $(itemCls, $layer);
            $nav = self.$nav = $(navCls, $renderTo);
            itemNum = self.itemNum = $items.length;
            if (!itemNum) return;
            if (itemNum <= 2) {
                //如果卡牌数小于3 关闭旋转木马
                crousel = false;
            }
            self.render();
        },
        render: function() {
            var self = this;
            width = config.width || $renderTo.width() || 30;
            height = config.height || $renderTo.height() || 30;
            itemWidth = config.itemWidth || $items.width() || width;
            itemHeight = config.itemHeight || $items.height()||height;
            //如果是旋转木马 则多2个坑
            layWidth = self.itemNum * itemWidth;
            $renderTo.css({
                "height": height + "px",
                "width": width + "px",
                "overflow": "hidden",
                "position": "relative"
            });
            $layer.css({
                "position": "absolute",
                "height": itemHeight + "px",
                "width": layWidth
            });
            self.transform($layer[0], {
                translateX: "(0px) translateZ(0px)"
            })
            $items.css({
                "display": "block",
                "width": itemWidth + "px",
                "height": itemHeight + "px",
                "position": "absolute"
            });

            if ($("li", $nav) && !$("li", $nav).length) {
                var navStr = "";
                for (var i = 1; i <= self.itemNum; i++) {
                    navStr += "<li class='" + navItemCls + "'>" + i + "</li>";
                }
                $navItems = self.$navItems = $(navStr).appendTo($nav);
            } else {
                $navItems = $("li", $nav);
            }
            self.evtBind();
            $navItems.removeClass("current").item(0).addClass("current");

            for (var i = 0; i < itemNum; i++) {
                self.put(i, i);
            }
            if (crousel) {
                self.put(itemNum - 1, -1)
            }
        },
        pop: function(array) {
            var len = array.length;
            return array[len - 1]
        },
        getPosX: function() {
            var self = this;
            return Number(window.getComputedStyle(self.$layer[0]).webkitTransform.match(/[-\d]+/g)[4]);
        },
        setPosX: function(offsetX) {
            var self = this;
            $layer[0].style.webkitTransition = "";
            self.transform($layer[0], {
                translateX: "(" + offsetX + "px) translateZ(0px)"
            });
        },
        getPrev: function() {
            var self = this;
            var curIndex = self.curIndex;
            return this.$items.item((curIndex - 1 + itemNum) % itemNum);
        },
        getNext: function() {
            var self = this;
            var curIndex = self.curIndex;
            return this.$items.item((curIndex + 1) % itemNum);
        },
        getCurrent: function() {
            var self = this;
            var curIndex = self.curIndex;
            return this.$items.item(curIndex);
        },
        getItem: function(index) {
            if (index < 0) {
                return this.$items.item(index % itemNum + itemNum);
            } else {
                return this.$items.item(index % itemNum);
            }
        },
        evtBind: function() {
            var self = this;
            var transX = 0;
            var records = [transX];
            var tmpTransX;

            $renderTo.on(Drag.DRAG_START, function(e) {
                transX = self.getPosX();
                self.fire("beforeSlide", {
                    curIndex: self.curIndex
                })
                self.set("enable", true);
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

            })

            self.on("beforeAnim", function() {
                self.computePos();
            })

            $layer[0].addEventListener("webkitTransitionEnd", function() {
                self.fire("afterSlide", {
                    curIndex: self.curIndex
                });
            }, false);

        },
        //动画到第index个
        animTo: function(index) {
            var self = this;
            if (crousel) {
                crouselIndex = index;
            }
            if (index < 0) {
                index = 0
            } else if (index > self.itemNum - 1) {
                index = self.itemNum - 1
            }
            var offsetX = crousel ? itemWidth * crouselIndex : itemWidth * index;
            var duration = 0.4;
            var easing = "ease-out";
            self.transform($layer[0], {
                translateX: "(" + (-offsetX) + "px) translateZ(0px)"
            });
            $layer[0].style.webkitTransition = "-webkit-transform " + duration + "s " + easing + " 0s";
            if (crousel) {
                self.curIndex = crouselIndex % itemNum < 0 ? itemNum + crouselIndex % itemNum : (crouselIndex % itemNum);
            } else {
                self.curIndex = index
            }

            $navItems.removeClass("current").item(self.curIndex).addClass("current");
            $items.removeClass("current").item(self.curIndex).addClass("current");
            self.fire("beforeAnim", {
                direction: self.direction
            })
        },
        getCurrentIndex:function(){
            return this.curIndex||0;
        },
        //获取非整数倍的元素应当anim的位置
        judgePos: function() {
            var self = this;
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
            var lastIndex = itemNum - 1;
            //旋转木马
            if (crousel) {
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
            if (elIndex < 0) {
                elIndex = itemNum - 1;
            } else if (elIndex > itemNum - 1) {
                elIndex = 0;
            }
            self.transform($items.item(elIndex)[0], {
                translateX: "(" + offsetIndex * itemWidth + "px) translateZ(0px)"
            })
        }

    });

    return XSlide;


}, {
    requires: ['node', 'base', './drag']
});