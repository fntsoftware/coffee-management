## Synopsis

**TBD**

## Code Example

**TBD**

## Motivation

**TBD**

## Installation

### Chrome Extension
Open Chrome browser and open link: https://chrome.google.com/webstore/detail/fnt-coffee-pot-tracking-p/iondigdoncdlbdmcandbpocpkffdnnod.
Click on Add.

This extension try's to connect to WS connection, which is started by node server.

### Server 
You need node.js to use this server. If not installed yet go to https://nodejs.org/en/ and install node.js. 

Go to directory `server`.

Install node dependencies: 
```
npm install
```

Install PM2 process manager:
```
npm install pm2 -g
```

To start/stop the complete server via Pm2 (and list running processes):

```
pm2 start system.json
pm2 list
pm2 stop system.json
```

If you want to see the output of the processes then type:
```
pm2 logs 
```

Try connection: 
* Open Postman
* Select POST
* URL: http://localhost:8083
* Add Header: `Content-Type`: `application/json`
* Add Body: ```{
  "type": "incommingPot",
  "tagId": "0000028C028C"
}```
* Click Send



## Tests

**TBD**

## Contributors

Contributors are the members of the **"FNT Coffeesnitch Lab Team"**.

## License

[![MIT License](http://img.shields.io/badge/license-MIT-green.svg) ](./LICENSE)

