var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var utils = require('../lib/utils');


describe("utils", function() {



  var defaultMarkup = "@[__display__](__type__:__id__)";
  var value = "Hi @[John Doe](user:johndoe), \n\nlet's add @[joe@smoe.com](email:joe@smoe.com) to this conversation...";
  var plainText = "Hi John Doe, \n\nlet's add joe@smoe.com to this conversation...";

  var displayTransform = function(id) {
    return "<--" + id + "-->"
  }
  var plainTextDisplayTransform = "Hi <--johndoe-->, \n\nlet's add <--joe@smoe.com--> to this conversation...";


  describe("#spliceString", function() {

    it("should replace the substring between start and end with the provided insertion", function() {
      expect( utils.spliceString("012345678", 1, 4, "xx") ).to.equal("0xx45678");
    })

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

  describe("#iterateMentionsMarkup", function() {

    it("should call the `markupIteratee` for every markup occurrence", function() {
      var markupIteratee = sinon.spy();
      utils.iterateMentionsMarkup(value, defaultMarkup, function(){}, markupIteratee);

      expect(markupIteratee).to.have.been.calledTwice;
      expect(markupIteratee).to.have.been.calledWith(
        "@[John Doe](user:johndoe)",
        value.indexOf("@[John Doe](user:johndoe)"),
        plainText.indexOf("John Doe"),
        "johndoe", "John Doe", "user",
        0
      );
      expect(markupIteratee).to.have.been.calledWith(
        "@[joe@smoe.com](email:joe@smoe.com)",
        value.indexOf("@[joe@smoe.com](email:joe@smoe.com)"),
        plainText.indexOf("joe@smoe.com"),
        "joe@smoe.com", "joe@smoe.com", "email",
        value.indexOf("@[John Doe](user:johndoe)") + "@[John Doe](user:johndoe)".length
      );
    });

    it("should call the `textIteratee` for all plain text sub string between markups", function() {
      var textIteratee = sinon.spy();
      utils.iterateMentionsMarkup(value, defaultMarkup, textIteratee, function(){});

      expect(textIteratee).to.have.been.calledThrice;
      expect(textIteratee).to.have.been.calledWith(
        "Hi ", 
        0,
        0
      );
      expect(textIteratee).to.have.been.calledWith(
        ", \n\nlet's add ",
        value.indexOf(", \n\nlet's add "),
        plainText.indexOf(", \n\nlet's add ")
      );
      expect(textIteratee).to.have.been.calledWith(
        " to this conversation...",
        value.indexOf(" to this conversation..."),
        plainText.indexOf(" to this conversation...")
      );
    });

    it("should call the `markupIteratee` for every markup occurrence with display transform", function() {
      var markupIteratee = sinon.spy();
      utils.iterateMentionsMarkup(value, defaultMarkup, function(){}, markupIteratee, displayTransform);

      expect(markupIteratee).to.have.been.calledTwice;
      expect(markupIteratee).to.have.been.calledWith(
        "@[John Doe](user:johndoe)",
        value.indexOf("@[John Doe](user:johndoe)"),
        plainTextDisplayTransform.indexOf("<--johndoe-->"),
        "johndoe", "<--johndoe-->", "user",
        0
      );
      expect(markupIteratee).to.have.been.calledWith(
        "@[joe@smoe.com](email:joe@smoe.com)",
        value.indexOf("@[joe@smoe.com](email:joe@smoe.com)"),
        plainTextDisplayTransform.indexOf("<--joe@smoe.com-->"),
        "joe@smoe.com", "<--joe@smoe.com-->", "email",
        value.indexOf("@[John Doe](user:johndoe)") + "@[John Doe](user:johndoe)".length
      );
    });

    it("should call the `textIteratee` for all plain text sub string between markups with display transform", function() {
      var textIteratee = sinon.spy();
      utils.iterateMentionsMarkup(value, defaultMarkup, textIteratee, function(){}, displayTransform);

      expect(textIteratee).to.have.been.calledThrice;
      expect(textIteratee).to.have.been.calledWith(
        "Hi ", 
        0,
        0
      );
      expect(textIteratee).to.have.been.calledWith(
        ", \n\nlet's add ",
        value.indexOf(", \n\nlet's add "),
        plainTextDisplayTransform.indexOf(", \n\nlet's add ")
      );
      expect(textIteratee).to.have.been.calledWith(
        " to this conversation...",
        value.indexOf(" to this conversation..."),
        plainTextDisplayTransform.indexOf(" to this conversation...")
      );
    });

    it('should work when using a custom regexp', function () {
      var markupIteratee = sinon.spy();
      var customRegexp = /(?:^|\s)@(\w+)(?:$|\s)/g;
      var value = "@mentionAtStart nota@mention @mention foo bar @mentionAtEnd";
      utils.iterateMentionsMarkup(value, "@__id__", function(){}, markupIteratee, null, customRegexp);

      expect(markupIteratee).to.have.been.calledThrice;
      expect(markupIteratee).to.have.been.calledWith(
        "@mentionAtStart ",
        0,
        0,
        "mentionAtStart", "mentionAtStart", null,
        sinon.match.number
      );
      expect(markupIteratee).to.have.been.calledWith(
        " @mention ",
        sinon.match.number, sinon.match.number,
        "mention", "mention", null,
        sinon.match.number
      );
      expect(markupIteratee).to.have.been.calledWith(
        " @mentionAtEnd",
        sinon.match.number, sinon.match.number,
        "mentionAtEnd", "mentionAtEnd", null,
        sinon.match.number
      );
    });

  });

  describe("#mapPlainTextIndex", function() {

    it("should correctly calculate the index of a character in the plain text between mentions", function() {
      var plainTextIndex = plainText.indexOf("let's add");
      var result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex);
      expect(result).to.equal(value.indexOf("let's add"));
    });

    it("should correctly calculate the index of a character in the plain text between mentions with display tranform", function() {
      var plainTextIndex = plainTextDisplayTransform.indexOf("let's add");
      var result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex, false, displayTransform);
      expect(result).to.equal(value.indexOf("let's add"));
    });

    it("should correctly calculate the indices of the character in the plain text before the first mention", function() {
      var result = utils.mapPlainTextIndex(value, defaultMarkup, 2);
      expect(result).to.equal(2);
    });

    it("should correctly calculate the index of a character in the plain text after the last mention", function() {
      var plainTextIndex = plainText.indexOf("...");
      var result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex);
      expect(result).to.equal(value.indexOf("..."));
    });

    it("should correctly calculate the index of the first plain text character after a mention", function() {
      var plainTextIndex = plainText.indexOf(","); // first char after John Doe mention
      var result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex);
      expect(result).to.equal(value.indexOf(","));
    });

    it("should return the input index if there are no mentions", function() {
      var result = utils.mapPlainTextIndex(plainText, defaultMarkup, 10);
      expect(result).to.equal(10);
    });

    it("should return the index of the corresponding markup's first character if the plain text index lies inside a mention", function() {
      // index for first char of markup
      var plainTextIndex = plainText.indexOf("John Doe");
      var result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex);
      expect(result).to.equal(value.indexOf("@[John Doe](user:johndoe)"));

      // index of char inside the markup
      var joeMarkup = "@[joe@smoe.com](email:joe@smoe.com)";
      plainTextIndex = plainText.indexOf("joe@smoe.com") + 3;
      result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex);
      expect(result).to.equal(value.indexOf(joeMarkup));

      // index of markup's last char
      plainTextIndex = plainText.indexOf("joe@smoe.com") + "joe@smoe.com".length - 1;
      result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex);
      expect(result).to.equal(value.indexOf(joeMarkup));
    });

    it("should return the index of the corresponding markup's last character if the plain text index lies inside a mention and the `toEndOfMarkup` flag is set", function() {
      // index for first char of markup
      var plainTextIndex = plainText.indexOf("John Doe");
      var result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex, true);
      expect(result).to.equal(value.indexOf("@[John Doe](user:johndoe)"));

      // index of char inside the markup
      var joeMarkup = "@[joe@smoe.com](email:joe@smoe.com)";
      plainTextIndex = plainText.indexOf("joe@smoe.com") + 3;
      result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex, true);
      expect(result).to.equal(value.indexOf(joeMarkup) + joeMarkup.length);

      // index of markup's last char
      plainTextIndex = plainText.indexOf("joe@smoe.com") + "joe@smoe.com".length - 1;
      result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex, true);
      expect(result).to.equal(value.indexOf(joeMarkup) + joeMarkup.length);
    });

    it("should return the index of the corresponding markup's first character if the plain text index lies inside a mention with display transform", function() {
      // index of char inside the markup
      var joeMarkup = "@[joe@smoe.com](email:joe@smoe.com)";
      plainTextIndex = plainTextDisplayTransform.indexOf("joe@smoe.com") + 3;
      result = utils.mapPlainTextIndex(value, defaultMarkup, plainTextIndex);
      expect(result).to.equal(value.indexOf(joeMarkup));
    });

    it("should return the correctly mapped caret position at the end of the string after a mention", function() {
      var value = "Hi @[John Doe](user:johndoe)";
      var plainText = "Hi John Doe";
      var result = utils.mapPlainTextIndex(value, defaultMarkup, plainText.length, true);
      expect(result).to.equal(value.length);
    });

  });

  describe("#findStartOfMentionInPlainText", function() {

    it("should return the index of the mention's first char in the plain text if the passed index lies inside a mention", function() {
      var result = utils.findStartOfMentionInPlainText(value, defaultMarkup, plainText.indexOf("Doe"));
      expect(result).to.equal(plainText.indexOf("John Doe"));
    });

    it("should return the passed index, if it does not lie inside a mention", function() {
      var result = utils.findStartOfMentionInPlainText(value, defaultMarkup, plainText.indexOf("add"));
      expect(result).to.equal(plainText.indexOf("add"));
    });

  });

  describe("#applyChangeToValue", function() {

    it("should correctly add a character at the end, beginning, and in the middle of text", function() {
      var changed = "S" + plainText;
      var result = utils.applyChangeToValue(value, defaultMarkup, changed, 0, 0, 1);
      expect(result).to.equal("S" + value);

      changed = plainText + "E";
      result = utils.applyChangeToValue(value, defaultMarkup, changed, plainText.length, plainText.length, changed.length);
      expect(result).to.equal(value + "E");

      changed = "Hi John Doe, \n\nlet's Madd joe@smoe.com to this conversation...";
      result = utils.applyChangeToValue(value, defaultMarkup, changed, 21, 21, 22);
      expect(result).to.equal("Hi @[John Doe](user:johndoe), \n\nlet's Madd @[joe@smoe.com](email:joe@smoe.com) to this conversation...");
    });

    it("should correctly delete single characters and ranges of selected text", function() {
      // delete "i"
      var changed = "H John Doe, \n\nlet's add joe@smoe.com to this conversation...";
      var result = utils.applyChangeToValue(value, defaultMarkup, changed, 2, 2, 1);
      expect(result).to.equal("H @[John Doe](user:johndoe), \n\nlet's add @[joe@smoe.com](email:joe@smoe.com) to this conversation...");

      // delete "add "
      changed = "Hi John Doe, \n\nlet's joe@smoe.com to this conversation...";
      result = utils.applyChangeToValue(value, defaultMarkup, changed, plainText.indexOf("add "), plainText.indexOf("add ") + "add ".length, plainText.indexOf("add "));
      expect(result).to.equal("Hi @[John Doe](user:johndoe), \n\nlet's @[joe@smoe.com](email:joe@smoe.com) to this conversation...");
    });

    it("should correctly add ranges of pasted text and replace the selected range with the new range", function() {
      // add range
      var changed = plainText.replace("add", "add add");
      var result = utils.applyChangeToValue(value, defaultMarkup, changed, plainText.indexOf("add") + "add".length, plainText.indexOf("add") + "add".length, plainText.indexOf("add") + "add add".length);
      expect(result).to.equal(value.replace("add", "add add"));

      // replace range
      changed = plainText.replace("add", "remove");
      result = utils.applyChangeToValue(value, defaultMarkup, changed, plainText.indexOf("add"), plainText.indexOf("add") + "add".length, plainText.indexOf("add") + "remove".length);
      expect(result).to.equal(value.replace("add", "remove"));
    });

    it("should remove mentions markup contained in deleted text ranges", function() {
      // delete without a range selection
      var changed = "Hi John Do, \n\nlet's add joe@smoe.com to this conversation...";
      var result = utils.applyChangeToValue(value, defaultMarkup, changed, 11, 11, 10);
      expect(result).to.equal("Hi , \n\nlet's add @[joe@smoe.com](email:joe@smoe.com) to this conversation...");
    
      // delete mention inside the range
      changed = "Hi let's add joe@smoe.com to this conversation...";
      result = utils.applyChangeToValue(value, defaultMarkup, changed, 3, 15, 3);
      expect(result).to.equal("Hi let's add @[joe@smoe.com](email:joe@smoe.com) to this conversation...");

      // delete mention partially inside the range
      changed = "Hi John Doe, \n\nlet's add joe@smoe.com to this conversation...";
      result = utils.applyChangeToValue(value, defaultMarkup, changed, plainText.indexOf(" add"), plainText.indexOf(" add") + " add joe@".length, plainText.indexOf(" add"));
      expect(result).to.equal("Hi @[John Doe](user:johndoe), \n\nlet's to this conversation...");
    });

    it("should correctly add a new character after a mention at the end of the string", function() {
      var value = "Hi @[John Doe](user:johndoe)";
      var changed = "Hi John Doe,";

      var result = utils.applyChangeToValue(value, defaultMarkup, changed, 11, 11, 12);
      expect(result).to.equal("Hi @[John Doe](user:johndoe),");
    });

    it("should support deletion of whole words (Alt + Backspace) and whole lines (Cmd + Backspace)", function() {
      var changed = plainText.replace("add", "");

      var result = utils.applyChangeToValue(value, defaultMarkup, changed, 24, 24, 21);
      expect(result).to.equal("Hi @[John Doe](user:johndoe), \n\nlet's  @[joe@smoe.com](email:joe@smoe.com) to this conversation...");
    });

    it("should support deletion to the right using Del key", function() {
      var changed = plainText.replace("add", "dd");

      var result = utils.applyChangeToValue(value, defaultMarkup, changed, 21, 21, 21);
      expect(result).to.equal("Hi @[John Doe](user:johndoe), \n\nlet's dd @[joe@smoe.com](email:joe@smoe.com) to this conversation...");
    });

    it("should support deletion to the right using Del key when using the displayTransform option", function() {
      var changed = plainTextDisplayTransform.replace("add", "dd");
      var result = utils.applyChangeToValue(value, defaultMarkup, changed, 26, 26, 26, displayTransform);
      expect(result).to.equal("Hi @[John Doe](user:johndoe), \n\nlet's dd @[joe@smoe.com](email:joe@smoe.com) to this conversation...");
    });

  });

});