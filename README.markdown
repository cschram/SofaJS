SofaJS
======
SofaJS is a JavaScript library that makes it easy to communicate with a CouchDB server. It allows you to
easily do most functions in the CouchDB REST API including manipulating documents, running views, etc.

Getting Started
===============
First of all, if you're in Node, you need to include Sofa:
    var Sofa = require("sofa");

From there you need to create a Server object:
    var Server = new Sofa.Server({
          user : "myuser", // Optional (Only if you want to use Basic Auth)
          pass : "abc123", // Also Optional
          host : "omgcouchdb.iriscouch.com", // The location of your CouchDB Server
          port : 80 // The default is 5984
        });
Take note that in the browser you can put all of this into the `host` value, like this: `myuser:abc123@localhost:8080/db`.
If you plan to use a different port than port 80 then you will probably need to do this in the browser.

Then you can create a Database object:
    var DB = new Sofa.Database(Server, "mydatabase");
The Database constructor requires a Sofa.Server object and the name of the Database.

Server Methods
==============

Server Status
-------------
    Server.status(function (res) {
      if (res.ok) {
        console.log("CouchDB is ok!");
      } else {
        console.error("CouchDB is not ok! :(");
      }
    });
This will return the status of the CouchDB Server.

Generate UUIDs
--------------
    Server.uuids(10, function (res) {
      console.log("OMG I got a UUID, look! " + res.uuids[0]);
    });
This will fetch some generated UUIDs from CouchDB. There is also a shortcut in case you want to only generate one:
    Server.uuid(function (res) {
      console.log("One babby UUID: " + res.uuid);
    });
    
Database Methods
================
The first three methods listed are only available in NodeJS for security purposes.

Create A Database
-----------------
    DB.create(function (res) {
      console.log("Database Created (H)");
    });

Delete A Database
-----------------
    DB.del(function (res) {
      console.log("Took out that punk Database");
    });
    
Replicate A Database
--------------------
    DB.replicate("mydatabase_backup", function (res) {
      console.log("Totes replicated the database");
    });

---

The following methods are available in Node and the browser.

List All Documents
------------------
    DB.all(function (res) {
      for (var i = 0; i < res.rows.length; i++) {
        console.log("Look, a doc! " + res.rows[i].id);
      }
    });
    
Get A Document
--------------
    DB.get("DOC_ID_OMG", function (res) {
      console.log("Found dat doc " + res._id);
    });
    
Save A Document
---------------
    DB.save({sofajs:"is legit"}, function (res) {
      console.log("Document is savvedd");
    });
`DB.save` will save a document regardless of whether there is an _id or not. If there isn't it will use POST and set the _id afterwards. If there is already an _id it will use PUT and overwrite the existing doc in the database. Either way, the _rev value will be set when the operation is finished.

Execute A View Function
-----------------------
    DB.view({
      doc : "sofa", // The Design Document name where the doc's id is "_design/doc"
      view : "test", // The View function name
      params : { // Query String parameters (optional)
        descending : true
      },
      callback : function (rows, res) {
        for (var i = 0; i < rows.length; i++) {
          console.log("OMG got view row " + rows[i].key);
        }
      }
    });

Execute A Show Function
-----------------------
    DB.show({
      doc : "sofa",
      show : "omghtml",
      id : "somedocid", // ID of the document to pass (optional)
      callback : function (res) {
        console.log("Lookie what the Show Function gave me! " + res);
      }
    });
`DB.show`, like `DB.view`, will also take an object of query string parameters.

TODO
====
 * Test in the Browser
 * Cookie Authentication? (Maybe through an additional library)
 * List Functions?
 * Wacky CouchDB File Upload Stuff?
 * ???
 * You tell me!
 
Any and all suggestions are welcome, so if you have any comments about this library please don't hesitate to tell me on Twitter (@coreyschram) or Email (corey@coreymedia.com).
