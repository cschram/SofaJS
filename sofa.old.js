//
// CouchDB JavaScript Library
// Version 0.2a Copyright Corey Schram <corey@coreymedia.com> 2011
// Last Modified 5/25/2011
// Distributed under the MIT License
//
// TODO:
//   - NodeJS Support
//     - Use module.exports instead of window.Sofa in Node
//     - Use HTTP package to communicate with CouchDB instead of request
//     - NPM Package
//   - List Functions
//   - Change Notifications (?)
//     - Long Polling in the browser (?)
//     - Continuous Polling in Node (?)
//

(function (window) {
  "use strict";
  
  // Check if we're running in Node
  var isNode = (typeof module !== "undefined" && module.exports);
  
  // Wrapper object constructor
  var Sofa = function (options) {
    // Failsafe in case the 'new' keyword is forgotten
    if (this === window) {
      return new Sofa(options);
    }
    
    if (options) {
      this.options = options;
    } else {
      throw "Sofa requestuires an options argument.";
    }
  };
  
  function extend(obj) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < args.length; i++) {
      for (var prop in args[i]) {
        if (args[i].hasOwnProperty(prop) && typeof obj[prop] === "undefined") {
          obj[prop] = args[i][prop];
        }
      }
    }
    return obj;
  }
  
  if (isNode) {
  
    var http = require('http');
    request = function (options) {
      
    };
    
  } else {
    // Convenience function to make request calls
    request = function (options) {
      var xhr;
      if (window.XMLHttprequestuest) {
        xhr = new XMLHttprequestuest();
      } else {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
      }
      
      options.method = options.method || "GET";
      options.url = options.url;
      
      xhr.open(options.method, options.url, true);
      if (options.contentType) {
        xhr.setrequestuestHeader("Content-Type", options.contentType);
      } else {
        xhr.setrequestuestHeader("Content-Type", "application/json");
      }
      
      xhr.onreadystatechange = function () {
        var json = false;
        if (xhr.readyState === 4) {
          // Check if the response is JSON
          if (xhr.responseText.slice(0, 1) === "{" || xhr.responseText.slice(0, 1) === "[") {
            json = true;
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            // If OK use the Success Callback
            if (json) {
              options.success(JSON.parse(xhr.responseText));
            } else {
              options.success(xhr.responseText);
            }
          } else {
            // If there's an Error call the Error Callback if it exists
            if (options.error) {
              if (json) {
                options.error(xhr.status, JSON.parse(xhr.responseText));
              } else {
                options.error(xhr.status, xhr.responseText);
              }
            } else {
              throw "Uncaught request Error (" + xhr.status + "): " + xhr.responseText;
            }
          }
        }
      };
      
      if (options.data) {
        console.log(JSON.stringify(options.data));
        xhr.send(JSON.stringify(options.data));
      } else {
        xhr.send();
      }
      
      return xhr;
    }
  
  }
  
  // Generate a Query string
  function queryString(params) {
    var query = "?", p;
    for (p in params) {
      if (params.hasOwnProperty(p)) {
        if (query.slice(-1) !== "?") {
          query += "&";
        }
        query += p + "=";
        switch (typeof params[p]) {
        case "number":
          query += params[p];
          break;
        case "string":
          query += "\"" + params[p] + "\"";
          break;
        case "boolean":
          query += params[p] ? "true" : "false";
          break;
        default:
          query += JSON.stringify(params[p]);
          break;
        }
      }
    }
    return query;
  }
  
  //
  // Get the status of a CouchDB Server
  // Parameters:
  //   "onSuccess" - Success callback function
  //   "onError" - Error callback function (optional)
  //
  Sofa.prototype.status = function (onSuccess, onError) {
    checkConfiguration();
    request({
      method : "GET",
      path : "/",
      success : onSuccess,
      error : onError
    });
  };
  
  //
  // Get a set of UUIDs
  // Parameters:
  //   "num" - Number of UUIDs to generate
  //   "onSuccess" - Success callback function
  //   "onError" - Error callback function (optional)
  //
  Sofa.prototype.uuids = function (num, onSuccess, onError) {
    checkConfiguration();
    request({
      method : "GET",
      url : (num < 2) ? (Sofa.configuration.server + "_uuids") : (Sofa.configuration.server + "_uuids?count=" + num),
      success : function (doc) {
        onSuccess(doc.uuids);
      },
      error : onError
    });
  };
  
  //
  // Replicate a database
  // Options:
  //   "source" - Source database name
  //   "target" - Target database name
  //   "success" - Success callback function
  //   "error" - Error callback function (optional)
  //
  Sofa.prototype.replicate = function (options) {
    checkConfiguration();
    request({
      method : "POST",
      url : Sofa.configuration.server + "_replicate",
      data : {
        source : options.source,
        target : options.target
      },
      success : options.success,
      error : options.error
    });
  };
  
  //
  // Database binding constructor
  // Parameters:
  //   "database" - Database name
  //
  Sofa.prototype.DB = function (database) {
    checkConfiguration();
    if (!database) {
      throw "Sofa.DB constructor expects a database name argument.";
    }
    
    this.db = Sofa.configuration.server + database;
    // Make sure the DB url ends with "/"
    if (this.db.slice(-1) !== "/") {
      this.db = this.db + "/";
    }
  };
  
  //
  // Create a Database
  // Parameters:
  //   "onSuccess" - Success callback function
  //   "onError" - Error callback function (optional)
  //
  Sofa.prototype.DB.prototype.create = function (onSuccess, onError) {
    request({
      method : "PUT",
      url : this.db,
      success : onSuccess,
      error : onError
    });
  };
  
  //
  // Delete a Database
  // Parameters:
  //   "onSuccess" - Success callback function
  //   "onError" - Error callback funciton (optional)
  //
  Sofa.prototype.DB.prototype.del = function (onSuccess, onError) {
    request({
      method : "DELETE",
      url : this.db,
      success : onSuccess,
      error : onError
    });
  };
  
  //
  // Get all the documents in the database
  // Parameters:
  //   "onSuccess" - Success callback function
  //   "onError" - Error callback funciton (optional)
  //
  Sofa.prototype.DB.prototype.all = function (onSuccess, onError) {
    request({
      method : "GET",
      url : this.db + "_all_docs",
      success : function (doc) {
        onSuccess(doc.rows);
      },
      error : onError
    });
  };
  
  //
  // Get a document from the database
  // Parameters:
  //   "key" - Document ID
  //   "onSuccess" - Success callback function
  //   "onError" - Error callback function (optional)
  //
  Sofa.prototype.DB.prototype.get = function (key, onSuccess, onError) {
    request({
      method : "GET",
      url : this.db + key,
      success : onSuccess,
      error : onError
    });
  };
  
  //
  // Save a document into the database
  // Parameters:
  //   "doc" - Document object
  //   "onSuccess" - Success callback function
  //   "onError" - Error callback function (optional)
  //
  Sofa.prototype.DB.prototype.save = function (doc, onSuccess, onError) {
    if (doc._id) {
      // If the ID exists overwrite the old version
      request({
        method : "PUT",
        url : this.db + doc._id,
        data : doc,
        success : onSuccess,
        error : onError
      });
    } else {
      // If the ID doesn't exist create a new Document
      request({
        method : "POST",
        url : this.db,
        data : doc,
        success : function (response) {
          doc._id = response.id;
          doc._rev = response.rev;
          onSuccess(response);
        },
        error : onError
      });
    }
  };
  
  //
  // Run a View Method
  // Options:
  //   "doc" - Design document name
  //   "view" - View function name
  //   "params" - Object containing query string parameters (optional)
  //   "success" - Success callback function
  //   "error" - Error callback function (optional)
  //
  Sofa.prototype.DB.prototype.view = function (options) {
    var viewURL = this.db + "_design/" + options.doc + "/_view/" + options.view;
    if (options.params) {
      viewURL += queryString(options.params);
    }
    request({
      method : "GET",
      url : viewURL,
      success : function (response) {
        options.success(response.rows, response);
      },
      error : options.error
    });
  };
  
  //
  // Run a Show Method
  // Options:
  //   "doc" - Design document name
  //   "show" - Show function name
  //   "id" - ID of the document to show (optional)
  //   "params" - Object containing query string parameters (optional)
  //   "success" - Success callback function
  //   "error" - Error callback function (optional)
  //
  Sofa.prototype.DB.prototype.show = function (options) {
    var showURL = this.db + "_design/" + options.doc + "/_show/" + options.show;
    if (options.id) {
      showURL += "/" + options.id;
    }
    if (options.params) {
      showURL += queryString(options.params);
    }
    request({
      method : "GET",
      url : showURL,
      success : options.success,
      error : options.error
    });
  };
  
  // Expose Sofa
  if (isNode) {
    module.exports = Sofa;
  } else {
    window.Sofa = Sofa;
  }
  
}(this));