//
// Author: Corey Schram <corey@coreymedia.com>
// Description: Framework-agnostic library to conveniently access CouchDB through AJAX
//
// Last Modified 5/18/2011
//

(function (window) {
  "use strict";
  var Sofa = {};
  
  // Convenience function to create an XHR object
  function createXHR(callback) {
    var xhr;

    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else {
      xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }

    if (callback) {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            callback(null, JSON.parse(xhr.responseText));
          } else {
            callback("Error Code " + xhr.status + ": " + xhr.responseText);
          }
        }
      };
    }

    return xhr;
  }
  
  // Generate a random ID for a document
  // Taken from jq-couchdb
  function generateId() {
    var rk = Math.floor(Math.random() * 4013);
    return (10016486 + (rk * 22423));
  }
  
  // Get the status of a CouchDB Server
  // @param {String} server Address of the CouchDB Server
  // @param {Function} callback Callback to call when the status is retrieved
  // @type Function
  Sofa.getStatus = function (server, callback) {
    var xhr = createXHR(callback);
    xhr.open("GET", server, true);
    xhr.send();
  };
  
  // Replicate a database
  // @param {String} server Address of the CouchDB Server
  // @param {String} source Name or Address of the source database
  // @param {String} target Name or Address of the target database
  // @param {Function} callback Callback to call when the replication is completed
  // @type Function
  Sofa.replicate = function (server, source, target, callback) {
    var xhr = createXHR(callback);
    xhr.open("POST", server, true);
    xhr.send('{"source":"' + source + '","target":"' + target + '"}');
  };
  
  // Database binding constructor
  // @param {String} database Address of the CouchDB database
  // @returns Database Object
  // @type Function
  Sofa.DB = function (database) {
    if (!database) {
      throw "Sofa Database constructor expects a database name argument.";
    }
    
    this.db = database;
    if (this.db.slice(-1) !== "/") {
      this.db = this.db + "/";
    }
  };
  
  // Create a Database
  // @param {Function} callback Callback to call when the database is created
  // @type Function
  Sofa.DB.prototype.create = function (callback) {
    var xhr = createXHR(callback);
    xhr.open("PUT", this.db, true);
    xhr.send();
  };
  
  // Delete a Database
  // @param {Function} callback Callback to call when the database is deleted
  // @type Function
  Sofa.DB.prototype.del = function (callback) {
    var xhr = createXHR(callback);
    xhr.open("DELETE", this.db, true);
    xhr.send();
  };
  
  // Get a document from the database
  // @param {Mixed}(String/Integer) key Document key
  // @param {Function} callback Callback to call when the document is retrieved
  // @type Function
  Sofa.DB.prototype.get = function (key, callback) {
    var xhr = createXHR(callback);
    xhr.open("GET", this.db + key, true);
    xhr.send();
  };
  
  // Save a document into the database
  // @param {Object} doc Document to save
  // @param {Function} callback Callback to call when the document is saved
  // @type Function
  Sofa.DB.prototype.save = function (doc, callback) {
    var xhr = createXHR(callback), id;
    if (doc._id) {
      id = doc._id;
    } else {
      id = generateId();
      doc._id = id;
    }
    xhr.open("PUT", this.db + id, true);
    xhr.send(JSON.stringify(doc));
  };
  
  // Make an arbitrary request to the database
  // @param {String} method HTTP Method
  // @param {String} path URL Path to send to
  // @param {Object} body JSON Body to send
  // @param {Function} callback Callback to call when the request in completed
  // @type Function
  Sofa.DB.prototype.request = function (method, path, body, callback) {
    var xhr = createXHR(callback);
    xhr.open(method, this.db + path, true);
    xhr.send(body);
  };
  
  // Expose Sofa to the global object
  window.Sofa = Sofa;
  
}(this));