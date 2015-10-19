var pb = require ('protobufjs');
var fs = require('fs');
var path = require('path');
var events = require("events");
var EventEmitter = require("events").EventEmitter;
var log4js=require('./logger');

function Ezecli() {
	
  var thi = this;
  this.ezeclibusy = 0;
  thi.ezeLaunched = false;
  this.ezecli = null;
  this.child = null;
  
  this.ee=new EventEmitter();
  this.ee.setMaxListeners(Infinity);
	
  this.pidfile = null;
  try {
    this.pidfile = path.join(process.env.HOME, 'ezecli.pid.txt');
  } catch(e){}
  if(null == this.pidfile) {
	  try {
		  if(navigator.appVersion.indexOf("Win") != -1) {
			  this.pidfile = path.join(process.env.HOMEDRIVE,process.env.HOMEPATH, 'ezecli.pid.txt');
		  }
	  }catch(e) {}
  }
  if (null == this.pidfile) {
    //because some machines don't have env.home
    try {
      this.pidfile = path.join(path.dirname(process.execPath), 'ezecli.pid.txt');
    } catch(e){}
  }

  this.User = {username: '', password: '', isAuthenticated: false, errorCode:'',errorText:'', sessk:''};
  this.Device = false;

  this.proto = pb.loadProtoFile('./js/ezetap.proto');
  try {
    this.model = this.proto.build('ezetap');
  } catch(e) { //guard for cmd line usage
    this.proto = pb.loadProtoFile('./js/ezetap.proto');
    this.model = this.proto.build('ezetap');
  }

  this.isLogsEnabled = true;
  
	this.logger = log4js.getLogger('ezeClient-appender');
  

  this.txnAdditionalFields = 'orderId nonce customerMobile customerEmail externalReference2 externalReference3 amountOther chequeNumber bankCode chequeDate'.split(' ');

  this.log = function(s) {
    if (thi.isLogsEnabled) thi.logger.debug('>>' + s);
  };

  this.triggerEvent = function(ev) {
	  this.ee.emit(ev);
    thi.log("EVENT: " + ev);
  }
  
  
  /*this.triggerEventWithData = function(ev, data) {
    if (null != thi.eventChannel) {
      thi.eventChannel.trigger(ev, data);
    }
    thi.log("EVENT: " + ev);
  }*/


  this.setdriver = function(ecli) {
    if (!thi.isFile(ecli)) 
      return false;
    thi.ezecli = ecli;
    thi.log("************* Starting Ezecli JS Interface ************************");
    
    return true;
  }

  this.isFile = function(cmd) {
    if (null == cmd) return false;
    try {
      stats = fs.lstatSync(cmd);
      if (stats.isFile()) return true;
      if (stats.isDirectory()) return false;
    } catch (e) {
    }
    return false;
  }


  this.start = function() {
    if(thi.ezeLaunched){
		return;
	}
      
    thi.spawn = require('child_process').spawn;
    //kill previous instance pid
    if (thi.isFile(thi.pidfile))  {
      var stalepid = fs.readFileSync(thi.pidfile, {encoding: 'utf8'});
      thi.log("*** Stale PID " + stalepid);
      try {
        process.kill(stalepid, 'SIGKILL');
      } catch(e){}
      thi.log("Hung up old instance with pid " + stalepid);
    }
    thi.log("Starting " + this.ezecli);
    thi.child = this.spawn(this.ezecli, [], {detached: true});
    thi.log("Started " + this.ezecli + " with pid " + thi.child.pid);
    fs.writeFileSync(thi.pidfile, thi.child.pid, {encoding: 'utf8'});
    thi.child.unref();
    thi.isLogsEnabled = false;
    thi.ezeLaunched = true;
    thi.child.stderr.on('data', function (data) {
        thi.log('[NJ]' + data);
    });

    thi.child.stderr.on('error', function(data){
      thi.log("E:ERR");
      thi.log(data);
    });
    thi.child.stdout.on('error', function(data){
      thi.log("O:ERR");
      thi.log(data);
    });

    thi.child.stdout.on('data', function (data) {
      if (thi.child == null) return;
      //FIXME: this is chunked at 8K blocks
      //       plus: ezecli has to ensure flush is done when a command is done
      var buf = new Buffer(4);
      data.copy(buf,0,0,3);
      //FIXME: what if there is a larger message? endianness for intel is little
      len = 0;
      len = (len | buf.readUInt8(3)) << 24; 	  
      len = (len | buf.readUInt8(2)) << 16; 
      len = (len | buf.readUInt8(1)) << 8; 
      len = (len | buf.readUInt8(0));
      if (len > 0) {
        thi.log('[OUT] reading bytes ' + len);
        try {
          buf = new Buffer(len);
        } catch (e) {
          alert("Ezetap Driver Error: Contact Ezetap Support or Retry (" + e.message + ")");
          return;
        }
        data.copy(buf,0,4,4+len);
        var apio = thi.model.ApiOutput.decode(buf);
        thi.log('[OUT] event type ' + apio.eventType);	
        thi.ezeclibusy = 0;
		if(apio.status == thi.model.ApiOutput.ResultStatus.FAILURE) {
			var si = thi.model.StatusInfo.decode(apio.outData);
			apio = thi.model.ApiOutput.decode(buf);
			if (si.code.indexOf("SESSION_EXPIRED") != -1 || si.message.indexOf("Session invalid.") != -1) {
				thi.User.isAuthenticated = false;
			}
		}
		//fs.writeFile('logFile',JSON.stringify(apio.outData));
        switch(apio.eventType) {
          case thi.model.ApiOutput.EventType.LOGIN_RESULT:
            thi.User.isAuthenticated   = true;
            if (thi.model.ApiOutput.ResultStatus.FAILURE == apio.status) {
				var si = thi.model.StatusInfo.decode(apio.outData);
				
				console.log(si.message+" " +si.message.indexOf("logged in"))
				if (!(si.message.indexOf("logged in") != -1)) {
					console.log('Coming here *************** jbbjb')
					thi.User.isAuthenticated = false;
					thi.User.errorCode       = si.code;
					thi.User.errorText       = si.message;
					thi.User.sessk           = '';
				}
              
            } /*else {
              var si                   = thi.model.LoginOutput.decode(apio.outData);
              thi.User.sessk           = si.sessionKey;
              thi.User.loginresponse   = JSON.parse(si.settings);
              thi.User.setting         = thi.User.loginresponse.setting;
            }*/
			apio = thi.model.ApiOutput.decode(buf);
            if(thi.fn) thi.fn(apio);
            break;
          case thi.model.ApiOutput.EventType.PREPARE_DEVICE_RESULT:
            thi.Device = true;
            thi.log(" prep device result " + apio.status);
            if (thi.model.ApiOutput.ResultStatus.FAILURE == apio.status) { 
              //TODO: fix; failure reason?
              //var si = thi.model.StatusInfo.decode(apio.outData);
			  console.log('False in prepare device')
              thi.Device = false;
            } 
            if(thi.fn) thi.fn(apio);
            break;
          case thi.model.ApiOutput.EventType.LOGOUT_RESULT:
            if (thi.model.ApiOutput.ResultStatus.SUCCESS == apio.status)  {
				console.log('in logout result')
              thi.User.isAuthenticated = false;
              thi.User.sessk = '';
			  thi.ezeLaunched=false;
            }
            if(thi.fn) thi.fn(apio);
            break;
          case thi.model.ApiOutput.EventType.TXN_STATUS_RESULT:
            if(thi.fn) thi.fn(apio);
            break;
          case thi.model.ApiOutput.EventType.TXN_RESULT:
			if(thi.fn) thi.fn(apio);
            break;
          case thi.model.ApiOutput.EventType.TXN_HISTORY_RESULT:
            if(thi.fn) thi.fn(apio);
            break;
          case thi.model.ApiOutput.EventType.TXN_DETAILS_RESULT:
            if(thi.fn) thi.fn(apio);
            break;
          case thi.model.ApiOutput.EventType.VOID_TXN_RESULT:
            if(thi.fn) thi.fn(apio);
            break;
		  case thi.model.ApiOutput.EventType.ATTACH_SIGNATURE_RESULT:
            if(thi.fn) thi.fn(apio);
            break;
          case thi.model.ApiOutput.EventType.EXIT_RESULT:
            if (thi.model.ApiOutput.ResultStatus.FAILURE == apio.status) { 
              thi.log("Exiting");
              //TODO: this may not work with node js
              thi.child = null;
              process.exit;
            }
            if(thi.fn) thi.fn(apio);
            break;
          case thi.model.ApiOutput.EventType.FORWARD_RECEIPT_RESULT:
            if(thi.fn) thi.fn(apio);
            break;
          /*case thi.model.ApiOutput.EventType.API_PROGRESS:
            var si = thi.model.ProgressInfo.decode(apio.outData);
            if (8 == si.totalSteps) {
              //TODO: HACK: assume it is for device progression
              thi.triggerEventWithData('EPIC_PREPARE_DEVICE_PROGRESS', {'stepsCompleted':si.stepsCompleted,'totalSteps':si.totalSteps});
              if (si.totalSteps==si.stepsCompleted) {
                thi.Device = true;
                if(thi.fn) thi.fn(apio);
              }
            }
            break;*/
          case thi.model.ApiOutput.EventType.API_NOTIFICATION:
            thi.log("NOTIFICATION -+" +apio.notification + " : ["  + apio.msgText + "]");
            //TODO: make this generic using reflection to raise a string event 
            //      for now, do an ugly switch
            switch(apio.notification) {
              case(thi.model.ApiOutput.NotificationType.EPIC_IDENTIFYING_DEVICE):
                thi.triggerEvent('EPIC_IDENTIFYING_DEVICE');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_VALIDATING_DEVICE):
                thi.triggerEvent('EPIC_VALIDATING_DEVICE');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_PREPARING_DEVICE):
                thi.triggerEvent('EPIC_PREPARING_DEVICE');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_PREPARING_FOR_TXN):
                thi.triggerEvent('EPIC_PREPARING_FOR_TXN');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_SWIPE_OR_INSERT_CARD):
                thi.triggerEvent('EPIC_SWIPE_OR_INSERT_CARD');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_READING_DATA):
                thi.triggerEvent('EPIC_READING_DATA');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_TXN_IN_PROGRESS):
                thi.triggerEvent('EPIC_TXN_IN_PROGRESS');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_ENTER_PIN):
                thi.triggerEvent('EPIC_ENTER_PIN');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_PIN_ENTERED):
                thi.triggerEvent('EPIC_PIN_ENTERED');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_SERVER_AUTH_IN_PROGRESS):
                thi.triggerEvent('EPIC_SERVER_AUTH_IN_PROGRESS');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_DEVICE_AUTH_IN_PROGRESS):
                thi.triggerEvent('EPIC_DEVICE_AUTH_IN_PROGRESS');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_TXN_TERMINATED):
                thi.triggerEvent('EPIC_TXN_TERMINATED');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_TXN_NOT_ACCEPTED):
                thi.triggerEvent('EPIC_TXN_NOT_ACCEPTED');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_UNSUPPORTED_CARD):
                thi.triggerEvent('EPIC_UNSUPPORTED_CARD');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_CARD_NOT_SUPPORTED):
                thi.triggerEvent('EPIC_CARD_NOT_SUPPORTED');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_CARD_BLOCKED):
                thi.triggerEvent('EPIC_CARD_BLOCKED');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_CHIP_NOT_READ):
                thi.triggerEvent('EPIC_CHIP_NOT_READ');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_USE_CHIP_CARD):
                thi.triggerEvent('EPIC_USE_CHIP_CARD');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_WRONG_PIN):
                thi.triggerEvent('EPIC_WRONG_PIN');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_PIN_METHOD_BLOCKED):
                thi.triggerEvent('EPIC_PIN_METHOD_BLOCKED');
                break;
              case(thi.model.ApiOutput.NotificationType.EPIC_EXPIRED_APP):
                thi.triggerEvent('EPIC_EXPIRED_APP');
                break;
            }
            break;
          default:
            thi.log("fall through");
            if(thi.fn){
				thi.fn(apio);
			} 
        }
      }
    });

    thi.child.on('exit', function (code, signal) {
      thi.User.isAuthenticated = false;
      thi.child = null;
      process.exit;
    });

  };

  this.enable_debug = function(fn) {
    thi.fn = fn;
    thi.isLogsEnabled = true;
    if (thi.child)
      thi.cliapi(thi.model.ApiInput.MessageType.ENABLE_DEBUG, null);
    if(thi.fn) thi.fn();
  };
  this.disable_debug = function(fn) {
    thi.fn = fn;
    thi.isLogsEnabled = false;
    if (thi.child)
      thi.cliapi(thi.model.ApiInput.MessageType.DISABLE_DEBUG, null);
    if(thi.fn) thi.fn();
  };

  this.login = function(username, password, loginmode,fn) {
	
    thi.User.username = username;
    thi.User.password = password;
    thi.fn = fn;
    var li = new thi.model.LoginInput({
        'username'  : username,
        'passkey'   : password,
        'loginMode' : loginmode
    });
    thi.cliapi(thi.model.ApiInput.MessageType.LOGIN, li.encode());
  };

  this.checktxn = function(nonce, fn) {
    thi.fn = fn;
    var li = new thi.model.TxnStatusInput({
      'nonce': nonce
    });
    thi.cliapi(thi.model.ApiInput.MessageType.TXN_STATUS, li.encode());
  };

  this.paycard = function(amount, additional, fn) {
    thi.fn = fn;
    var jsn = {
        'amount'  : amount,
        'txnType' : thi.model.TxnInput.TxnType.CARD_AUTH
    };
    for (var i=0; i < thi.txnAdditionalFields.length; i++) {
      var k = thi.txnAdditionalFields[i];
      var v = additional[k];
      if (v != null) jsn[k] = v;
    }
    if(additional.hasOwnProperty('additionalData')) jsn.additionalData = JSON.stringify(additional.additionalData);
    var pi = new thi.model.TxnInput(jsn);
    thi.cliapi(thi.model.ApiInput.MessageType.TXN, pi.encode());
  };

  this.paycardCash = function(amount, amountOther, additional, fn) {
	
    thi.fn = fn;
    var jsn = {
        'amount'  : amount,
        'amountOther' : amountOther,
        'txnType' : thi.model.TxnInput.TxnType.CARD_AUTH
    };
    for (var i=0; i < thi.txnAdditionalFields.length; i++) {
      var k = thi.txnAdditionalFields[i];
      var v = additional[k];
      if (v != null) jsn[k] = v;
    }
    if(additional.hasOwnProperty('additionalData')) jsn.additionalData = JSON.stringify(additional.additionalData);
    var pi = new thi.model.TxnInput(jsn);
    thi.cliapi(thi.model.ApiInput.MessageType.TXN, pi.encode());
  };
  
  this.paycheque = function(amount, additional, fn) {
    thi.fn = fn;
    var jsn = {
        'amount'  : amount,
        'txnType' : thi.model.TxnInput.TxnType.CHEQUE
    };
    for (var i=0; i < thi.txnAdditionalFields.length; i++) {
      var k = thi.txnAdditionalFields[i];
      var v = additional[k];
      if (v != null) jsn[k] = v;
    }
    if(additional.hasOwnProperty('additionalData')) jsn.additionalData = JSON.stringify(additional.additionalData);
    var pi = new thi.model.TxnInput(jsn);
    thi.cliapi(thi.model.ApiInput.MessageType.TXN, pi.encode());
  };
  this.paycash = function(amount, additional, fn) {
    thi.fn = fn;
    var jsn = {
        'amount'  : amount,
        'txnType' : thi.model.TxnInput.TxnType.CASH
    };
    for (var i=0; i < thi.txnAdditionalFields.length; i++) {
      var k = thi.txnAdditionalFields[i];
      var v = additional[k];
      if (v != null) jsn[k] = v;
    }
    if(additional.hasOwnProperty('additionalData')) jsn.additionalData = JSON.stringify(additional.additionalData);
    var pi = new thi.model.TxnInput(jsn);
    thi.cliapi(thi.model.ApiInput.MessageType.TXN, pi.encode());
  };

  this.txnhistory = function(start_date, end_date, fn) {
	  console.log('in transaction history '+start_date+" "+end_date)
    thi.fn = fn;
    var pi = new thi.model.TxnHistoryInput({
        'strtDate': start_date,
        'endDate' : end_date
    });
    thi.cliapi(thi.model.ApiInput.MessageType.TXN_HISTORY, pi.encode());
  };
  this.txndetail = function(txnid, fn) {
    thi.fn = fn;
    var pi = new thi.model.TxnDetailsInput({
        'txnId': txnid
    });
    thi.cliapi(thi.model.ApiInput.MessageType.TXN_DETAILS, pi.encode());
  };
  this.txnvoid = function(txnid, fn) {
    thi.fn = fn;
    var pi = new thi.model.VoidTxnInput({
        'txnId': txnid
    });
    thi.cliapi(thi.model.ApiInput.MessageType.VOID_TXN, pi.encode());
  };

  this.forwardreceipt = function(txnId, customerMobile, customerEmail, fn) {
    thi.fn = fn;
    if (thi.User.isAuthenticated) {
      var pi = new thi.model.ForwardReceiptInput({
        'txnId'          : txnId,
        'customerMobile' : customerMobile,
        'customerEmail'  : customerEmail
      });
      thi.cliapi(thi.model.ApiInput.MessageType.FORWARD_RECEIPT, pi.encode());
    }
  };
  
	this.attachSignature = function(txnId, imageType, imageData, height, width, tipAmount, fn) {
    thi.fn = fn;
    if (thi.User.isAuthenticated) {
      var pi = new thi.model.SignatureInput({
        'txnId'          	: txnId,
        'imageType' 		: imageType,
        'imageBytes'  		: imageData,
		'height'			: height,
		'width'				: width,
		'tipAmount'			: tipAmount
      });
      thi.cliapi(thi.model.ApiInput.MessageType.ATTACH_SIGNATURE, pi.encode());
    }
  };
  
  this.logout = function(fn) {
    thi.fn = fn;
    if (thi.User.isAuthenticated) {
      thi.cliapi(thi.model.ApiInput.MessageType.LOGOUT, null);
    }
  };

  this.preparedevice = function(fn) {
	  console.log('coming here '+thi.User.isAuthenticated)
    thi.fn = fn;
    if (thi.User.isAuthenticated) {
		console.log('Coming here ****')
      thi.cliapi(thi.model.ApiInput.MessageType.PREPARE_DEVICE, null);
    }
  };

  this.stop = function() {
    if (!thi.child) return;
    //thi.logout();
    if (thi.child.pid) {
      thi.cliapi(thi.model.ApiInput.MessageType.EXIT, null);
      thi.child = null;
    }
  };

  this.cliapi = function(api, inp) {
    var apiin;
    if (inp === null) 
      apiin= new thi.model.ApiInput({'msgType':api}).encode().toBuffer();
    else
      apiin= new thi.model.ApiInput({'msgType':api, 'msgData': inp}).encode().toBuffer();
    /* FIXME:
    while (thi.ezeclibusy > 0) {
      //this is a stupid latch; won't work in node.js
      thi.log("try again");
      return;
    }
    */
    thi.ezeclibusy = api;
    var len = new Buffer(4);
    len.writeUInt32LE(apiin.length, 0);
    thi.pipew(len);
    thi.pipew(apiin);
    thi.log('Wrote ' + apiin.length + ' bytes');
    if (inp !== null && thi.isLogsEnabled) 
      inp.printDebug();
  };

  this.pipew = function(s) {thi.child.stdin.write(s);};

};

//module fails in nw.js environment. Hence a guard.
if (typeof(module) != 'undefined') {
  module.exports = {
    ezecli: function()  {
      return new Ezecli();
    }
  }
}

/* vim: set sw=2 ts=2 et ai : */

