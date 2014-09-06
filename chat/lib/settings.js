/* 
* @Author: jin9x
* @Date:   2014-08-17 05:48:47
* @Last Modified by:   jin9x
* @Last Modified time: 2014-08-17 08:19:09
*/

var settings = {
	TotalTimeChat: 0,
	TotalVisitor: 0
};

var funcSetting = {
	init: function(){
		tmp = require('./settings.json');
		settings = extend(settings, tmp);
		return this;
	},
	get: function(name){
		return settings[name];
	},
	set: function(name, value){
		settings[name] = value;
		updateData();
		return settings[name];
	},
	increase: function(name, i){
		if(typeof i == 'undefined') i = 1;
		funcSetting.set(name, settings[name]+i);
		return funcSetting.get(name);
	}
};

var extend = function(o1, o2){
	if(typeof o2 == 'object')
		for(var key in o2){
			if(typeof o1[key] != 'undefined'){
				o1[key] = o2[key];
			}
		}
	return o1;
};

var updateData = function(){
	var fs = require("fs");
	fs.writeFile("lib/settings.json", JSON.stringify(settings), "utf8");
};

module.exports = funcSetting;