var expect = require('chai').expect;
var utils = require('../lib/utils');

describe("utils", function() {

  describe("#markupToRegex", function() {

    it("should return a regex that matches ");

  });

  describe("#getPositionOfCapturingGroup", function() {

    var testData = {
      "@[__display__](__id__)" : { display: 0, id: 1, type: null },
      "@[__display__](__type__:__id__)" : { display: 0, id: 2, type: 1 },
      "{{__id__#__display__}}" : { display: 1, id: 0, type: null },
      "{{__id__}}" : { display: 0, id: 0, type: null },
      "{{__display__}}" : { display: 0, id: 0, type: null }
    };

    for(var key in testData) {
      if(!testData.hasOwnProperty(key)) continue;

      (function() {
        var markup = key;
        var positions = testData[key];
  
        it("should return " + positions.display + " for the `display` position in markup `" + markup + "`", function() {
          expect(utils.getPositionOfCapturingGroup(markup, "display")).to.equal(positions.display);
        });
  
        it("should return " + positions.id + " for the `id` position in markup `" + markup + "`", function() {
          expect(utils.getPositionOfCapturingGroup(markup, "id")).to.equal(positions.id);
        });
  
        it("should return " + positions.type + " for the `type` position in markup `" + markup + "`", function() {
          expect(utils.getPositionOfCapturingGroup(markup, "type")).to.equal(positions.type);
        });
      

      })();
    }
      
  });


  describe("#mapPlainTextIndex", function() {

    var defaultMarkup = "@[__display__](__type__:__id__)";
    var value = "Hi @[John Doe](user:johndoe), \n\nlet's add @[joe@smoe.com](email:joe@smoe.com) to this conversation...";
    var plainText = "Hi John Doe, \n\nlet's add joe@smoe.com to this conversation...";

    it("should correctly calculate the index of a character in the plain text between mentions", function() {
      var plainTextIndex = plainText.indexOf("let's add");
      var result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex);
      expect(result).to.equal(value.indexOf("let's add"));
    });

    it("should correctly calculate the index of a character in the plain text before the first mention", function() {
      var result = utils.mapPlainTextIndex(value, defaultMarkup, 2);
      expect(result).to.equal(2);
    });

    it("should correctly calculate the index of a character in the plain text after the last mention", function() {
      var plainTextIndex = plainText.indexOf("...");
      var result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex);
      expect(result).to.equal(value.indexOf("..."));
    });

    it("should return the input index if there are no mentions", function() {
      var result = utils.mapPlainTextIndex(plainText, defaultMarkup, 10);
      expect(result).to.equal(10);
    });

    it("should return the index of the corresponding markup if the plain text index lies inside a mention", function() {
      var plainTextIndex = plainText.indexOf("John Doe");
      var result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex);
      expect(result).to.equal(value.indexOf("@[John Doe](user:johndoe)"));

      plainTextIndex = plainText.indexOf("joe@smoe.com") + 3;
      result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex);
      expect(result).to.equal(value.indexOf("@[joe@smoe.com](email:joe@smoe.com)"));
    });

  });

});