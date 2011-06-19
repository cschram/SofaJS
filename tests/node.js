var console = require("console"),
    nodeunit = require("nodeunit"),
    Sofa = require("../sofa");

var Server = new Sofa.Server({
      user : "test",
      pass : "123abc",
      host : "sofajs.iriscouch.com",
      port : 80
    }),
    DB = new Sofa.Database(Server, "test"),
    existing_doc;

// Server Status Test
exports.ServerStatus = function (test) {
  Server.status(function (res) {
    test.ok(true, res.ok);
    test.done();
  });
};

// Generate UUID Test
exports.UUIDs = function (test) {
  test.expect(2);
  Server.uuids(10, function (res) {
    test.ok(true, res.ok);
    test.ok(true, (res.uuids.length === 10));
    test.done();
  });
};

// Document Tests
exports.Documents = {
  // All Documents Test
  All : function (test) {
    DB.all(function (res) {
      test.ok(true, res.ok);
      test.done();
    });
  },
  // Create New Document Test
  Create : function (test) {
    DB.save({foo:"bar"}, function (res) {
      test.ok(true, res.ok);
      test.done();
    });
  },
  // Get Document Test
  Get : function (test) {
    DB.get("existing_doc", function (res) {
      existing_doc = res;
      test.ok(true, (typeof res._id !== "undefined"));
      test.done();
    });
  },
  // Save Document Test
  Save : function (test) {
    existing_doc.edited = Date.now();
    DB.save(existing_doc, function (res) {
      test.ok(true, res.ok);
      test.done();
    });
  },
  // View Test
  View : function (test) {
    test.expect(2);
    DB.view({
      doc : "sofa",
      view : "test",
      params : {
        descending : true
      },
      callback : function (rows, res) {
        test.ok(true, res.ok);
        test.ok(true, (rows.length > 0));
        test.done();
      }
    });
  },
  // Show Test
  Show : function (test) {
    test.expect(2);
    DB.show({
      doc : "sofa",
      show : "updated",
      id : "existing_doc",
      callback : function (res) {
        test.ok(true, (typeof res.error === "undefined"));
        test.ok(true, (typeof res === "string"));
        test.done();
      }
    });
  }
};

// Database Tests
exports.DatabaseManipulation = nodeunit.testCase({
  setUp : function (cb) {
    this.DB = new Sofa.Database(Server, "test_backup");
    cb();
  },
  // Create Database Test
  Create : function (test) {
    this.DB.create(function (res) {
      test.ok(true, res.ok);
      test.done();
    });
  },
  // Replicate Database Test
  Replicate : function (test) {
    DB.replicate("test_backup", function (res) {
      test.ok(true, res.ok);
      test.done();
    });
  },
  // Delete Database Test
  "Delete" : function (test) {
    this.DB.del(function (res) {
      test.ok(true, res.ok);
      test.done();
    });
  }
});
