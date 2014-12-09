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

  markupToRegex: function(markup) {
    var markupPattern = this.escapeRegex(markup);
    markupPattern = markupPattern.replace(PLACEHOLDERS.display, "(.+?)");
    markupPattern = markupPattern.replace(PLACEHOLDERS.id, "(.+?)");
    markupPattern = markupPattern.replace(PLACEHOLDERS.type, "(.+?)");
    return new RegExp(markupPattern, "g");
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

  // For the passed character index in the plain text string, returns the corresponding index
  // in the marked up value string 
  mapPlainTextIndex: function(value, markup, indexInPlainText) {
    var regex = this.markupToRegex(markup);
    var displayPos = this.getPositionOfCapturingGroup(markup, "display");

    var match;
    var start = 0;
    var currentPlainTextIndex = 0;

    // detect all mention markup occurences in the value and iterate the matches
    while((match = regex.exec(value)) !== null) {
      var display = match[displayPos+1];

      var plainTextIndexDelta = match.index - start;
      if(currentPlainTextIndex + plainTextIndexDelta >= indexInPlainText) {
        // found the corresponding position in the text range before the current match
        return start + indexInPlainText - currentPlainTextIndex;
      } else if(currentPlainTextIndex + plainTextIndexDelta + display.length >= indexInPlainText) {
        // found the corresponding position inside current match,
        // return the index of the first char of the matching markup
        return match.index;
      }

      currentPlainTextIndex += plainTextIndexDelta + display.length;
      start = regex.lastIndex;
    }

    // index lies in the range after the last mention
    return start + indexInPlainText - currentPlainTextIndex
  }

}