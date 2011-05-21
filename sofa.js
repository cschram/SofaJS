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
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          options.success && options.success(JSON.parse(xhr.responseText), xhr.responseText);
        } else {
          options.error && options.error(xhr.status, xhr.responseText);
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
      error : function (status, response) {
        if (onError) {
          onError(status, response);
        } else {
          throw "Uncaught AJAX Error (" + status + "): " + response;
        }
      }
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
  Sofa.DB.prototype.save = function (doc, options) {
    if (doc._id) {
      ajax({
        method : "PUT",
        url : this.db + doc._id,
        data : doc,
        success : options.success,
        error : options.error
      });
    } else {
      var self = this;
      Sofa.getUUIDs(1, function (uuids) {
        doc._id = uuids[0];
        ajax({
          method : "PUT",
          url : self.db + doc._id,
          data : doc,
          success : options.success,
          error : options.error
        });
      });
    }
  };
  
  // Expose Sofa to the global object
  window.Sofa = Sofa;
  
}(this));