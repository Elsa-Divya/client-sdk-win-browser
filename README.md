# Client-sdk-win-browser

SDK to integrate Ezetap Device on windows platform for Browser(JavaScript)/REST.

#Architecture
There are 3 components involved :-

1. Client(Browser)
2. Server(NodeJS)
3. Driver(Ezetap Device)

Ezetap Server (NodeJS) hosts a bunch of REST APIs to communicate with the Ezetap driver, these REST APIs can be used directly or through JS APIs. 

## Getting Started
1. Download ````Server.zip```` and ````EzeAPI.js```` from the release section.
2. Ezetap app key (Demo/Prod keys)
3. Windows compatible Ezetap Device 


##Usage
First start the server, to start **Ezetap** server unzip ````server.zip```` and double click on **Ezetap.exe**. This will start up a cli interface displaying a server start message.

There are two ways to integrate Ezetap device with your solution to start taking payments.

#Javascript Usage

You can include ````EzeAPI.js```` in your project and start calling the APIs. For ````EzeAPI```` Docs, please refer to <a>API Docs Section</a>


 
>Note:- EzeAPI.js is dependent on Jquery, so dont forget to include jquery in your project.


#REST
You can also call REST services directly from your project. For ````REST```` ,please refer to <a>REST API Docs</a>

##Sample Web Application
There is a sample Web application inside the sample folder of the repository. You can use this project as a reference to integrate Ezetap SDK.

