(function () {
  "use strict";
  var request,
      requestDefaults = {
        path : "/",
        method : "GET",
        contentType : "application/json"
      };
  
  if (typeof module !== "undefined" && module.exports) {
    //// NodeJS Setup ////
    var http = require("http");
    request = function (options) {
      options.prototype = requestDefaults;
      // Make HTTP Request
      var req = http.request(options, function (res) {
        res.setEncoding("utf8");
        var body = "";
        res.on("data", function (chunk) {
          body += chunk;
        });
        res.on("end", function () {
          if (body.slice(0, 1) === "{" || body.slice(0, 1) === "[") {
            // If the response is JSON, parse it
            options.callback(JSON.parse(body), res.statusCode);
          } else {
            // Otherwise return the response text as is
            options.callback(body, res.statusCode);
          }
        });
      });
      
      if (options.data) {
        req.write(options.data);
      }
      req.end();
    };
  } else {
    //// Browser Setup ////
    if (typeof JSON === "undefined") {
      console.error("JSON is undefined, json2.js or equivalent needs to be loaded.");
    }

    request = function (options) {
      options.prototype = requestDefaults;
      var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
      
      var path = options.host;
      if (options.port !== 80) {
        path += ":" + options.port;
      }
      path += options.path;
      
      xhr.open(options.method, path, true);
      xhr.setRequestHeader("Content-Type", options.contentType);
      
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.responseText.slice(0, 1) === "{" || xhr.responseText.slice(0, 1) === "[") {
            // If the response is JSON, parse it
            options.callback(JSON.parse(xhr.responseText), xhr.status);
          } else {
            // Otherwise return the response text as is
            options.callback(xhr.responseText, xhr.status);
          }
        }
      };
      
      if (options.data) {
        xhr.send(JSON.stringify(options.data));
      } else {
        xhr.send();
      }
    };
  }
  
  var Sofa = function (options) {
    if (options.server.slice(-1) === "/") {
      this.server = options.server.slice(0, this.server.length - 2);
    } else {
      this.server = options.server;
    }
    
    this.port = options.port || 5984;
  };
  
  Sofa.prototype.status = function (cb) {
    request({
      host : this.server,
      port : this.port,
      path : "/",
      method : "GET",
      callback : cb
    });
  };
  
}());