var express=require("express"),
	utils=require('./util'),
	config = utils.readConfig('./config/config.json'),
	ezecli=require("./ezecli");
	eze = ezecli.ezecli(),
	ezetapRestImpl=require('./EzetapRestImpl').EzetapRestImpl(eze),
	app=express(),
	fs = require('fs'),
	bodyParser = require('body-parser'),
	log=require('./logger'),
	logger = log.getLogger();

	if(config.httpPort!=null && config.wsPort!=null){
		app.listen(config.httpPort);
		console.log('HTTP Server started listening at port '+config.httpPort);
		require("./WebSocket.js").start(eze,config.wsPort)
	}else{
		console.log("Error in starting server");
		return;
	}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var baseUrl="/ezetap/v1"
app.post(baseUrl+'/initialize',function(req,res){
	var ezetapConfig=req.body;
	ezetapRestImpl.initialize(ezetapConfig,function(status,data){
		sendResponse(res,status,data);	
	});
});

app.get(baseUrl+'/prepareDevice',function(req,res){
	ezetapRestImpl.prepareDevice(function(status,data){
		sendResponse(res,status,data);
	});
});

app.get(baseUrl+'/close',function(req,res){
	ezetapRestImpl.logout(function(status,data){
		sendResponse(res,status,data);
	});
});

app.post(baseUrl+'/payCard',function(req,res){
	var reqBody=req.body;
	ezetapRestImpl.payCard(reqBody.amount,reqBody.mode,reqBody.options,function(status,data){
		sendResponse(res,status,data);
	});
});

app.post(baseUrl+'/payCash',function(req,res){
	var reqBody=req.body;
	ezetapRestImpl.payCash(reqBody.amount,reqBody.options,function(status,data){
		sendResponse(res,status,data);
	});
});

app.post(baseUrl+'/payCheque',function(req,res){
	var reqBody=req.body;
	ezetapRestImpl.payCheque(reqBody.amount,reqBody.cheque,reqBody.options,function(status,data){
		sendResponse(res,status,data);
	});
});

app.get(baseUrl+'/txnStatus/:id',function(req,res){
	ezetapRestImpl.checkTxnStatus(req.params.id,function(status,data){
		sendResponse(res,status,data);
	});
});

app.get(baseUrl+'/voidTransaction/:id',function(req,res){
	ezetapRestImpl.voidTransaction(req.params.id,function(status,data){
		sendResponse(res,status,data);
	});
});

app.get(baseUrl+'/searchTransaction',function(req,res){
	ezetapRestImpl.searchTransaction(req.query.startDate,req.query.endDate,function(status,data){
		sendResponse(res,status,data);
	});
});

app.get(baseUrl+'/getTransaction/:id',function(req,res){
	ezetapRestImpl.getTransaction(req.params.id,function(status,data){
		sendResponse(res,status,data);
	});
});

app.post(baseUrl+'/sendReceipt',function(req,res){
	var startDate=req.body;
	ezetapRestImpl.sendReceipt(reqBody,function(status,data){
		sendResponse(res,status,data);
	});
})

function sendResponse(res,status,data){
	try{
		res.status(status);
		res.json(data);
	}catch(e){
		logger.debug('Exception in Send Response '+ e);
	}
	
}

