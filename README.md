# Client-sdk-win-browser

SDK to integrate Ezetap Device on windows platform for Browser(JavaScript)/REST.

#Architecture
There are 3 components involved :-

1. Client(Browser)
2. Server(NodeJS)
3. Driver(Ezetap Device)

Ezetap Server (NodeJS) hosts a bunch of REST APIs to communicate with the Ezetap device, these REST APIs can be used directly or through JS APIs. 

## Getting Started
1. Download ````Server.zip```` and ````EzeAPI.js```` from the release section.
2. Ezetap app key (Demo/Prod keys)
3. Windows compatible Ezetap Device 

##Prerequisites
1. Download Node Server from Releases folder (node_server->node-v4.4.0-x64.msi), Double click and follow the instructions to install.

2. After node Installation, open script folder and Double click on install.bat.

##Server Setup
First start the server, to start **Ezetap** server unzip ````server.zip```` and double click on **Ezetap.exe**. This will start up a cli interface.

By default, Ezetap Server runs on 8081 port <a>http://localhost:8081</a>, it also makes use of <a href="https://en.wikipedia.org/wiki/WebSocket">WebSockets</a> to push **Notifications** from Device, by default websocket pushes to **1337** port. Both these ports are configurable.

###JSON Configuration 
To configure **Ezetap Server** port and **Websocket** port. Go to **config** folder inside **server** folder and change the default configuration.



	{
		"httpPort":"8081",
		"wsPort":"1337"
	}

>**Note**:- If you change the ports on server side, make sure you use the same ports on client side as well.


#Usage
There are two ways to integrate Ezetap device with your solution to start taking payments.
##Javascript Usage

You can include ````EzeAPI.js```` in your project and start calling the APIs. For ````EzeAPI```` Docs, please refer to <a href="http://developers.ezetap.com/api/?javascript#initialize">API Docs Section</a>


 
>Note:- EzeAPI.js is dependent on Jquery, so dont forget to include jquery in your project.


##REST
You can also call REST services directly from your project. For ````REST```` ,please refer to <a href="http://developers.ezetap.com/api/?conf#initialize">REST API Docs</a>

##Sample Web Application
There is a sample Web application inside the sample folder of the repository. You can use this project as a reference to integrate Ezetap SDK.

