/*
	Drag Event for KISSY MINI 
	@author xiaoqi.huxq@alibaba-inc.com
*/
KISSY.add("gallery/xslide/1.0/drag",function(S, Node,Event) {
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