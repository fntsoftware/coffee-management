/**************************************
* This is an adapter, which listens on http
* to put json data into the internal event bus
**************************************/
module.exports = function (bus) {
    console.log("Json Adapter loaded"); 
    
    const INCOMMING_POT_EVENT = 'incommingPot';
    const MAP_EVENT = 'map';
    var http = require('http');

    //Lets define a port we want to listen to
    const PORT=8083; 

    //We need a function which handles requests and send response
    function handleRequest(request, response){
        
        if (request.method == 'POST') {
            var body = '';

            request.on('data', function (data) {
                body += data;
                
                // Too much POST data, kill the connection!
                // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                if (body.length > 1e6)
                    request.connection.destroy();
            });
            
            request.on('end', function () {
                // Parse body data to json
                var postData = JSON.parse(body);
                
                if(postData.type && postData.type === INCOMMING_POT_EVENT && postData.tagId)
                {
                    // Create bus data 
                    busData = {
                        "type": MAP_EVENT,
                        "tagId": postData.tagId
                    }
                    
                    // Send on bus
                    bus.post(busData);
                }
            });
        }           
        
        response.end('Message received');
    }

    //Create a server
    var server = http.createServer(handleRequest);

    //Lets start our server
    server.listen(PORT, function(){
        //Callback triggered when server is successfully listening.
        console.log("Json Adapter listening on: http://localhost:%s", PORT);
    });
};

