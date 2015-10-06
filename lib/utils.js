var PLACEHOLDERS = {
  id: "__id__",
  display: "__display__",
  type: "__type__"
}

var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};
var createEscaper = function(map) {
  var escaper = function(match) {
    return map[match];
  };
  var keys = [];
  for(var key in map) {
    if(map.hasOwnProperty(key)) keys.push(key);
  }
  var source = '(?:' + keys.join('|') + ')';
  var testRegexp = RegExp(source);
  var replaceRegexp = RegExp(source, 'g');
  return function(string) {
    string = string == null ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
};

var numericComparator = function(a, b) {
  a = a === null ? Number.MAX_VALUE : a;
  b = b === null ? Number.MAX_VALUE : b;
  return a - b;
};

module.exports = {

  escapeHtml: createEscaper(escapeMap),

  escapeRegex: function(str) {
      return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  },

  markupToRegex: function(markup, matchAtEnd) {
    var markupPattern = this.escapeRegex(markup);
    markupPattern = markupPattern.replace(PLACEHOLDERS.display, "(.+?)");
    markupPattern = markupPattern.replace(PLACEHOLDERS.id, "(.+?)");
    markupPattern = markupPattern.replace(PLACEHOLDERS.type, "(.+?)");
    if(matchAtEnd) {
      // append a $ to match at the end of the string
      markupPattern = markupPattern + "$";
    }
    return new RegExp(markupPattern, "g");
  },

  spliceString: function(str, start, end, insert) {
    return str.substring(0, start) + insert + str.substring(end);
  },

  extend: function(obj) {
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
  },

  isNumber: function(obj) {
    return Object.prototype.toString.call(obj) === "[object Number]";
  },

  /**
   * parameterName: "id", "display", or "type"
   */
  getPositionOfCapturingGroup: function(markup, parameterName) {
    if(parameterName !== "id" && parameterName !== "display" && parameterName !== "type") {
      throw new Error("parameterName must be 'id', 'display', or 'type'");
    }

    // calculate positions of placeholders in the markup
    var indexDisplay = markup.indexOf(PLACEHOLDERS.display);
    var indexId = markup.indexOf(PLACEHOLDERS.id);
    var indexType = markup.indexOf(PLACEHOLDERS.type);

    // set indices to null if not found
    if(indexDisplay < 0) indexDisplay = null;
    if(indexId < 0) indexId = null;
    if(indexType < 0) indexType = null;

    if(indexDisplay === null && indexId === null) {
      // markup contains none of the mandatory placeholders
      throw new Error("The markup `" + markup + "` must contain at least one of the placeholders `__id__` or `__display__`");
    }

    if(indexType === null && parameterName === "type") {
      // markup does not contain optional __type__ placeholder
      return null;
    }

    // sort indices in ascending order (null values will always be at the end)
    var sortedIndices = [indexDisplay, indexId, indexType].sort(numericComparator);

    // If only one the placeholders __id__ and __display__ is present,
    // use the captured string for both parameters, id and display
    if(indexDisplay === null) indexDisplay = indexId;
    if(indexId === null) indexId = indexDisplay;

    if(parameterName === "id") return sortedIndices.indexOf(indexId);
    if(parameterName === "display") return sortedIndices.indexOf(indexDisplay);
    if(parameterName === "type") return indexType === null ? null : sortedIndices.indexOf(indexType);

  },

  // Finds all occurences of the markup in the value and iterates the plain text sub strings
  // in between those markups using `textIteratee` and the markup occurrences using the
  // `markupIteratee`.
  iterateMentionsMarkup: function(value, markup, textIteratee, markupIteratee, displayTransform) {
    var regex = this.markupToRegex(markup);
    var displayPos = this.getPositionOfCapturingGroup(markup, "display");
    var idPos = this.getPositionOfCapturingGroup(markup, "id");
    var typePos = this.getPositionOfCapturingGroup(markup, "type");

    var match;
    var start = 0;
    var currentPlainTextIndex = 0;

    // detect all mention markup occurences in the value and iterate the matches
    while((match = regex.exec(value)) !== null) {

      var id = match[idPos+1];
      var display = match[displayPos+1];
      var type = typePos ? match[typePos+1] : null;

      if(displayTransform) display = displayTransform(id, display, type);

      var substr = value.substring(start, match.index);
      textIteratee( substr, start, currentPlainTextIndex );
      currentPlainTextIndex += substr.length;

      markupIteratee( match[0], match.index, currentPlainTextIndex, id, display, type, start );
      currentPlainTextIndex += display.length;

      start = regex.lastIndex;
    }

    if(start < value.length) {
      textIteratee( value.substring(start), start, currentPlainTextIndex );
    }
  },

  // For the passed character index in the plain text string, returns the corresponding index
  // in the marked up value string.
  // If the passed character index lies inside a mention, returns the index of the mention
  // markup's first char, or respectively tho one after its last char, if the flag `toEndOfMarkup` is set.
  mapPlainTextIndex: function(value, markup, indexInPlainText, toEndOfMarkup, displayTransform) {
    if(!this.isNumber(indexInPlainText)) {
      return indexInPlainText;
    }

    var result;
    var textIteratee = function(substr, index, substrPlainTextIndex) {
      if(result !== undefined) return;

      if(substrPlainTextIndex + substr.length >= indexInPlainText) {
        // found the corresponding position in the current plain text range
        result = index + indexInPlainText - substrPlainTextIndex;
      }
    };
    var markupIteratee = function(markup, index, mentionPlainTextIndex, id, display, type, lastMentionEndIndex) {
      if(result !== undefined) return;

      if(mentionPlainTextIndex + display.length > indexInPlainText) {
        // found the corresponding position inside current match,
        // return the index of the first or after the last char of the matching markup
        // depending on whether the `toEndOfMarkup` is set
        result = index + (toEndOfMarkup ? markup.length : 0);
      }
    };

    this.iterateMentionsMarkup(value, markup, textIteratee, markupIteratee, displayTransform);

    // when a mention is at the end of the value and we want to get the caret position
    // at the end of the string, result is undefined
    return result === undefined ? value.length : result;
  },

  // For a given indexInPlainText that lies inside a mention,
  // returns a the index of of the first char of the mention in the plain text.
  // If indexInPlainText does not lie inside a mention, returns indexInPlainText.
  findStartOfMentionInPlainText: function(value, markup, indexInPlainText, displayTransform) {
    var result = indexInPlainText;
    var foundMention = false;

    var markupIteratee = function(markup, index, mentionPlainTextIndex, id, display, type, lastMentionEndIndex) {
      if(mentionPlainTextIndex < indexInPlainText && mentionPlainTextIndex + display.length > indexInPlainText) {
        result = mentionPlainTextIndex;
        foundMention = true;
      }
    };
    this.iterateMentionsMarkup(value, markup, function(){}, markupIteratee, displayTransform);

    if (foundMention) {
      return result;
    }
  },

  // Returns whether the given plain text index lies inside a mention
  isInsideOfMention: function(value, markup, indexInPlainText, displayTransform) {
    var mentionStart = this.findStartOfMentionInPlainText(value, markup, indexInPlainText, displayTransform);
    return mentionStart !== undefined && mentionStart !== indexInPlainText
  },

  // Applies a change from the plain text textarea to the underlying marked up value
  // guided by the textarea text selection ranges before and after the change
  applyChangeToValue: function(value, markup, plainTextValue, selectionStartBeforeChange, selectionEndBeforeChange, selectionEndAfterChange, displayTransform) {
    var oldPlainTextValue = this.getPlainText(value, markup, displayTransform);

    var lengthDelta = oldPlainTextValue.length - plainTextValue.length;
    if (!selectionStartBeforeChange) {
      selectionStartBeforeChange = selectionEndAfterChange + lengthDelta;
    }

    if (!selectionEndBeforeChange) {
      selectionEndBeforeChange = selectionStartBeforeChange;
    }

    // Fixes an issue with replacing combined characters for complex input. Eg like acented letters on OSX
    if (selectionStartBeforeChange === selectionEndBeforeChange &&
      selectionEndBeforeChange === selectionEndAfterChange &&
      oldPlainTextValue.length === plainTextValue.length
    ) {
      selectionStartBeforeChange = selectionStartBeforeChange - 1;
    }

    // extract the insertion from the new plain text value
    var insert = plainTextValue.slice(selectionStartBeforeChange, selectionEndAfterChange);

    // handling for Backspace key with no range selection
    var spliceStart = Math.min(selectionStartBeforeChange, selectionEndAfterChange);

    var spliceEnd = selectionEndBeforeChange;
    if(selectionStartBeforeChange === selectionEndAfterChange) {
      // handling for Delete key with no range selection
      spliceEnd = Math.max(selectionEndBeforeChange, selectionStartBeforeChange + lengthDelta);
    }

    // splice the current marked up value and insert new chars
    return this.spliceString(
      value,
      this.mapPlainTextIndex(value, markup, spliceStart, false, displayTransform),
      this.mapPlainTextIndex(value, markup, spliceEnd, true, displayTransform),
      insert
    );
  },

  getPlainText: function(value, markup, displayTransform) {
    var regex = this.markupToRegex(markup);
    var idPos = this.getPositionOfCapturingGroup(markup, "id");
    var displayPos = this.getPositionOfCapturingGroup(markup, "display");
    var typePos = this.getPositionOfCapturingGroup(markup, "type");
    return value.replace(regex, function() {
      // first argument is the whole match, capturing groups are following
      var id = arguments[idPos+1];
      var display = arguments[displayPos+1];
      var type = arguments[typePos+1];
      if(displayTransform) display = displayTransform(id, display, type);
      return display;
    });
  },

  getMentions: function (value, markup) {
    var mentions = [];
    this.iterateMentionsMarkup(value, markup, function (){}, function (match, index, plainTextIndex, id, display, type, start) {
      mentions.push({
        id: id,
        display: display,
        type: type,
        index: index,
        plainTextIndex: plainTextIndex
      });
    });
    return mentions;
  },

  makeMentionsMarkup: function(markup, id, display, type) {
    var result = markup.replace(PLACEHOLDERS.id, id);
    result = result.replace(PLACEHOLDERS.display, display);
    result = result.replace(PLACEHOLDERS.type, type);
    return result;
  }

}
