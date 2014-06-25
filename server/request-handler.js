/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */
var fs = require('fs');
var path = require('path');
// var storage = {results: []};
// var qs = require('querystring');


exports.handler = function(request, response) {

  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  var responseBody;

  if (request.url === '/') {
    var clientHTML = fs.readFileSync('../client/index.html');
    completeResponse(200, response, clientHTML, 'text/HTML');
  }
  else if (request.url === '/classes/messages' || request.url === '/classes/room1'){
    if (request.method === 'OPTIONS'){
      completeResponse(201, response, '');
    }
    else if (request.method === 'POST') {
      var body = '';
      request.on('data', function (data) {
        body += data;
      });
      request.on('end', function () {
        var storage = fs.readFileSync('./storage.txt');
        storage = JSON.parse(storage);
        var newMessage = JSON.parse(body);
        newMessage.createdAt = new Date().toISOString();
        storage.results.unshift(newMessage);
        fs.writeFileSync('./storage.txt', JSON.stringify(storage));
        completeResponse(201, response, '"success"');
      });
    }
    else if (request.method === 'GET') {
      responseBody = fs.readFileSync('./storage.txt');
      completeResponse(200, response, responseBody);
    }
  }
  else {
    var url = '../client' + request.url;
    fs.exists(url, function(exists) {
      console.log(url);
      if (exists) {
        var clientHTML = fs.readFileSync(url);
        var contentType = 'text/HTML';
        if (path.extname(url) === '.js') {
          contentType = 'text/javascript';
        }
        else if (path.extname(url) === '.css') {
          contentType = 'text/css';
        }
        completeResponse(200, response, clientHTML, contentType);
      }
      else {
        completeResponse(404, response, 'Not Found');
      }
    });
  }
};

var completeResponse = function(statusCode, response, responseBody, contentType) {
  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = contentType || 'application/json';

  /* .writeHead() tells our server what HTTP status code to send back */
  response.writeHead(statusCode, headers);

  /* Make sure to always call response.end() - Node will not send
   * anything back to the client until you do. The string you pass to
   * response.end() will be the body of the response - i.e. what shows
   * up in the browser.*/
  response.end(responseBody);
};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
