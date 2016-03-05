var log4js_configured = false;
var log4js = require('log4js');
function configureLogger(){
		try {
			
		  log4js.configure('./config/log4js.json', {cwd: process.env.HOME});
		 
		  log4js_configured  = true;
		} catch (e) {console.log(e)}
		if (!log4js_configured) {
		try {
		  log4js.configure('./log4js.json', {cwd: process.env.HOME});
		  log4js_configured  = true;
		} catch (e) {}
		}
	
}
module.exports={
	getLogger:function(appender){
		
		if(!log4js_configured)
			configureLogger();
		return log4js.getLogger(appender);
	}
}