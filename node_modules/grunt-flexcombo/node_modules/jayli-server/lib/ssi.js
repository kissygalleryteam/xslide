// 'use strict';
var util = require('util');
var fs = require('fs');
var path = require('path');
var pwd = process.cwd();
var isUtf8 = require('./is-utf8');
var iconv = require('iconv-lite');
var os = require('os');


//var reg = '<!--#([a-z]+)(\\s([a-z]+)=[\'"](.+?)[\'"])* -->';
var reg = '<!--#(include)(\\s([a-z]+)=[\'"](.+?)[\'"])* -->';
var p = './xx.html';
var CTS = {};
var root = null;

// p：绝对路径
// return:结果
function parseOne(p){
	var p = path.resolve(p);
	if(root === null){
		root = p;
	}
	var firstInclude = hasIncludes(p);
	var r;
	//console.log(firstInclude);
	if(firstInclude){
		r = parseFirstIncludes(p,getContent(p));
		CTS[p] = r;
		r = parseOne(p);
	} else {
		r = getContent(p);
	}
	return r;
}

function hasIncludes(p){
	
	var content = getContent(p);
	var r = content.match(new RegExp(reg,'i'));
	if(r){
		var f = RegExp.$4;
		return path.resolve(path.dirname(p),f);
	} else {
		return false;
	}
}

function parseFirstIncludes(p,content){
	var pathname = path.dirname(p);
	var includefile = hasIncludes(p);
	var dpath = path.resolve(pathname,includefile);
	var dcontent = getContent(dpath);
	var rep = path.dirname(path.relative(pathname,includefile));
	var xcontent = dcontent.replace(new RegExp(reg,'gi'),function(){
		// console.log(arguments);
		var args = arguments;
		return "<!--#include " + args[3] + '="' + path.join(rep,args[4]) + '" -->';
	});
	CTS[dpath] = dcontent;
	return content.replace(new RegExp(reg,'i'),xcontent);
}

// p:绝对路径
function getContent(p){
	if(os.platform().indexOf('win32')>=0){
		var http_url_reg = /^.+\\http:\\([^\\].+)$/;
	} else {
		var http_url_reg = /^.+\/http:\/([^\/].+)$/;
	}
	if(CTS[p]){
		return CTS[p];
	} else if(isFile(p)){
		var bf = read(p);
		return bf.toString('utf-8');
	} else if(http_url_reg.test(p)){
		var f_url = p.match(http_url_reg)[1];
		if(os.platform().indexOf('win32') >= 0){
			f_url = f_url.replace(/\\/ig,'/');
		}
		return '<!--#chunk url="'+f_url+'" -->';
	} else {
		return "<!-- " + p + " is not found! -->";
	}
}

function isFile(p) {
	if(fs.existsSync(p)){
		var stat = fs.lstatSync(p);
		return stat.isFile();
	} else {
		return false;
	}
}

// data: string
function ssiChunk(filepath,data){
	var filepath = path.resolve(filepath);
	CTS = {};
	CTS[filepath] = data;	
	return parseOne(filepath);
}

// 得到的一定是utf8编码的buffer
function read(file){
	var fd = fs.readFileSync(file);

	if(isUtf8(fd)){
		var bf = fs.readFileSync(file);
	} else {
		var bf = iconv.encode(iconv.decode(fd, 'gbk'),'utf8');
	}
	return bf;
}

//ssi()

// console.log(parseOne(p));

exports.ssi = parseOne;
exports.ssiChunk = ssiChunk;
