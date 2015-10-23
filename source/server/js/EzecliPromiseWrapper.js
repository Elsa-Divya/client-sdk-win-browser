var Q=require('q');
function EzecliWrapper(eze){
	var that=this;

	that.prepareDevice=function(){
		var deferred=Q.defer();
		try{
			
			eze.preparedevice(function(apio){
				try{
					if(eze.model.ApiOutput.ResultStatus.SUCCESS == apio.status){
					deferred.resolve(apio);
					}else{
						deferred.reject(apio);
					}
				}catch(e){
					deferred.reject();
				}		
					
			});
		}catch(e){
			deferred.reject();
		}
		
		
		return deferred.promise;
	}

	that.login=function(username,password,loginmode){
		var deferred=Q.defer();
		try{
			eze.login(username,password,loginmode,function(apio){
				try{
					if(eze.model.ApiOutput.ResultStatus.SUCCESS == apio.status){
						deferred.resolve(apio);
					}else{
						deferred.reject(apio);
					}
				}catch(e){
					deferred.reject();
				}
					
			});
		}catch(e){
			deferred.reject();
		}
		
		
		return deferred.promise;
	}

	that.logout=function(){
		var deferred=Q.defer();
		try{
			
			eze.logout(function(apio){
				try{
					if(eze.model.ApiOutput.ResultStatus.SUCCESS == apio.status){
					deferred.resolve(apio);
					}else{
						deferred.reject(apio);
					}
				}catch(e){
					deferred.reject();
				}
			});
		}catch(e){
			deferred.reject();
		}
		
		return deferred.promise;
	}

	that.stop=function(){
		var deferred=Q.defer();
		try{
			eze.stop()
			deferred.resolve();
		}catch(e){
			deferred.reject();
		}
		
		return deferred.promise;
	}

	that.payCard=function(amount,options){
		var deferred=Q.defer();
		try{
			eze.paycard(amount,options,function(apio){
				try{
					if(eze.model.ApiOutput.ResultStatus.SUCCESS == apio.status){
					deferred.resolve(apio);
					}else{
						deferred.reject(apio);
					}
				}catch(e){
					deferred.reject();
				}
			});
		}catch(e){
			deferred.reject();
		}
		
		return deferred.promise;
	}

	that.payCardCash=function(amount,otherAmount,options){
		var deferred=Q.defer();
		try{
			eze.paycardCash(amount,otherAmount,options,function(apio){
				try{
					if(eze.model.ApiOutput.ResultStatus.SUCCESS == apio.status){
					deferred.resolve(apio);
					}else{
						deferred.reject(apio);
					}
				}catch(e){
					deferred.reject();
				}
			});
		}catch(e){
			deferred.reject();
		}
		
		
		return deferred.promise;
	}

	that.payCash=function(amount,options){
		var deferred=Q.defer();
		try{

			eze.paycash(amount,options,function(apio){
				try{
					if(eze.model.ApiOutput.ResultStatus.SUCCESS == apio.status){
					deferred.resolve(apio);
					}else{
						deferred.reject(apio);
					}
				}catch(e){
					deferred.reject();
				}
			});
		}catch(e){
			deferred.reject();
		}
		
		
		return deferred.promise;
	}

	that.payCheque=function(amount,options){
		var deferred=Q.defer();
		try{

			eze.paycheque(amount,options,function(apio){
				try{
					if(eze.model.ApiOutput.ResultStatus.SUCCESS == apio.status){
					deferred.resolve(apio);
					}else{
						deferred.reject(apio);
					}
				}catch(e){
					deferred.reject();
				}
			});
		}catch(e){
			deferred.reject();
		}
		
		
		return deferred.promise;
	}

	that.voidTransaction=function(txnId){
		var deferred=Q.defer();
		try{

			eze.txnvoid(txnId,function(apio){
				try{
					if(eze.model.ApiOutput.ResultStatus.SUCCESS == apio.status){
					deferred.resolve(apio);
					}else{
						deferred.reject(apio);
					}
				}catch(e){
					deferred.reject();
				}
			});
		}catch(e){
			deferred.reject();
		}
		
		
		return deferred.promise;
	}

	that.sendReceipt=function(txnId,mobile,email){
		var deferred=Q.defer();
		try{
			
			eze.forwardreceipt(txnId,mobile,email,function(apio){
				try{
					if(eze.model.ApiOutput.ResultStatus.SUCCESS == apio.status){
					deferred.resolve(apio);
					}else{
						deferred.reject(apio);
					}
				}catch(e){
					deferred.reject();
				}
			});
		}catch(e){
			deferred.reject();
		}
		
		return deferred.promise;
	}

	that.getTransaction=function(txnId){
		var deferred=Q.defer();
		try{
			
			eze.txndetail(txnId,function(apio){
				try{
					if(eze.model.ApiOutput.ResultStatus.SUCCESS == apio.status){
					deferred.resolve(apio);
					}else{
						deferred.reject(apio);
					}
				}catch(e){
					deferred.reject();
				}	
			});
		}catch(e){
			deferred.reject();
		}
		
		return deferred.promise;
	}

	that.searchTransaction=function(startDate,endDate){
		var deferred=Q.defer();
		try{
			
			eze.txnhistory(startDate,endDate,function(apio){
				try{
					if(eze.model.ApiOutput.ResultStatus.SUCCESS == apio.status){
					deferred.resolve(apio);
					}else{
						deferred.reject(apio);
					}
				}catch(e){
					deferred.reject();
				}
			});
		}catch(e){
			deferred.reject();
		}
		
		return deferred.promise;
	}

	that.setServerType=function(serverType){
		var deferred=Q.defer();
		try{	
			eze.setServerType(serverType,function(apio){
				try{
					if(eze.model.ApiOutput.ResultStatus.SUCCESS == apio.status){
						deferred.resolve(apio);
					}else{
						deferred.reject(apio);
					}
				}catch(e){
					deferred.reject();
				}
			});
		}catch(e){
			deferred.reject();
		}
		
		return deferred.promise;
	}
}

module.exports = {
    EzecliWrapper: function(ezecli)  {
		var instance=new EzecliWrapper(ezecli);
		return instance;
    }
  }