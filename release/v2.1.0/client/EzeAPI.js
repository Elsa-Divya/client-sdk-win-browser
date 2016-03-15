(
function(window){
	'use strict'
	function DefineEzeAPI(){
		var EzeAPI={};
		var wsCaller=new RestWSCaller();
		var baseUrl="http://localhost:";
		var port={};
		port.httpPort=8081;
		
		EzeAPI.initialize=function(ezeConfig,ezetapResponseHandler){
			if(ezeConfig.httpPort!=undefined){
				port.httpPort=ezeConfig.httpPort;
			}
			wsCaller.doPostCall(baseUrl+port.httpPort+"/ezetap/v1/initialize",ezeConfig,ezetapResponseHandler);
		}
		
		EzeAPI.cardTransaction=function(amount,mode,options,ezetapResponseHandler){
			var data={
					"amount":amount,
					"mode":mode,
					"options":options
			}
			wsCaller.doPostCall(baseUrl+port.httpPort+"/ezetap/v1/cardTransaction",data,ezetapResponseHandler);
		}
		EzeAPI.cashTransaction=function(amount,options,ezetapResponseHandler){
			var data={
					"amount":amount,
					"options":options
			}
			wsCaller.doPostCall(baseUrl+port.httpPort+"/ezetap/v1/cashTransaction",data,ezetapResponseHandler);
		}
		EzeAPI.chequeTransaction=function(amount,cheque,options,ezetapResponseHandler){
			var data={
					"amount":amount,
					"cheque":cheque,
					"options":options
					
			}
			wsCaller.doPostCall(baseUrl+port.httpPort+"/ezetap/v1/chequeTransaction",data,ezetapResponseHandler);
		}
		
		EzeAPI.sendReceipt=function(data,ezetapResponseHandler){
			
			wsCaller.doPostCall(baseUrl+port.httpPort+"/ezetap/v1/sendReceipt",data,ezetapResponseHandler);
		}
		EzeAPI.voidTransaction=function(txnId,ezetapResponseHandler){
			wsCaller.doGetCall(baseUrl+port.httpPort+"/ezetap/v1/voidTransaction/"+txnId,ezetapResponseHandler);
		}
		
		EzeAPI.prepareDevice=function(ezetapResponseHandler){
			wsCaller.doGetCall(baseUrl+port.httpPort+"/ezetap/v1/prepareDevice",ezetapResponseHandler); 
		}
		
		EzeAPI.close=function(ezetapResponseHandler){
			wsCaller.doGetCall(baseUrl+port.httpPort+"/ezetap/v1/close",ezetapResponseHandler);
		}
		
		EzeAPI.handleNotification=function(wsPort,notificationHandler,errorHandler){
			wsCaller.connect(wsPort,notificationHandler,errorHandler);
		}
		EzeAPI.getTransaction=function(txnId,ezetapResponseHandler){
			wsCaller.doGetCall(baseUrl+port.httpPort+"/ezetap/v1/getTransaction/"+txnId,ezetapResponseHandler);
		}
		EzeAPI.searchTransactions=function(startDate,endDate,ezetapResponseHandler){
			wsCaller.doGetCall(baseUrl+port.httpPort+"/ezetap/v1/searchTransaction?startDate="+startDate+"&endDate="+endDate,ezetapResponseHandler);
		}
		EzeAPI.cardPayment=function(chargeObj,ezetapResponseHandler){
			wsCaller.doPostCall(baseUrl+port.httpPort+"/ezetap/v1/takeCardPayment",chargeObj,ezetapResponseHandler);
		}
		EzeAPI.cashPayment=function(chargeObj,ezetapResponseHandler){
			wsCaller.doPostCall(baseUrl+port.httpPort+"/ezetap/v1/takeCashPayment",chargeObj,ezetapResponseHandler);
		}
		return EzeAPI;
	}

	function RestWSCaller(){
		var t=this;
		t.doGetCall=function(url,ezetapResponseHandler){
			$.ajax({
				  type: "GET",
				  url: url,
				  success: function(response){
					  if(typeof (ezetapResponseHandler)==='function')
						  ezetapResponseHandler(response);
				  },
				  error:function(response){
					  if(typeof (ezetapResponseHandler)==='function')
						  ezetapResponseHandler(response.responseJSON);
				  },
				  dataType: "json"
				});
		};
	
		t.doPostCall=function(url,data,ezetapResponseHandler){
			$.ajax({
				  type: "POST",
				  url: url,
				  data:data,
				  success: function(response){
					  if(typeof (ezetapResponseHandler)==='function')
						  ezetapResponseHandler(response);
				  },
				  error:function(response){
					  if(typeof (ezetapResponseHandler)==='function')
						  ezetapResponseHandler(response.responseJSON);
				  },
				  dataType: "json"
				});
		};
		t.connect = function(wsPort,notificationHandler,errorHandler){
			var ws;
			if(wsPort){
				ws = new WebSocket('ws://localhost:'+wsPort);
			}else{
				ws = new WebSocket('ws://localhost:1337');
			}
			ws.onclose=function(){
				console.log('in socket close'+typeof(errorHandler));
				if(typeof(errorHandler)==='function'){
					errorHandler();
				}
					
			}
	    	ws.onmessage = function (message) {
	    		if(typeof(notificationHandler)==='function')
	    			notificationHandler(message.data);
	        };
	    };
	}
	
	
	if(typeof(EzeAPI)==='undefined'){
		window.EzeAPI=DefineEzeAPI();
	}else{
		console.log('EzeAPI Already defined');
	}
}

)(window);