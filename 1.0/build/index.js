/*
combined files : 

gallery/xslide/1.0/drag
gallery/xslide/1.0/index

*/
/*
	Drag Event for KISSY MINI 
	@author xiaoqi.huxq@alibaba-inc.com
*/
KISSY.add('gallery/xslide/1.0/drag',function(S, Node,Event) {
	var doc = window.document;
	var DRAG_START = 'gestureDragStart',
		DRAG_END = 'gestureDragEnd',
		DRAG = 'gestureDrag',
		MIN_SPEED = 0.35,
		MAX_SPEED = 8;
	var singleTouching = false;
	var $ = S.all;
	var touch = {}, record = [];
	var startX = 0;
	var startY = 0;

	function touchStartHandler(e) {
		if (e.changedTouches.length > 1) {
			singleTouching = true;
			return;
		}
		record = [];
		touch = {};
		touch.startX = e.touches[0].clientX;
		touch.startY = e.touches[0].clientY;
		touch.deltaX = 0;
		touch.deltaY = 0;
		e.touch = touch;
		record.push({
			deltaX: touch.deltaX,
			deltaY: touch.deltaY,
			timeStamp: e.timeStamp
		});
		//be same to kissy
		e.deltaX = touch.deltaX;
		e.deltaY = touch.deltaY;
		$(e.target).fire(DRAG_START,e);
	}


	function touchMoveHandler(e) {
		if (e.changedTouches.length > 1) return;
		if (!record.length) {
			touch = {};
			touch.startX = e.touches[0].clientX;
			touch.startY = e.touches[0].clientY;
			touch.deltaX = 0;
			touch.deltaY = 0;
			e.touch = touch;
			record.push({
				deltaX: touch.deltaX,
				deltaY: touch.deltaY,
				timeStamp: e.timeStamp
			});
			//be same to kissy
			e.deltaX = touch.deltaX;
			e.deltaY = touch.deltaY;
			$(e.target).fire(DRAG_START, e);
		} else {
			touch.deltaX = e.touches[0].clientX - touch.startX;
			touch.deltaY = e.touches[0].clientY - touch.startY;
			e.touch = touch;
			record.push({
				deltaX: touch.deltaX,
				deltaY: touch.deltaY,
				timeStamp: e.timeStamp
			});
			//be same to kissy
			e.deltaX = touch.deltaX;
			e.deltaY = touch.deltaY;
			e.velocityX = 0;
			e.velocityY = 0;
			if (!e.isPropagationStopped()) {
				$(e.target).fire(DRAG, e);
			}
		}


	}

	function touchEndHandler(e) {
		var flickStartIndex = 0,
			flickStartYIndex = 0,
			flickStartXIndex = 0;
		if (e.changedTouches.length > 1) return;
		touch.deltaX = e.changedTouches[0].clientX - touch.startX;
		touch.deltaY = e.changedTouches[0].clientY - touch.startY;
		//be same to kissy
		e.deltaX = touch.deltaX;
		e.deltaY = touch.deltaY;

		e.touch = touch;
		e.touch.record = record;
		var startX = e.touch.startX;
		var startY = e.touch.startY;
		var len = record.length;
		var startTime = record[0] && record[0]['timeStamp'];
		if (len < 2 || !startTime) return;
		var duration = record[len - 1]['timeStamp'] - record[0]['timeStamp'];
		for (var i in record) {
			if (i > 0) {
				//速度 标量
				record[i]['velocity'] = distance(record[i]['deltaX'], record[i]['deltaY'], record[i - 1]['deltaX'], record[i - 1]['deltaY']) / (record[i]['timeStamp'] - record[i - 1]['timeStamp'])
				//水平速度 矢量
				record[i]['velocityX'] = (record[i]['deltaX'] - record[i - 1]['deltaX']) / (record[i]['timeStamp'] - record[i - 1]['timeStamp'])
				//垂直速度 矢量
				record[i]['velocityY'] = (record[i]['deltaY'] - record[i - 1]['deltaY']) / (record[i]['timeStamp'] - record[i - 1]['timeStamp'])
			} else {
				record[i]['velocity'] = 0;
				record[i]['velocityX'] = 0;
				record[i]['velocityY'] = 0;
			}
		}
		//第一个速度的矢量方向
		var flagX = record[0]['velocityX'] / Math.abs(record[0]['velocityX']);
		for (var i in record) {
			//计算正负极性
			if (record[i]['velocityX'] / Math.abs(record[i]['velocityX']) != flagX) {
				flagX = record[i]['velocityX'] / Math.abs(record[i]['velocityX']);
				//如果方向发生变化 则新起点
				flickStartXIndex = i;
			}
		}

		//第一个速度的矢量方向
		var flagY = record[0]['velocityY'] / Math.abs(record[0]['velocityY']);
		for (var i in record) {
			//计算正负极性
			if (record[i]['velocityY'] / Math.abs(record[i]['velocityY']) != flagY) {
				flagY = record[i]['velocityY'] / Math.abs(record[i]['velocityY']);
				//如果方向发生变化 则新起点
				flickStartYIndex = i;
			}
		}

		flickStartIndex = Math.max(flickStartXIndex, flickStartYIndex);
		//起点
		var flickStartRecord = record[flickStartIndex];
		//移除前面没有用的点
		e.touch.record = e.touch.record.splice(flickStartIndex - 1);
		var velocityObj = getSpeed(e.touch.record);
		e.velocityX = Math.abs(velocityObj.velocityX) > MAX_SPEED ? velocityObj.velocityX / Math.abs(velocityObj.velocityX) * MAX_SPEED : velocityObj.velocityX;
		e.velocityY = Math.abs(velocityObj.velocityY) > MAX_SPEED ? velocityObj.velocityY / Math.abs(velocityObj.velocityY) * MAX_SPEED : velocityObj.velocityY;
		e.velocity = Math.sqrt(Math.pow(e.velocityX, 2) + Math.pow(e.velocityY, 2))
		$(e.target).fire(DRAG_END, e);
		touch = {};
		record = [];
	}

	function distance(x, y, x2, y2) {
		return Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2));
	}

	function getSpeed(record) {
		var velocityY = 0;
		var velocityX = 0;
		var len = record.length;
		for (var i = 0; i < len; i++) {
			velocityY += record[i]['velocityY'];
			velocityX += record[i]['velocityX'];
		}
		velocityY /= len;
		velocityX /= len;
		//手指反弹的误差处理
		return {
			velocityY: Math.abs(record[len - 1]['velocityY']) > MIN_SPEED ? velocityY : 0,
			velocityX: Math.abs(record[len - 1]['velocityX']) > MIN_SPEED ? velocityX : 0
		}
	}

	S.each([DRAG], function(evt) {
		S.Event.Special[evt] = {
			setup: function() {
				$(this).on('touchstart', touchStartHandler);
				$(this).on('touchmove', touchMoveHandler);
				$(this).on('touchend', touchEndHandler);
			},
			teardown: function() {
				$(this).detach('touchstart', touchStartHandler);
				$(this).detach('touchmove', touchMoveHandler);
				$(this).detach('touchend', touchEndHandler);
			}
		}
	});



	//枚举
	return {
		DRAG_START: DRAG_START,
		DRAG: DRAG,
		DRAG_END: DRAG_END
	};

}, {
	requires: ['node','event']
});
;
KISSY.add('gallery/xslide/1.0/index',function(S, Node, Base, Drag) {
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
            var config = self.userConfig;
            var $renderTo = self.$renderTo = $(config.renderTo);
            //是否旋转木马
            self.crousel = config.crousel;
            if (!config.renderTo || !$renderTo[0]) {
                return;
            }
            self.curIndex = 0;
            crouselIndex = 0;
            var $layer = self.$layer = $(layerCls, $renderTo);
            var $items = self.$items = $(itemCls, $layer);
            var $nav = self.$nav = $(navCls, $renderTo);
            var itemNum = self.itemNum = $items.length;
            if (!itemNum) return;
            if (itemNum <= 2) {
                //如果卡牌数小于3 关闭旋转木马
                self.crousel = false;
            }
            self.render();
        },
        render: function() {
            var self = this;
            var config = self.userConfig;
            var $renderTo = self.$renderTo;
            var $layer = self.$layer;
            var $items = self.$items;
            var $nav = self.$nav;
            var width = config.width || $renderTo.width() || 300;
            var height = config.height || $renderTo.height() || 50;
            var itemWidth = self.itemWidth = config.itemWidth || width;
            var itemNum = self.itemNum;
            var itemHeight = config.itemHeight || height;
            var $navItems;
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
                $navItems = self.$navItems = $("li", $nav);
            }
            self.evtBind();

            $navItems.removeClass("current").item(0).addClass("current");
            for (var i = 0; i < itemNum; i++) {
                self.put(i, i);
            }
            if (self.crousel) {
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
            self.$layer[0].style.webkitTransition = "";
            self.transform(self.$layer[0], {
                translateX: "(" + offsetX + "px) translateZ(0px)"
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
            var $renderTo = self.$renderTo;
            var $layer = self.$layer;
            var $items = self.$items;
            var $nav = self.$nav;
            var itemWidth = self.itemWidth;
            var itemNum = self.itemNum;
            if (self.crousel) {
                crouselIndex = index;
            }
            if (index < 0) {
                index = 0
            } else if (index > self.itemNum - 1) {
                index = self.itemNum - 1
            }
            var offsetX = self.crousel ? itemWidth * crouselIndex : itemWidth * index;
            var duration = 0.4;
            var easing = "ease-out";
            self.transform($layer[0], {
                translateX: "(" + (-offsetX) + "px) translateZ(0px)"
            });
            $layer[0].style.webkitTransition = "-webkit-transform " + duration + "s " + easing + " 0s";
            if (self.crousel) {
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
            if (self.crousel) {
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
                translateX: "(" + offsetIndex * itemWidth + "px) translateZ(0px)"
            })
        }

    });

    return XSlide;


}, {
    requires: ['node', 'base', './drag']
});
