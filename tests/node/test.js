var Sofa = require("../../sofa");

var DB = new Sofa({ server : "http://test:123abc@sofajs.iriscouch" });

DB.status(function (status, res) {
  if (status === 200) {
    console.log("CouchDB Version " + res.version + ": " + res.couchdb);
  } else {
    console.error("Error " + status);
  }
});