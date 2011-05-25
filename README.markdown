SofaJS
======
SofaJS is a JavaScript library that makes it easy to communicate with a CouchDB server. It allows you to
easily do most functions in the CouchDB REST API including manipulating documents, running views, and
authentication (plus more).

Configuration
-----
    Sofa.config({
      server : "http://yoursite.com/db/"
    });
Before you can use SofaJS you must configure it. For now the only option is "server" which is the URL of your
CouchDB server.

Server Status
-------------
    // Sofa.status(success[, error]);
    Sofa.status(function (response) {
      console.log(response.couchdb + " " + response.version);
    }, function (status, message) {
      console.error(status + ": " + message);
    });
 
Get UUIDs
---------
    // Sofa.uuids(num, success[, error]);
    Sofa.uuids(5, function (uuids) {
      for (var i = 0; i < 5; i++) {
        docs[i]._id = uuids[i];
      }
    }, function (status, message) {
      console.error(status + ": " + message);
    });
 
Database Replication
--------------------
    // Sofa.replicate(options);
    Sofa.replicate({
      source : "foo",
      target : "foo_backup",
      success : function (response) {
        console.log("Database Backed Up: " + response);
      },
      error : function (status, message) {
        console.error(status + ": " + message);
      }
    });
 
Database Binding
----------------
    // new Sofa.DB(name);
    var db = new Sofa.DB("foo");
Sofa.DB is the binding required to interact with a CouchDB Database.

### Create
    // db.create(success[, error]);
    db.create(function (response) {
      console.log("Database Created: " + response);
    }, function (status, message) {
      console.error(status + ": " + message);
    });
Create the database if it doesn't already exist.

### Delete
    // db.del(success[, error]);
    db.del(function (response) {
      console.log("Database Deleted: " + response);
    }, function (status, message) {
      console.error(status + ": " + message);
    });
Delete the database if it exists.

### Get a Document
    // db.get(id, success[, error]);
    db.get("336cccfbb206207c0a950db5fd09cda7", function (doc) {
      console.log("Retrieved Document: " + doc);
    }, function (status, message) {
      console.log(status + ": " + message);
    });
 
### Save a Document
    // db.save(doc, success[, error]);
    db.save(doc, function (response) {
      console.log("Saved Document: " + response);
    }, function (status, message) {
      console.error(status + ": " + message);
    });
`db.save` does not require an id for the document; if one doesn't exist it will get one from the server.
However, if the document does have an id it also requires a revision id.

### Execute a View
    // db.view(options);
    db.view({
      doc : "myDesignDocument",
      view : "foo",
      params : {
        startkey : "336cccfbb206207c0a950db5fd09cda7",
        endkey : "bb747b8bf26876442bbe34cd3f003073"
      },
      success : function (rows, response) {
        console.log("Retrieved Rows: " + rows);
      },
      error : function (status, message) {
        console.error(status + ": " + message);
      }
    });
 
### Execute a Show
    // db.show(options);
    db.show({
      doc : "myDesignDocument",
      show : "foo",
      id : "336cccfbb206207c0a950db5fd09cda7",
      success : function (result) {
        document.getElementById("main").innerHTML = result;
      },
      error : function (status, message) {
        console.error(status + ": " + message);
      }
    });