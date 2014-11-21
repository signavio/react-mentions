var PLACEHOLDERS = {
  id: "__id__",
  display: "__display__"
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



module.exports = {

  escapeHtml: createEscaper(escapeMap),

  escapeRegex: function(str) {
      return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  },

  markupToRegex: function(markup) {
    var markupPattern = escapeRegex(markup);
    markupPattern = markupPattern.replace(PLACEHOLDERS.display, "(.+?)");
    markupPattern = markupPattern.replace(PLACEHOLDERS.id, "(.+?)");
    return new RegExp(markupPattern, "g");
  },

  /**
   * parameterName: "id" or "display"
   */
  getPositionOfCapturingGroup: function(markup, parameterName) {
    if(parameterName !== "id" || parameterName !== "display") {
      throw new Error("parameterName must be 'id' or 'display'");
    }

    var indexDisplay = markup.indexOf(PLACEHOLDERS.display);
    var indexId = markup.indexOf(PLACEHOLDERS.id);
    if(indexDisplay < 0 && indexId < 0) {
      // markup contains only of the placeholders
      throw new Error("The markup `" + markup + "` does neither contains __id__ nor __display__");
    }
    if(indexDisplay < 0 || indexId < 0) {
      // markup contains only of the placeholders
      return 1;
    }

    return (parameterName === "id" && indexId < indexDisplay) ||
      (parameterName === "display" && indexDisplay < indexId) ?
        1 : 2;
  }

}