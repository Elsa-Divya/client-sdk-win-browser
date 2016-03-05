var fs = require('fs');

function readJSONSync(filePath, callback) { 

	//fs.readFileSync(filePath,'utf8');
	var data=fs.readFileSync(filePath,'utf-8');
	if(data){
		var parsedJson;
		try {
		  parsedJson = JSON.parse(data);
		} catch (exception) {
		  return callback(exception);
		}
		return callback(null, parsedJson);
	}
}



module.exports={
	readConfig:function (path){
		var config=undefined;
		readJSONSync(path,function(err,data){
			if(data){
				config=data;
			}
			
		});
		return config;
	},
	readJSONSync:function(path,callback){
		readJSONSync(path,callback);
	}
}
