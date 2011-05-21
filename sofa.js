//
// Author: Corey Schram <corey@coreymedia.com>
// Description: Framework-agnostic library to conveniently access CouchDB through AJAX
//
// Last Modified 5/21/2011
//

(function (window) {
  "use strict";
  var Sofa = {
    server : "unknown"
  };
  
  // Convenience function to make AJAX calls
  function ajax(options) {
    var xhr;
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else {
      xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    options.method = options.method || "GET";
    options.url = options.url || Sofa.server;
    
    xhr.open(options.method, options.url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onreadystatechange = function () {
      var json = false;
      if (xhr.readyState === 4) {
        if (xhr.responseText.slice(0, 1) === "{" || xhr.responseText.slice(0, 1) === "[") {
          json = true;
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          if (options.success) {
            if (json) {
              options.success(JSON.parse(xhr.responseText));
            } else {
              options.success(xhr.responseText);
            }
          }
        } else {
          if (options.error) {
            if (json) {
              options.error(xhr.status, JSON.parse(xhr.responseText));
            } else {
              options.error(xhr.status, xhr.responseText);
            }
          } else {
            throw "Uncaught AJAX Error (" + xhr.status + "): " + xhr.responseText;
          }
        }
      }
    };
    
    if (options.data) {
      xhr.send(JSON.stringify(options.data));
    } else {
      xhr.send();
    }
    
    return xhr;
  }
  
  // Generate a Query string
  function queryString(params) {
    var query = "?", param;
    for (param in params) {
      if (params.hasOwnProperty(param)) {
        if (query.slice(-1) !== "?") {
          query += "&";
        }
        query += param + "=";
        switch (typeof params[param]) {
        case "number":
          query += params[param];
          break;
        case "string":
          query += "\"" + params[param] + "\"";
          break;
        case "boolean":
          query += params[param] ? "true" : "false";
          break;
        default:
          query += JSON.stringify(params[param]);
          break;
        }
      }
    }
    return query;
  }
  
  // Get the status of a CouchDB Server
  Sofa.getStatus = function (onSuccess, onError) {
    ajax({
      method : "GET",
      url : Sofa.server,
      success : onSuccess,
      error : onError
    });
  };
  
  // Get a set of UUIDs
  Sofa.getUUIDs = function (num, onSuccess, onError) {
    ajax({
      method : "GET",
      url : (num < 2) ? (Sofa.server + "_uuids") : (Sofa.server + "_uuids?count=" + num),
      success : function (doc) {
        onSuccess(doc.uuids);
      },
      error : onError
    });
  };
  
  // Replicate a database
  Sofa.replicate = function (options) {
    ajax({
      method : "POST",
      url : Sofa.server + "_replicate",
      data : {
        source : options.source,
        target : options.target
      },
      success : options.success,
      error : options.error
    });
  };
  
  // Database binding constructor
  Sofa.DB = function (database) {
    if (!database) {
      throw "Sofa Database constructor expects a database name argument.";
    }
    
    this.db = Sofa.server + database;
    if (this.db.slice(-1) !== "/") {
      this.db = this.db + "/";
    }
  };
  
  // Create a Database
  Sofa.DB.prototype.create = function (onSuccess, onError) {
    ajax({
      method : "PUT",
      url : this.db,
      success : onSuccess,
      error : onError
    });
  };
  
  // Delete a Database
  Sofa.DB.prototype.del = function (onSuccess, onError) {
    ajax({
      method : "DELETE",
      url : this.db,
      success : onSuccess,
      error : onError
    });
  };
  
  // Get a document from the database
  Sofa.DB.prototype.get = function (key, onSuccess, onError) {
    ajax({
      method : "GET",
      url : this.db + key,
      success : onSuccess,
      error : onError
    });
  };
  
  // Save a document into the database
  Sofa.DB.prototype.save = function (doc, onSuccess, onError) {
    if (doc._id) {
      ajax({
        method : "PUT",
        url : this.db + doc._id,
        data : doc,
        success : onSuccess,
        error : onError
      });
    } else {
      ajax({
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
  
  // Run a View Method
  Sofa.DB.prototype.view = function (options) {
    var viewURL = this.db + "_design/" + options.doc + "/_view/" + options.view;
    if (options.params) {
      viewURL += queryString(options.params);
    }
    ajax({
      method : "GET",
      url : viewURL,
      success : function (response) {
        options.success(response.rows, response);
      },
      error : options.error
    });
  };
  
  // Run a Show Method
  Sofa.DB.prototype.show = function (options) {
    var showURL = this.db + "_design/" + options.doc + "/_show/" + options.show;
    if (options.id) {
      showURL += "/" + options.id;
    }
    if (options.params) {
      showURL += queryString(options.params);
    }
    ajax({
      method : "GET",
      url : showURL,
      success : options.success,
      error : options.error
    });
  };
  
  // Expose Sofa to the global object
  window.Sofa = Sofa;
  
}(this));