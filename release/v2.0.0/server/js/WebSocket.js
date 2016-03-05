function ServerSentEvents(ezecliInstance,port){
	var WebSocketServer = require('websocket').server;
	var http = require('http');
	 
	var server = http.createServer(function(request, response) {
		console.log((new Date()) + ' Received request for ' + request.url);
		response.writeHead(404);
		response.end();
	});
	server.listen(port, function() {
		console.log((new Date()) + ' Server is listening on port '+port);
	});
	 
	wsServer = new WebSocketServer({
		httpServer: server,
		autoAcceptConnections: false
	});

	wsServer.on('request', function(request) {
		var connection = request.accept(null, request.origin);
		ezecliInstance.ee.on("EPIC_VALIDATING_DEVICE"  , 		function(){connection.sendUTF('Authenticating Device')});
		ezecliInstance.ee.on("EPIC_IDENTIFYING_DEVICE"  , 		function(){connection.sendUTF('Identifying Device')});
		ezecliInstance.ee.on("EPIC_PREPARING_DEVICE"      ,	function(){connection.sendUTF('Preparing Device')});
		ezecliInstance.ee.on("EPIC_PREPARING_FOR_TXN"    ,      function(){connection.sendUTF('Preparing for transaction')});
		ezecliInstance.ee.on("EPIC_SWIPE_OR_INSERT_CARD" ,     function(){connection.sendUTF('Please swipe or insert Card')});
		ezecliInstance.ee.on("EPIC_READING_DATA"        ,      function(){connection.sendUTF('Reading Device...')});
		ezecliInstance.ee.on("EPIC_TXN_IN_PROGRESS"       ,    function(){connection.sendUTF('In Progress...')});
		ezecliInstance.ee.on("EPIC_ENTER_PIN"            ,     function(){connection.sendUTF('Please enter PIN in <span id="timer">30</span> seconds')});
		ezecliInstance.ee.on("EPIC_PIN_ENTERED"           ,    function(){connection.sendUTF('PIN Entered')});
		ezecliInstance.ee.on("EPIC_SERVER_AUTH_IN_PROGRESS",   function(){connection.sendUTF('Authorization in progress')});
		ezecliInstance.ee.on("EPIC_DEVICE_AUTH_IN_PROGRESS",   function(){connection.sendUTF('Receiving Authorization')});
		ezecliInstance.ee.on("EPIC_PREPARE_DEVICE_PROGRESS",   function(){connection.sendUTF('Preparing Device')});
		ezecliInstance.ee.on("EPIC_TXN_TERMINATED"  ,          function(){connection.sendUTF('Transaction Terminated. Please Swipe or Insert card again.')});
		ezecliInstance.ee.on("EPIC_TXN_NOT_ACCEPTED"  ,        function(){connection.sendUTF('Transaction not accepted')});
		ezecliInstance.ee.on('EPIC_UNSUPPORTED_CARD',          function(){connection.sendUTF('Card Not Supported. Use Different Card...')});
		ezecliInstance.ee.on('EPIC_CARD_NOT_SUPPORTED',        function(){connection.sendUTF('Card Not Supported. Use Different Card...')});
		ezecliInstance.ee.on('EPIC_CARD_BLOCKED',              function(){connection.sendUTF('EPIC_CARD_BLOCKED')});
		ezecliInstance.ee.on('EPIC_CHIP_NOT_READ',             function(){connection.sendUTF('Cannot read chip. Please Swipe instead.')});
		ezecliInstance.ee.on('EPIC_USE_CHIP_CARD',             function(){connection.sendUTF('Use chip Card...')});
		ezecliInstance.ee.on('EPIC_WRONG_PIN',                 function(){connection.sendUTF('Pin Enterred is wrong...')});
		ezecliInstance.ee.on('EPIC_PIN_METHOD_BLOCKED',        function(){connection.sendUTF('EPIC_PIN_METHOD_BLOCKED')});
		ezecliInstance.ee.on('EPIC_EXPIRED_APP',               function(){connection.sendUTF('EPIC_EXPIRED_APP')});
		
	});
	
}

module.exports = {
    start: function(ezecli,port)  {
		return new ServerSentEvents(ezecli,port);
    }
  }