'use strict'
var isInitialized=false,
log=require('./logger'),
logger = log.getLogger('ezeClient-appender');

function EzetapRestImplTest(eze){
	
	var thi=this;
	var ezecliLocation="./ezecli/ezecli.exe";
	var ezecliWrapper=require('./EzecliPromiseWrapper').EzecliWrapper(eze);
	thi.initialize=function(ezetapConfig,fn){
		var appKey="";
		var appMode=0;
		try{
			eze.setdriver(ezecliLocation);
			eze.start();
			if(ezetapConfig.appMode==="PROD"){
				appKey=ezetapConfig.prodAppKey;
				appMode=1;
			}else{
				appKey=ezetapConfig.demoAppKey;
				appMode=0;
			}
			if(isInitialized){
				return thi.prepareDevice(fn);
			}
			ezecliWrapper.setServerType(appMode)
			.then(function(){
				return ezecliWrapper.login(ezetapConfig.username,appKey,1);
			})
			.then(function(){
				isInitialized=true;
				return ezecliWrapper.prepareDevice();
			})
			.then(function(){
				fn(200,responseObj("SUCCESS",null,{"message":"Initialization Successfull"}));
			})
			.catch(function(apio){
					console.log('in catch clause')
					try{
						if(apio!=undefined){
							var error=eze.model.StatusInfo.decode(apio.outData);
							if(error.message.indexOf("logged in")!=-1){
								thi.prepareDevice(fn);
							}else{
								fn(500,responseObj("FAILURE",errorObj(error.code,error.message),null));
							}
							
						}else{
							fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
						}
					}catch(e){
						fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
					}
				})
			
		}catch(e){
				fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
		}
	}

	thi.prepareDevice=function(fn){
		try{
			if(eze.User.isAuthenticated){
				ezecliWrapper.prepareDevice()
				.then(function(){
					fn(200,responseObj("SUCCESS",null,{"message":"Prepare Device Done"}));
				})
				.catch(function(apio){
					try{
						if(apio!=undefined){
							var error=eze.model.StatusInfo.decode(apio.outData);
							fn(500,responseObj("FAILURE",errorObj(error.code,error.message),null));
						}else{
							fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
						}									
					}catch(e){
						fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
					}

				})
			}else{
				fn(500,responseObj("FAILURE",errorObj("EZECLI_0003","User Not Logged In. Log In and Try again!!!"),null));
			}
		}catch(e){
			fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
		}
		
		
	}

	thi.logout=function(fn){
		try{
			if(eze.User.isAuthenticated){
				ezecliWrapper.logout()
				.then(function(){
					isInitialized=false;
					return ezecliWrapper.stop();
				})
				.then(function(){
					fn(200,responseObj("SUCCESS",null,{"message":"Ezecli Closed"}));
				})
				.catch(function(apio){
					try{
						if(apio!=undefined){
							var error=eze.model.StatusInfo.decode(apio.outData);
							fn(500,responseObj("FAILURE",errorObj(error.code,error.message),null));
						}else{
							fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
						}

					}catch(e){
						fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
					}
				})
			}else{
				fn(500,responseObj("FAILURE",errorObj("EZECLI_0003","User Not Logged In. Log In and Try again!!!"),null));
			}
		}catch(e){
			fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
		}
		
	}

	thi.payCard=function(amount,mode,options,fn){
		try{
			var additionalParams=populateAdditionalParams(options);
			if(eze.User.isAuthenticated){
				if( (!isValid(amount) || isNaN(amount)) && (!isValid(additionalParams.amountCashback) || isNaN(additionalParams.amountCashback)) ){
					return fn(400,responseObj("FAILURE",errorObj("EZECLI_0007","Invalid Amount or CashBack Amount"),null));
				}
				if("SALE"===mode){
					additionalParams.amountOther=0;
					ezecliWrapper.payCard(parseFloat(amount),additionalParams)
					.then(function(apio){
						var res=eze.model.Txn.decode(apio.outData);
						fn(200,responseObj("SUCCESS",null,constructPayementObj(JSON.parse(res.serverResponse),"card")));
					})
					.catch(function(apio){
						var error=eze.model.StatusInfo.decode(apio.outData);
						fn(500,responseObj("FAILURE",errorObj(error.code,error.message),null));
					})
				}else if("CASH@POS"===mode){
					ezecliWrapper.payCardCash(0,additionalParams.amountCashback,additionalParams)
					.then(function(apio){
						var res=eze.model.Txn.decode(apio.outData);
						fn(200,responseObj("SUCCESS",null,constructPayementObj(JSON.parse(res.serverResponse),"card")));
					})
					.catch(function(apio){
						var error=eze.model.StatusInfo.decode(apio.outData);
						fn(500,responseObj("FAILURE",errorObj(error.code,error.message),null));
					})
				}else if("CASHBACK"===mode){
					ezecliWrapper.payCardCash(parseFloat(amount),additionalParams.amountCashback,additionalParams)
					.then(function(apio){
						var res=eze.model.Txn.decode(apio.outData);
						fn(200,responseObj("SUCCESS",null,constructPayementObj(JSON.parse(res.serverResponse),"card")));
					})
					.catch(function(apio){
						var error=eze.model.StatusInfo.decode(apio.outData);
						fn(500,responseObj("FAILURE",errorObj(error.code,error.message),null));
					})
				}else{
					fn(500,responseObj("FAILURE",errorObj("EZECLI_0005","Mode Not Found"),null));
				}

			}else{
				fn(500,responseObj("FAILURE",errorObj("EZECLI_0003","User Not Logged In. Log In and Try again!!!"),null));
			}
		}catch(e){
			fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
		}
		
		
	}

	thi.payCash=function(amount,options,fn){
		try{
			var additionalParams=populateAdditionalParams(options);
			if(eze.User.isAuthenticated){
				ezecliWrapper.payCash(parseFloat(amount),additionalParams)
				.then(function(apio){
					var res=eze.model.Txn.decode(apio.outData);
					fn(200,responseObj("SUCCESS",null,constructPayementObj(JSON.parse(res.serverResponse),"cash")));
				})
				.catch(function(apio){
					var error=eze.model.StatusInfo.decode(apio.outData);
					fn(500,responseObj("FAILURE",errorObj(error.code,error.message),null));
				})
			}else{
				fn(500,responseObj("FAILURE",errorObj("EZECLI_0003","User Not Logged In. Log In and Try again!!!"),null));
			}
		}catch(e){
			fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
		}
		
	}

	thi.payCheque=function(amount,cheque,options,fn){
		try{
			var additionalParams=populateAdditionalParams(options);
			additionalParams.chequeNumber=cheque.chequeNumber
			additionalParams.bankCode=cheque.bankCode
			additionalParams.chequeDate=cheque.chequeDate
			if(eze.User.isAuthenticated){
				if(!isValid(additionalParams.chequeNumber) || !isValid(additionalParams.bankCode) || !isValid(additionalParams.chequeDate)){
					return fn(500,responseObj("FAILURE",errorObj("EZECLI_0008","Mandatory Parameters missing"),null));
				}
				

				ezecliWrapper.payCheque(parseFloat(amount),additionalParams)
				.then(function(apio){
					var res=eze.model.Txn.decode(apio.outData);
					fn(200,responseObj("SUCCESS",null,constructPayementObj(JSON.parse(res.serverResponse),"cheque")));
				})
				.catch(function(apio){
					var error=eze.model.StatusInfo.decode(apio.outData);
					fn(500,responseObj("FAILURE",errorObj(error.code,error.message),null));
				})
			}else{
				fn(500,responseObj("FAILURE",errorObj("EZECLI_0003","User Not Logged In. Log In and Try again!!!"),null));
			}
		}catch(e){
			fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
		}
		
	}

	thi.voidTransaction=function(txnId,fn){
		try{
			if(eze.User.isAuthenticated){
				ezecliWrapper.voidTransaction(txnId)
				.then(function(apio){
					fn(200,responseObj("SUCCESS",null,{"message":"Transaction voided"}));
				})
				.catch(function(apio){
					var error=eze.model.StatusInfo.decode(apio.outData);
					fn(500,responseObj("FAILURE",errorObj(error.code,error.message),null));
				})
			}else{
				fn(500,responseObj("FAILURE",errorObj("EZECLI_0003","User Not Logged In. Log In and Try again!!!"),null));
			}
			
		}catch(e){
			fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
		}
		
	}

	thi.sendReceipt=function(data,fn){
		try{
			if(eze.User.isAuthenticated){
				ezecliWrapper.sendReceipt(data.txnId,data.customer.mobileNo,data.customer.email)
				.then(function(apio){
					fn(200,responseObj("SUCCESS",null,{"message":"Send e-receipt successful"}));
				})
				.catch(function(apio){
					var error=eze.model.StatusInfo.decode(apio.outData);
					fn(500,responseObj("FAILURE",errorObj(error.code,error.message),null));
				})
			}else{
				fn(500,responseObj("FAILURE",errorObj("EZECLI_0003","User Not Logged In. Log In and Try again!!!"),null));
			}
		}catch(e){
			fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
		}
		
	}

	thi.getTransaction=function(txnId,fn){
		try{
			if(eze.User.isAuthenticated){
				ezecliWrapper.getTransaction(txnId)
				.then(function(apio){
					var res=eze.model.Txn.decode(apio.outData);
					var response=JSON.parse(res.serverResponse);
					fn(200,responseObj("SUCCESS",null,constructPayementObj(response,response.paymentMode.toLowerCase())));
				})
				.catch(function(apio){
					var error=eze.model.StatusInfo.decode(apio.outData);
					fn(500,responseObj("FAILURE",errorObj(error.code,error.message),null));
				})
			}else{
				fn(500,responseObj("FAILURE",errorObj("EZECLI_0003","User Not Logged In. Log In and Try again!!!"),null));
			}
		}catch(e){
			fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
		}
	}

	thi.searchTransaction=function(startDate,endDate,fn){
		try{
			if(eze.User.isAuthenticated){
				ezecliWrapper.searchTransaction(startDate,endDate)
				.then(function(apio){
					var res=eze.model.TxnHistory.decode(apio.outData);
					var data=constructTransactionObjectList(res);
					fn(200,responseObj("SUCCESS",null,data));
				})
				.catch(function(apio){
					try{
						var error=eze.model.StatusInfo.decode(apio.outData);
						fn(500,responseObj("FAILURE",errorObj(error.code,error.message),null));
					}catch(e){
						fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
					}
					
				})
			}else{
				fn(500,responseObj("FAILURE",errorObj("EZECLI_0003","User Not Logged In. Log In and Try again!!!"),null));
			}
		}catch(e){
			fn(500,responseObj("FAILURE",errorObj("EZECLI_0001","Exception occured. Contact Ezetap Support!!!"),null));
		}
	}

	function constructTransactionObjectList(response){
		var data=new Array(response.txns.length)
		for(var i=0;i<data.length;i++){
			var txn=response.txns[i];
			var type="";
					if(txn.txnType==3){
						type="cash"
					}else if(txn.txnType==4){
						type="cheque"
					}else{
						type="card";
					}
					data[i]=constructSearchTransactionPayementObj(txn,type);
				}
				return {"data":data};
			}

			var responseObj=function(status,error,result){
				return {
					"status":status,
					"error":error,
					"result":result
				}
			}

			var errorObj=function(errorCode,errorText){
				return {"errorCode":errorCode,"errorText":errorText};
			}

			var populateAdditionalParams=function(options){
				var additionalParams={};
				if(options==undefined) {
					return {}
				}
				if(options.customer!=null){
					additionalParams.customerMobile=options.customer.mobileNo;
					additionalParams.customerEmail=options.customer.email;
				}
				if(options.references!=null){
					additionalParams.orderId=options.references.primaryRef
					additionalParams.externalReference2=options.references.ref2;
					additionalParams.externalReference3=options.references.ref3;
				}
				if(options.amountCashback!=null){
					additionalParams.amountOther=parseFloat(options.amountCashback);
				}else{
					additionalParams.amountOther=0;
				}

				return additionalParams;
			}

			var constructPayementObj=function(obj,type){
				var obj_temp={};
				obj_temp.txn={};
				obj_temp.customer={};
				obj_temp.receipt={};

				var temp={};

				var txnMapper={
					"txnId":"txnId",
					"postingDate":"txnDate",
					"amount":"amount",
					"currencyCode":"currencyCode",
					"paymentMode":"paymentMode",
					"authCode":"authCode",
					"deviceSerial":"deviceSerial",
					"mid":"mid", 
					"tid":"tid",
					"settlementStatus":"status"
				}
				var customerMapper={
					"customerEmail":"email",
					"customerMobile":"mobileNo"
				}	

				var receiptMapper={
					"customerReceiptUrl":"receiptUrl",
					"readableChargeSlipDate":"receiptDate"
				}

				var references={
					"externalRefNumber":"primaryRef",
					"externalRefNumber2":"ref2",
					"externalRefNumber3":"ref3"
				}
				
		for(var property in txnMapper){
			if(txnMapper.hasOwnProperty(property)){
				if(obj[property]!=null && obj[property]!=""){
					var str=property;
					temp[txnMapper[property]]=obj[property];
				}
			}
		}
		obj_temp.txn=temp;
		temp={};

		for(var property in references){
			if(references.hasOwnProperty(property)){
				if(obj[property]!=null && obj[property]!=""){
					var str=property;
					temp[references[property]]=obj[property];
				}
			}
		}
		obj_temp.references=temp;
		temp={};

		for(var property in customerMapper){
			if(customerMapper.hasOwnProperty(property)){
				if(obj[property]!=null && obj[property]!=""){
					var str=property;
					temp[customerMapper[property]]=obj[property];
				}
			}
		}
		obj_temp.customer=temp;
		temp={};
		for(var property in receiptMapper){
			if(receiptMapper.hasOwnProperty(property)){
				if(obj[property]!=null && obj[property]!=""){
					var str=property;
					temp[receiptMapper[property]]=obj[property];
				}
			}
		}
		obj_temp.receipt=temp;
		temp={};
		
		if("card"===type){
			var cardMapper={
				"formattedPan":"maskedCardNo",
				"paymentCardBrand":"cardBrand"
			}
			for(var property in cardMapper){
				if(cardMapper.hasOwnProperty(property)){
					if(obj[property]!=null && obj[property]!=""){
						var str=property;
						temp[cardMapper[property]]=obj[property];
					}
				}
			}
			obj_temp.card=temp;
			temp={};

			var merchantMapper={
				"merchantCode":"merchantCode",
				"merchantName":"merchantName"
			}
			for(var property in merchantMapper){
				if(merchantMapper.hasOwnProperty(property)){
					if(obj[property]!=null && obj[property]!=""){
						var str=property;
						temp[merchantMapper[property]]=obj[property];
					}
				}
			}
			obj_temp.merchant=temp;
		}
		temp={};
		if("cheque"===type){
			var chequeMapper={
				"chequeNumber":"chequeNumber",
				"bankCode":"bankCode",
				"chequeDate":"chequeDate"
			}
			for(var property in chequeMapper){
				if(chequeMapper.hasOwnProperty(property)){
					if(obj[property]!=null && obj[property]!=""){
						var str=property;
						temp[chequeMapper[property]]=obj[property];
					}
				}
			}
			obj_temp.cheque=temp;
		}

		temp={};
		
		return obj_temp;
	}

	var constructSearchTransactionPayementObj=function(obj,type){
		var obj_temp={};
		obj_temp.txn={};
		obj_temp.customer={};
		obj_temp.receipt={};
		
		var temp={};

		var txnMapper={
			"transactionId":"txnId",
			"timestamp":"txnDate",
			"amount":"amount",
			"currencyCode":"currencyCode",
			"paymentMode":"paymentMode",
			"authCode":"authCode",
			"deviceSerial":"deviceSerial",
			"mid":"mid",
			"tid":"tid"
		}
		var customerMapper={
			"customerEmail":"email",
			"customerMobileNumber":"mobileNo"
		}	

		var receiptMapper={
			"receiptUrl":"receiptUrl",
			"readableChargeSlipDate":"receiptDate"
		}
		for(var property in txnMapper){
			if(txnMapper.hasOwnProperty(property)){
				if(obj[property]!=null){
					var str=property;
					temp[txnMapper[property]]=obj[property];
				}
			}
		}
		obj_temp.txn=temp;
		temp={};

		for(var property in customerMapper){
			if(customerMapper.hasOwnProperty(property)){
				if(obj[property]!=null){
					var str=property;
					temp[customerMapper[property]]=obj[property];
				}
			}
		}
		obj_temp.customer=temp;
		temp={};
		for(var property in receiptMapper){
			if(receiptMapper.hasOwnProperty(property)){
				if(obj[property]!=null){
					var str=property;
					temp[receiptMapper[property]]=obj[property];
				}
			}
		}
		obj_temp.receipt=temp;
		temp={};
		
		if("card"===type){
			var cardMapper={
				"maskedCardNumber":"maskedCardNo",
				"cardBrand":"cardBrand"
			}
			for(var property in cardMapper){
				if(cardMapper.hasOwnProperty(property)){
					if(obj[property]!=null){
						var str=property;
						temp[cardMapper[property]]=obj[property];
					}
				}
			}
			obj_temp.card=temp;
			temp={};

			var merchantMapper={
				"merchantCode":"merchantCode",
				"merchantName":"merchantName"
			}
			for(var property in merchantMapper){
				if(merchantMapper.hasOwnProperty(property)){
					if(obj[property]!=null){
						var str=property;
						temp[merchantMapper[property]]=obj[property];
					}
				}
			}
			obj_temp.merchant=temp;
		}
		temp={};
		if("cheque"===type){
			var chequeMapper={
				"chequeNumber":"chequeNumber",
				"bankCode":"bankCode",
				"chequeDate":"chequeDate"
			}
			for(var property in chequeMapper){
				if(chequeMapper.hasOwnProperty(property)){
					if(obj[property]!=null){
						var str=property;
						temp[chequeMapper[property]]=obj[property];
					}
				}
			}
			obj_temp.cheque=temp;
		}

		temp={};
		obj_temp.txn.paymentMode=type.toUpperCase();
		return obj_temp;
	}

	var isValid=function(data){
		if(data!== 'undefined' && data!=null && data!==""){
			return true
		}
		return false;
	}
}


module.exports = {
	EzetapRestImpl: function(ezecli)  {
		var instance=new EzetapRestImplTest(ezecli);
		return instance;
	}
}