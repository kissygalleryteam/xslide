var tidy = require('./tidy.js'),
	fs   = require('fs'),
	url  = require('url'),
	path = require('path');

// 输入
// mock.getMockData(content) // 得到页面中内嵌的所有数据，下面的覆盖上面的
// mock.delPageParamArea(content)// 得到删除mock数据的干净页面
// mock.hasDef(content) // 判断是否包含mock字段

function parseParam(content, reg) {
    var marched = content.match(reg);
    var ret = {};
	
    if (marched && marched[1]) {
		marched[1].replace(/[\n\r]/g, '');
		var tcontent = delPageParamArea(content);
		try {
			var to = JSON.parse(marched[1]);
			for(var k in to){
				ret[k] = to[k];
			}
		} catch (e) {
			console.log('格式错误的模板变量:%s', marched[1]);
			return parseParam(tcontent,reg);
		}
		var otheret = parseParam(tcontent,reg);
		for(var j in otheret){
			ret[j] = otheret[j];
		}
		return ret;
	}
	return {};
}

function parsePageParam(content) {
    return parseParam(content, /<\!--#def([\s\S]*?)-->/);
}

function delPageParamArea(content){
    return content.replace(/<\!--#def([\s\S]*?)-->/, '');
}

function getMockData(content){
	var pageParam = parsePageParam(content);
	return pageParam;

}

function checkDef(content){
    var marched = content.match(/<\!--#def([\s\S]*?)-->/);
    return marched && marched[1];
}

exports.getMockData = getMockData;
exports.delPageParamArea = delPageParamArea;
exports.checkDef = checkDef;
