"use strict";

function _interopDefault(ex) {
  return ex && "object" == typeof ex && "default" in ex ? ex.default : ex;
}

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var _toConsumableArray = _interopDefault(require("@babel/runtime/helpers/toConsumableArray")), _extends = _interopDefault(require("@babel/runtime/helpers/extends")), _classCallCheck = _interopDefault(require("@babel/runtime/helpers/classCallCheck")), _createClass = _interopDefault(require("@babel/runtime/helpers/createClass")), _assertThisInitialized = _interopDefault(require("@babel/runtime/helpers/assertThisInitialized")), _inherits = _interopDefault(require("@babel/runtime/helpers/inherits")), _possibleConstructorReturn = _interopDefault(require("@babel/runtime/helpers/possibleConstructorReturn")), _getPrototypeOf = _interopDefault(require("@babel/runtime/helpers/getPrototypeOf")), _defineProperty = _interopDefault(require("@babel/runtime/helpers/defineProperty")), React = require("react"), React__default = _interopDefault(React), invariant = _interopDefault(require("invariant")), _slicedToArray = _interopDefault(require("@babel/runtime/helpers/slicedToArray")), _objectWithoutProperties = _interopDefault(require("@babel/runtime/helpers/objectWithoutProperties")), useStyles = require("substyle"), useStyles__default = _interopDefault(useStyles), PropTypes = _interopDefault(require("prop-types")), ReactDOM = _interopDefault(require("react-dom")), escapeRegex = function(str) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}, PLACEHOLDERS = {
  id: "__id__",
  display: "__display__"
}, findPositionOfCapturingGroup = function(markup, parameterName) {
  invariant("id" === parameterName || "display" === parameterName, 'Second arg must be either "id" or "display", got: "'.concat(parameterName, '"'));
  var indexDisplay = markup.indexOf(PLACEHOLDERS.display), indexId = markup.indexOf(PLACEHOLDERS.id);
  return indexDisplay < 0 && (indexDisplay = null), indexId < 0 && (indexId = null), 
  invariant(null !== indexDisplay || null !== indexId, "The markup '".concat(markup, "' does not contain either of the placeholders '__id__' or '__display__'")), 
  null !== indexDisplay && null !== indexId ? "id" === parameterName && indexId <= indexDisplay || "display" === parameterName && indexDisplay <= indexId ? 0 : 1 : 0;
}, combineRegExps = function(regExps) {
  var serializedRegexParser = /^\/(.+)\/(\w+)?$/;
  return new RegExp(regExps.map(function(regex) {
    var _serializedRegexParse = serializedRegexParser.exec(regex.toString()), _serializedRegexParse2 = _slicedToArray(_serializedRegexParse, 3), regexString = _serializedRegexParse2[1], regexFlags = _serializedRegexParse2[2];
    return invariant(!regexFlags, "RegExp flags are not supported. Change /".concat(regexString, "/").concat(regexFlags, " into /").concat(regexString, "/")), 
    "(".concat(regexString, ")");
  }).join("|"), "g");
}, countPlaceholders = function(markup) {
  var count = 0;
  return markup.indexOf("__id__") >= 0 && count++, markup.indexOf("__display__") >= 0 && count++, 
  count;
}, emptyFn = function() {}, iterateMentionsMarkup = function(value, config, markupIteratee) {
  for (var match, textIteratee = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : emptyFn, regex = combineRegExps(config.map(function(c) {
    return c.regex;
  })), accOffset = 2, captureGroupOffsets = config.map(function(_ref) {
    var markup = _ref.markup, result = accOffset;
    return accOffset += countPlaceholders(markup) + 1, result;
  }), start = 0, currentPlainTextIndex = 0; null !== (match = regex.exec(value)); ) {
    var offset = captureGroupOffsets.find(function(o) {
      return !!match[o];
    }), mentionChildIndex = captureGroupOffsets.indexOf(offset), _config$mentionChildI = config[mentionChildIndex], markup = _config$mentionChildI.markup, displayTransform = _config$mentionChildI.displayTransform, idPos = offset + findPositionOfCapturingGroup(markup, "id"), displayPos = offset + findPositionOfCapturingGroup(markup, "display"), id = match[idPos], display = displayTransform(id, match[displayPos]), substr = value.substring(start, match.index);
    textIteratee(substr, start, currentPlainTextIndex), currentPlainTextIndex += substr.length, 
    markupIteratee(match[0], match.index, currentPlainTextIndex, id, display, mentionChildIndex, start), 
    currentPlainTextIndex += display.length, start = regex.lastIndex;
  }
  start < value.length && textIteratee(value.substring(start), start, currentPlainTextIndex);
}, getPlainText = function(value, config) {
  var result = "";
  return iterateMentionsMarkup(value, config, function(match, index, plainTextIndex, id, display) {
    result += display;
  }, function(plainText) {
    result += plainText;
  }), result;
}, mapPlainTextIndex = function(value, config, indexInPlainText) {
  var result, inMarkupCorrection = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : "START";
  if ("number" != typeof indexInPlainText) return indexInPlainText;
  return iterateMentionsMarkup(value, config, function(markup, index, mentionPlainTextIndex, id, display, childIndex, lastMentionEndIndex) {
    void 0 === result && mentionPlainTextIndex + display.length > indexInPlainText && (result = "NULL" === inMarkupCorrection ? null : index + ("END" === inMarkupCorrection ? markup.length : 0));
  }, function(substr, index, substrPlainTextIndex) {
    void 0 === result && substrPlainTextIndex + substr.length >= indexInPlainText && (result = index + indexInPlainText - substrPlainTextIndex);
  }), void 0 === result ? value.length : result;
}, spliceString = function(str, start, end, insert) {
  return str.substring(0, start) + insert + str.substring(end);
}, applyChangeToValue = function(value, plainTextValue, _ref, config) {
  var selectionStartBefore = _ref.selectionStartBefore, selectionEndBefore = _ref.selectionEndBefore, selectionEndAfter = _ref.selectionEndAfter, oldPlainTextValue = getPlainText(value, config), lengthDelta = oldPlainTextValue.length - plainTextValue.length;
  "undefined" === selectionStartBefore && (selectionStartBefore = selectionEndAfter + lengthDelta), 
  "undefined" === selectionEndBefore && (selectionEndBefore = selectionStartBefore), 
  selectionStartBefore === selectionEndBefore && selectionEndBefore === selectionEndAfter && oldPlainTextValue.length === plainTextValue.length && (selectionStartBefore -= 1);
  var insert = plainTextValue.slice(selectionStartBefore, selectionEndAfter), spliceStart = Math.min(selectionStartBefore, selectionEndAfter), spliceEnd = selectionEndBefore;
  selectionStartBefore === selectionEndAfter && (spliceEnd = Math.max(selectionEndBefore, selectionStartBefore + lengthDelta));
  var mappedSpliceStart = mapPlainTextIndex(value, config, spliceStart, "START"), mappedSpliceEnd = mapPlainTextIndex(value, config, spliceEnd, "END"), controlSpliceStart = mapPlainTextIndex(value, config, spliceStart, "NULL"), controlSpliceEnd = mapPlainTextIndex(value, config, spliceEnd, "NULL"), willRemoveMention = null === controlSpliceStart || null === controlSpliceEnd, newValue = spliceString(value, mappedSpliceStart, mappedSpliceEnd, insert);
  if (!willRemoveMention) {
    var controlPlainTextValue = getPlainText(newValue, config);
    if (controlPlainTextValue !== plainTextValue) {
      for (spliceStart = 0; plainTextValue[spliceStart] === controlPlainTextValue[spliceStart]; ) spliceStart++;
      insert = plainTextValue.slice(spliceStart, selectionEndAfter), spliceEnd = oldPlainTextValue.lastIndexOf(plainTextValue.substring(selectionEndAfter)), 
      mappedSpliceStart = mapPlainTextIndex(value, config, spliceStart, "START"), mappedSpliceEnd = mapPlainTextIndex(value, config, spliceEnd, "END"), 
      newValue = spliceString(value, mappedSpliceStart, mappedSpliceEnd, insert);
    }
  }
  return newValue;
}, findStartOfMentionInPlainText = function(value, config, indexInPlainText) {
  var result = indexInPlainText, foundMention = !1;
  if (iterateMentionsMarkup(value, config, function(markup, index, mentionPlainTextIndex, id, display, childIndex, lastMentionEndIndex) {
    mentionPlainTextIndex <= indexInPlainText && mentionPlainTextIndex + display.length > indexInPlainText && (result = mentionPlainTextIndex, 
    foundMention = !0);
  }), foundMention) return result;
}, getMentions = function(value, config) {
  var mentions = [];
  return iterateMentionsMarkup(value, config, function(match, index, plainTextIndex, id, display, childIndex, start) {
    mentions.push({
      id: id,
      display: display,
      childIndex: childIndex,
      index: index,
      plainTextIndex: plainTextIndex
    });
  }), mentions;
}, getSuggestionHtmlId = function(prefix, id) {
  return "".concat(prefix, "-").concat(id);
}, countSuggestions = function(suggestions) {
  return Object.values(suggestions).reduce(function(acc, _ref) {
    return acc + _ref.results.length;
  }, 0);
}, getEndOfLastMention = function(value, config) {
  var mentions = getMentions(value, config), lastMention = mentions[mentions.length - 1];
  return lastMention ? lastMention.plainTextIndex + lastMention.display.length : 0;
}, markupToRegex = function(markup) {
  var escapedMarkup = escapeRegex(markup), charAfterDisplay = markup[markup.indexOf(PLACEHOLDERS.display) + PLACEHOLDERS.display.length], charAfterId = markup[markup.indexOf(PLACEHOLDERS.id) + PLACEHOLDERS.id.length];
  return new RegExp(escapedMarkup.replace(PLACEHOLDERS.display, "([^".concat(escapeRegex(charAfterDisplay || ""), "]+?)")).replace(PLACEHOLDERS.id, "([^".concat(escapeRegex(charAfterId || ""), "]+?)")));
}, readConfigFromChildren = function(children) {
  return React.Children.toArray(children).map(function(_ref) {
    var _ref$props = _ref.props, markup = _ref$props.markup, regex = _ref$props.regex, displayTransform = _ref$props.displayTransform;
    return {
      markup: markup,
      regex: regex ? coerceCapturingGroups(regex, markup) : markupToRegex(markup),
      displayTransform: displayTransform || function(id, display) {
        return display || id;
      }
    };
  });
}, coerceCapturingGroups = function(regex, markup) {
  var _RegExp$exec, numberOfGroups = (null === (_RegExp$exec = new RegExp(regex.toString() + "|").exec("")) || void 0 === _RegExp$exec ? void 0 : _RegExp$exec.length) - 1, numberOfPlaceholders = countPlaceholders(markup);
  return invariant(numberOfGroups === numberOfPlaceholders, "Number of capturing groups in RegExp ".concat(regex.toString(), " (").concat(numberOfGroups, ") does not match the number of placeholders in the markup '").concat(markup, "' (").concat(numberOfPlaceholders, ")")), 
  regex;
}, makeMentionsMarkup = function(markup, id, display) {
  return markup.replace(PLACEHOLDERS.id, id).replace(PLACEHOLDERS.display, display);
}, lettersDiacritics = [ {
  base: "A",
  letters: /(&#65;|&#9398;|&#65313;|&#192;|&#193;|&#194;|&#7846;|&#7844;|&#7850;|&#7848;|&#195;|&#256;|&#258;|&#7856;|&#7854;|&#7860;|&#7858;|&#550;|&#480;|&#196;|&#478;|&#7842;|&#197;|&#506;|&#461;|&#512;|&#514;|&#7840;|&#7852;|&#7862;|&#7680;|&#260;|&#570;|&#11375;|[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F])/g
}, {
  base: "AA",
  letters: /(&#42802;|[\uA732])/g
}, {
  base: "AE",
  letters: /(&#198;|&#508;|&#482;|[\u00C6\u01FC\u01E2])/g
}, {
  base: "AO",
  letters: /(&#42804;|[\uA734])/g
}, {
  base: "AU",
  letters: /(&#42806;|[\uA736])/g
}, {
  base: "AV",
  letters: /(&#42808;|&#42810;|[\uA738\uA73A])/g
}, {
  base: "AY",
  letters: /(&#42812;|[\uA73C])/g
}, {
  base: "B",
  letters: /(&#66;|&#9399;|&#65314;|&#7682;|&#7684;|&#7686;|&#579;|&#386;|&#385;|[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181])/g
}, {
  base: "C",
  letters: /(&#67;|&#9400;|&#65315;|&#262;|&#264;|&#266;|&#268;|&#199;|&#7688;|&#391;|&#571;|&#42814;|[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E])/g
}, {
  base: "D",
  letters: /(&#68;|&#9401;|&#65316;|&#7690;|&#270;|&#7692;|&#7696;|&#7698;|&#7694;|&#272;|&#395;|&#394;|&#393;|&#42873;|&#208;|[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779\u00D0])/g
}, {
  base: "DZ",
  letters: /(&#497;|&#452;|[\u01F1\u01C4])/g
}, {
  base: "Dz",
  letters: /(&#498;|&#453;|[\u01F2\u01C5])/g
}, {
  base: "E",
  letters: /(&#69;|&#9402;|&#65317;|&#200;|&#201;|&#202;|&#7872;|&#7870;|&#7876;|&#7874;|&#7868;|&#274;|&#7700;|&#7702;|&#276;|&#278;|&#203;|&#7866;|&#282;|&#516;|&#518;|&#7864;|&#7878;|&#552;|&#7708;|&#280;|&#7704;|&#7706;|&#400;|&#398;|[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E])/g
}, {
  base: "F",
  letters: /(&#70;|&#9403;|&#65318;|&#7710;|&#401;|&#42875;|[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B])/g
}, {
  base: "G",
  letters: /(&#71;|&#9404;|&#65319;|&#500;|&#284;|&#7712;|&#286;|&#288;|&#486;|&#290;|&#484;|&#403;|&#42912;|&#42877;|&#42878;|[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E])/g
}, {
  base: "H",
  letters: /(&#72;|&#9405;|&#65320;|&#292;|&#7714;|&#7718;|&#542;|&#7716;|&#7720;|&#7722;|&#294;|&#11367;|&#11381;|&#42893;|[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D])/g
}, {
  base: "I",
  letters: /(&#73;|&#9406;|&#65321;|&#204;|&#205;|&#206;|&#296;|&#298;|&#300;|&#304;|&#207;|&#7726;|&#7880;|&#463;|&#520;|&#522;|&#7882;|&#302;|&#7724;|&#407;|[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197])/g
}, {
  base: "J",
  letters: /(&#74;|&#9407;|&#65322;|&#308;|&#584;|[\u004A\u24BF\uFF2A\u0134\u0248])/g
}, {
  base: "K",
  letters: /(&#75;|&#9408;|&#65323;|&#7728;|&#488;|&#7730;|&#310;|&#7732;|&#408;|&#11369;|&#42816;|&#42818;|&#42820;|&#42914;|[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2])/g
}, {
  base: "L",
  letters: /(&#76;|&#9409;|&#65324;|&#319;|&#313;|&#317;|&#7734;|&#7736;|&#315;|&#7740;|&#7738;|&#321;|&#573;|&#11362;|&#11360;|&#42824;|&#42822;|&#42880;|[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780])/g
}, {
  base: "LJ",
  letters: /(&#455;|[\u01C7])/g
}, {
  base: "Lj",
  letters: /(&#456;|[\u01C8])/g
}, {
  base: "M",
  letters: /(&#77;|&#9410;|&#65325;|&#7742;|&#7744;|&#7746;|&#11374;|&#412;|[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C])/g
}, {
  base: "N",
  letters: /(&#78;|&#9411;|&#65326;|&#504;|&#323;|&#209;|&#7748;|&#327;|&#7750;|&#325;|&#7754;|&#7752;|&#544;|&#413;|&#42896;|&#42916;|&#330;|[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4\u014A])/g
}, {
  base: "NJ",
  letters: /(&#458;|[\u01CA])/g
}, {
  base: "Nj",
  letters: /(&#459;|[\u01CB])/g
}, {
  base: "O",
  letters: /(&#79;|&#9412;|&#65327;|&#210;|&#211;|&#212;|&#7890;|&#7888;|&#7894;|&#7892;|&#213;|&#7756;|&#556;|&#7758;|&#332;|&#7760;|&#7762;|&#334;|&#558;|&#560;|&#214;|&#554;|&#7886;|&#336;|&#465;|&#524;|&#526;|&#416;|&#7900;|&#7898;|&#7904;|&#7902;|&#7906;|&#7884;|&#7896;|&#490;|&#492;|&#216;|&#510;|&#390;|&#415;|&#42826;|&#42828;|[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C])/g
}, {
  base: "OE",
  letters: /(&#338;|[\u0152])/g
}, {
  base: "OI",
  letters: /(&#418;|[\u01A2])/g
}, {
  base: "OO",
  letters: /(&#42830;|[\uA74E])/g
}, {
  base: "OU",
  letters: /(&#546;|[\u0222])/g
}, {
  base: "P",
  letters: /(&#80;|&#9413;|&#65328;|&#7764;|&#7766;|&#420;|&#11363;|&#42832;|&#42834;|&#42836;|[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754])/g
}, {
  base: "Q",
  letters: /(&#81;|&#9414;|&#65329;|&#42838;|&#42840;|&#586;|[\u0051\u24C6\uFF31\uA756\uA758\u024A])/g
}, {
  base: "R",
  letters: /(&#82;|&#9415;|&#65330;|&#340;|&#7768;|&#344;|&#528;|&#530;|&#7770;|&#7772;|&#342;|&#7774;|&#588;|&#11364;|&#42842;|&#42918;|&#42882;|[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782])/g
}, {
  base: "S",
  letters: /(&#83;|&#9416;|&#65331;|&#7838;|&#346;|&#7780;|&#348;|&#7776;|&#352;|&#7782;|&#7778;|&#7784;|&#536;|&#350;|&#11390;|&#42920;|&#42884;|[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784])/g
}, {
  base: "T",
  letters: /(&#84;|&#9417;|&#65332;|&#7786;|&#356;|&#7788;|&#538;|&#354;|&#7792;|&#7790;|&#358;|&#428;|&#430;|&#574;|&#42886;|[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786])/g
}, {
  base: "TH",
  letters: /(&#222;|[\u00DE])/g
}, {
  base: "TZ",
  letters: /(&#42792;|[\uA728])/g
}, {
  base: "U",
  letters: /(&#85;|&#9418;|&#65333;|&#217;|&#218;|&#219;|&#360;|&#7800;|&#362;|&#7802;|&#364;|&#220;|&#475;|&#471;|&#469;|&#473;|&#7910;|&#366;|&#368;|&#467;|&#532;|&#534;|&#431;|&#7914;|&#7912;|&#7918;|&#7916;|&#7920;|&#7908;|&#7794;|&#370;|&#7798;|&#7796;|&#580;|[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244])/g
}, {
  base: "V",
  letters: /(&#86;|&#9419;|&#65334;|&#7804;|&#7806;|&#434;|&#42846;|&#581;|[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245])/g
}, {
  base: "VY",
  letters: /(&#42848;|[\uA760])/g
}, {
  base: "W",
  letters: /(&#87;|&#9420;|&#65335;|&#7808;|&#7810;|&#372;|&#7814;|&#7812;|&#7816;|&#11378;|[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72])/g
}, {
  base: "X",
  letters: /(&#88;|&#9421;|&#65336;|&#7818;|&#7820;|[\u0058\u24CD\uFF38\u1E8A\u1E8C])/g
}, {
  base: "Y",
  letters: /(&#89;|&#9422;|&#65337;|&#7922;|&#221;|&#374;|&#7928;|&#562;|&#7822;|&#376;|&#7926;|&#7924;|&#435;|&#590;|&#7934;|[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE])/g
}, {
  base: "Z",
  letters: /(&#90;|&#9423;|&#65338;|&#377;|&#7824;|&#379;|&#381;|&#7826;|&#7828;|&#437;|&#548;|&#11391;|&#11371;|&#42850;|[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762])/g
}, {
  base: "a",
  letters: /(&#97;|&#9424;|&#65345;|&#7834;|&#224;|&#225;|&#226;|&#7847;|&#7845;|&#7851;|&#7849;|&#227;|&#257;|&#259;|&#7857;|&#7855;|&#7861;|&#7859;|&#551;|&#481;|&#228;|&#479;|&#7843;|&#229;|&#507;|&#462;|&#513;|&#515;|&#7841;|&#7853;|&#7863;|&#7681;|&#261;|&#11365;|&#592;|[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250])/g
}, {
  base: "aa",
  letters: /(&#42803;|[\uA733])/g
}, {
  base: "ae",
  letters: /(&#230;|&#509;|&#483;|[\u00E6\u01FD\u01E3])/g
}, {
  base: "ao",
  letters: /(&#42805;|[\uA735])/g
}, {
  base: "au",
  letters: /(&#42807;|[\uA737])/g
}, {
  base: "av",
  letters: /(&#42809;|&#42811;|[\uA739\uA73B])/g
}, {
  base: "ay",
  letters: /(&#42813;|[\uA73D])/g
}, {
  base: "b",
  letters: /(&#98;|&#9425;|&#65346;|&#7683;|&#7685;|&#7687;|&#384;|&#387;|&#595;|[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253])/g
}, {
  base: "c",
  letters: /(&#99;|&#9426;|&#65347;|&#263;|&#265;|&#267;|&#269;|&#231;|&#7689;|&#392;|&#572;|&#42815;|&#8580;|[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184])/g
}, {
  base: "d",
  letters: /(&#100;|&#9427;|&#65348;|&#7691;|&#271;|&#7693;|&#7697;|&#7699;|&#7695;|&#273;|&#396;|&#598;|&#599;|&#42874;|&#240;|[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A\u00F0])/g
}, {
  base: "dz",
  letters: /(&#499;|&#454;|[\u01F3\u01C6])/g
}, {
  base: "e",
  letters: /(&#101;|&#9428;|&#65349;|&#232;|&#233;|&#234;|&#7873;|&#7871;|&#7877;|&#7875;|&#7869;|&#275;|&#7701;|&#7703;|&#277;|&#279;|&#235;|&#7867;|&#283;|&#517;|&#519;|&#7865;|&#7879;|&#553;|&#7709;|&#281;|&#7705;|&#7707;|&#583;|&#603;|&#477;|[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD])/g
}, {
  base: "f",
  letters: /(&#102;|&#9429;|&#65350;|&#7711;|&#402;|&#42876;|[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C])/g
}, {
  base: "g",
  letters: /(&#103;|&#9430;|&#65351;|&#501;|&#285;|&#7713;|&#287;|&#289;|&#487;|&#291;|&#485;|&#608;|&#42913;|&#7545;|&#42879;|[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F])/g
}, {
  base: "h",
  letters: /(&#104;|&#9431;|&#65352;|&#293;|&#7715;|&#7719;|&#543;|&#7717;|&#7721;|&#7723;|&#7830;|&#295;|&#11368;|&#11382;|&#613;|[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265])/g
}, {
  base: "hv",
  letters: /(&#405;|[\u0195])/g
}, {
  base: "i",
  letters: /(&#105;|&#9432;|&#65353;|&#236;|&#237;|&#238;|&#297;|&#299;|&#301;|&#239;|&#7727;|&#7881;|&#464;|&#521;|&#523;|&#7883;|&#303;|&#7725;|&#616;|&#305;|[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131])/g
}, {
  base: "ij",
  letters: /(&#307;|[\u0133])/g
}, {
  base: "j",
  letters: /(&#106;|&#9433;|&#65354;|&#309;|&#496;|&#585;|[\u006A\u24D9\uFF4A\u0135\u01F0\u0249])/g
}, {
  base: "k",
  letters: /(&#107;|&#9434;|&#65355;|&#7729;|&#489;|&#7731;|&#311;|&#7733;|&#409;|&#11370;|&#42817;|&#42819;|&#42821;|&#42915;|[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3])/g
}, {
  base: "l",
  letters: /(&#108;|&#9435;|&#65356;|&#320;|&#314;|&#318;|&#7735;|&#7737;|&#316;|&#7741;|&#7739;|&#322;|&#410;|&#619;|&#11361;|&#42825;|&#42881;|&#42823;|[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u0142\u019A\u026B\u2C61\uA749\uA781\uA747])/g
}, {
  base: "lj",
  letters: /(&#457;|[\u01C9])/g
}, {
  base: "m",
  letters: /(&#109;|&#9436;|&#65357;|&#7743;|&#7745;|&#7747;|&#625;|&#623;|[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F])/g
}, {
  base: "n",
  letters: /(&#110;|&#9437;|&#65358;|&#505;|&#324;|&#241;|&#7749;|&#328;|&#7751;|&#326;|&#7755;|&#7753;|&#414;|&#626;|&#329;|&#42897;|&#42917;|&#331;|[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5\u014B])/g
}, {
  base: "nj",
  letters: /(&#460;|[\u01CC])/g
}, {
  base: "o",
  letters: /(&#111;|&#9438;|&#65359;|&#242;|&#243;|&#244;|&#7891;|&#7889;|&#7895;|&#7893;|&#245;|&#7757;|&#557;|&#7759;|&#333;|&#7761;|&#7763;|&#335;|&#559;|&#561;|&#246;|&#555;|&#7887;|&#337;|&#466;|&#525;|&#527;|&#417;|&#7901;|&#7899;|&#7905;|&#7903;|&#7907;|&#7885;|&#7897;|&#491;|&#493;|&#248;|&#511;|&#596;|&#42827;|&#42829;|&#629;|[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275])/g
}, {
  base: "oe",
  letters: /(&#339;|[\u0153])/g
}, {
  base: "oi",
  letters: /(&#419;|[\u01A3])/g
}, {
  base: "ou",
  letters: /(&#547;|[\u0223])/g
}, {
  base: "oo",
  letters: /(&#42831;|[\uA74F])/g
}, {
  base: "p",
  letters: /(&#112;|&#9439;|&#65360;|&#7765;|&#7767;|&#421;|&#7549;|&#42833;|&#42835;|&#42837;|[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755])/g
}, {
  base: "q",
  letters: /(&#113;|&#9440;|&#65361;|&#587;|&#42839;|&#42841;|[\u0071\u24E0\uFF51\u024B\uA757\uA759])/g
}, {
  base: "r",
  letters: /(&#114;|&#9441;|&#65362;|&#341;|&#7769;|&#345;|&#529;|&#531;|&#7771;|&#7773;|&#343;|&#7775;|&#589;|&#637;|&#42843;|&#42919;|&#42883;|[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783])/g
}, {
  base: "s",
  letters: /(&#115;|&#9442;|&#65363;|&#347;|&#7781;|&#349;|&#7777;|&#353;|&#7783;|&#7779;|&#7785;|&#537;|&#351;|&#575;|&#42921;|&#42885;|&#7835;|&#383;|[\u0073\u24E2\uFF53\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B\u017F])/g
}, {
  base: "ss",
  letters: /(&#223;|[\u00DF])/g
}, {
  base: "t",
  letters: /(&#116;|&#9443;|&#65364;|&#7787;|&#7831;|&#357;|&#7789;|&#539;|&#355;|&#7793;|&#7791;|&#359;|&#429;|&#648;|&#11366;|&#42887;|[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787])/g
}, {
  base: "th",
  letters: /(&#254;|[\u00FE])/g
}, {
  base: "tz",
  letters: /(&#42793;|[\uA729])/g
}, {
  base: "u",
  letters: /(&#117;|&#9444;|&#65365;|&#249;|&#250;|&#251;|&#361;|&#7801;|&#363;|&#7803;|&#365;|&#252;|&#476;|&#472;|&#470;|&#474;|&#7911;|&#367;|&#369;|&#468;|&#533;|&#535;|&#432;|&#7915;|&#7913;|&#7919;|&#7917;|&#7921;|&#7909;|&#7795;|&#371;|&#7799;|&#7797;|&#649;|[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289])/g
}, {
  base: "v",
  letters: /(&#118;|&#9445;|&#65366;|&#7805;|&#7807;|&#651;|&#42847;|&#652;|[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C])/g
}, {
  base: "vy",
  letters: /(&#42849;|[\uA761])/g
}, {
  base: "w",
  letters: /(&#119;|&#9446;|&#65367;|&#7809;|&#7811;|&#373;|&#7815;|&#7813;|&#7832;|&#7817;|&#11379;|[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73])/g
}, {
  base: "x",
  letters: /(&#120;|&#9447;|&#65368;|&#7819;|&#7821;|[\u0078\u24E7\uFF58\u1E8B\u1E8D])/g
}, {
  base: "y",
  letters: /(&#121;|&#9448;|&#65369;|&#7923;|&#253;|&#375;|&#7929;|&#563;|&#7823;|&#255;|&#7927;|&#7833;|&#7925;|&#436;|&#591;|&#7935;|[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF])/g
}, {
  base: "z",
  letters: /(&#122;|&#9449;|&#65370;|&#378;|&#7825;|&#380;|&#382;|&#7827;|&#7829;|&#438;|&#549;|&#576;|&#11372;|&#42851;|[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763])/g
} ], removeAccents = function(str) {
  var formattedStr = str;
  return lettersDiacritics.forEach(function(letterDiacritics) {
    formattedStr = formattedStr.replace(letterDiacritics.letters, letterDiacritics.base);
  }), formattedStr;
}, normalizeString = function(str) {
  return removeAccents(str).toLowerCase();
}, getSubstringIndex = function(str, substr, ignoreAccents) {
  return ignoreAccents ? normalizeString(str).indexOf(normalizeString(substr)) : str.toLowerCase().indexOf(substr.toLowerCase());
}, isIE = function() {
  return !!document.documentMode;
}, isNumber = function(val) {
  return "number" == typeof val;
}, keys = function(obj) {
  return obj === Object(obj) ? Object.keys(obj) : [];
}, omit = function(obj) {
  for (var _ref, _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) rest[_key - 1] = arguments[_key];
  var keys = (_ref = []).concat.apply(_ref, rest);
  return Object.keys(obj).reduce(function(acc, k) {
    return obj.hasOwnProperty(k) && !keys.includes(k) && void 0 !== obj[k] && (acc[k] = obj[k]), 
    acc;
  }, {});
}, _excluded = [ "style", "className", "classNames" ];

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}

function createDefaultStyle(defaultStyle, getModifiers) {
  return function(ComponentToWrap) {
    var DefaultStyleEnhancer = function(_ref) {
      var style = _ref.style, className = _ref.className, classNames = _ref.classNames, rest = _objectWithoutProperties(_ref, _excluded), modifiers = getModifiers ? getModifiers(rest) : void 0, styles = useStyles__default(defaultStyle, {
        style: style,
        className: className,
        classNames: classNames
      }, modifiers);
      return React__default.createElement(ComponentToWrap, _extends({}, rest, {
        style: styles
      }));
    }, displayName = ComponentToWrap.displayName || ComponentToWrap.name || "Component";
    return DefaultStyleEnhancer.displayName = "defaultStyle(".concat(displayName, ")"), 
    React__default.forwardRef(function(props, ref) {
      return DefaultStyleEnhancer(_objectSpread(_objectSpread({}, props), {}, {
        ref: ref
      }));
    });
  };
}

var _generateComponentKey = function(usedKeys, id) {
  return usedKeys.hasOwnProperty(id) ? usedKeys[id]++ : usedKeys[id] = 0, id + "_" + usedKeys[id];
};

function Highlighter(_ref) {
  var selectionStart = _ref.selectionStart, selectionEnd = _ref.selectionEnd, _ref$value = _ref.value, value = void 0 === _ref$value ? "" : _ref$value, onCaretPositionChange = _ref.onCaretPositionChange, containerRef = _ref.containerRef, children = _ref.children, style = (_ref.singleLine, 
  _ref.style), _useState = React.useState({
    left: void 0,
    top: void 0
  }), _useState2 = _slicedToArray(_useState, 2), position = _useState2[0], setPosition = _useState2[1], _useState3 = React.useState(), _useState4 = _slicedToArray(_useState3, 2), caretElement = _useState4[0], setCaretElement = _useState4[1];
  React.useEffect(function() {
    notifyCaretPosition();
  });
  var caretPositionInMarkup, notifyCaretPosition = function() {
    if (caretElement) {
      var offsetLeft = caretElement.offsetLeft, offsetTop = caretElement.offsetTop;
      if (position.left !== offsetLeft || position.top !== offsetTop) {
        var newPosition = {
          left: offsetLeft,
          top: offsetTop
        };
        setPosition(newPosition), onCaretPositionChange(newPosition);
      }
    }
  }, config = readConfigFromChildren(children);
  selectionEnd === selectionStart && (caretPositionInMarkup = mapPlainTextIndex(value, config, selectionStart, "START"));
  var resultComponents = [], componentKeys = {}, components = resultComponents, substringComponentKey = 0, renderSubstring = function(string, key) {
    return React__default.createElement("span", _extends({}, style("substring"), {
      key: key
    }), string);
  }, getMentionComponentForMatch = function(id, display, mentionChildIndex, key) {
    var props = {
      id: id,
      display: display,
      key: key
    }, child = React.Children.toArray(children)[mentionChildIndex];
    return React__default.cloneElement(child, props);
  };
  return iterateMentionsMarkup(value, config, function(markup, index, indexInPlainText, id, display, mentionChildIndex, lastMentionEndIndex) {
    var key = _generateComponentKey(componentKeys, id);
    components.push(getMentionComponentForMatch(id, display, mentionChildIndex, key));
  }, function(substr, index, indexInPlainText) {
    if (isNumber(caretPositionInMarkup) && caretPositionInMarkup >= index && caretPositionInMarkup <= index + substr.length) {
      var splitIndex = caretPositionInMarkup - index;
      components.push(renderSubstring(substr.substring(0, splitIndex), substringComponentKey)), 
      components = [ renderSubstring(substr.substring(splitIndex), substringComponentKey) ];
    } else components.push(renderSubstring(substr, substringComponentKey));
    substringComponentKey++;
  }), components.push(" "), components !== resultComponents && resultComponents.push(function(children) {
    return React__default.createElement("span", _extends({}, style("caret"), {
      ref: setCaretElement,
      key: "caret"
    }), children);
  }(components)), React__default.createElement("div", _extends({}, style, {
    ref: containerRef
  }), resultComponents);
}

Highlighter.propTypes = {
  selectionStart: PropTypes.number,
  selectionEnd: PropTypes.number,
  value: PropTypes.string.isRequired,
  onCaretPositionChange: PropTypes.func.isRequired,
  containerRef: PropTypes.oneOfType([ PropTypes.func, PropTypes.shape({
    current: "undefined" == typeof Element ? PropTypes.any : PropTypes.instanceOf(Element)
  }) ]),
  children: PropTypes.oneOfType([ PropTypes.element, PropTypes.arrayOf(PropTypes.element) ]).isRequired
};

var styled = createDefaultStyle({
  position: "relative",
  boxSizing: "border-box",
  width: "100%",
  color: "transparent",
  overflow: "hidden",
  whiteSpace: "pre-wrap",
  wordWrap: "break-word",
  border: "1px solid transparent",
  textAlign: "start",
  "&singleLine": {
    whiteSpace: "pre",
    wordWrap: null
  },
  substring: {
    visibility: "hidden"
  }
}, function(props) {
  return {
    "&singleLine": props.singleLine
  };
}), Highlighter$1 = styled(Highlighter);

function Suggestion(_ref) {
  var display, highlightedDisplay, id = _ref.id, focused = _ref.focused, ignoreAccents = _ref.ignoreAccents, index = _ref.index, onClick = _ref.onClick, onMouseEnter = _ref.onMouseEnter, query = _ref.query, renderSuggestion = _ref.renderSuggestion, suggestion = _ref.suggestion, style = _ref.style, rest = (_ref.className, 
  _ref.classNames, {
    onClick: onClick,
    onMouseEnter: onMouseEnter
  }), getDisplay = function() {
    if ("string" == typeof suggestion) return suggestion;
    var id = suggestion.id, display = suggestion.display;
    return void 0 !== id && display ? display : id;
  }, renderHighlightedDisplay = function(display) {
    var i = getSubstringIndex(display, query, ignoreAccents);
    return -1 === i ? React__default.createElement("span", style("display"), display) : React__default.createElement("span", style("display"), display.substring(0, i), React__default.createElement("b", style("highlight"), display.substring(i, i + query.length)), display.substring(i + query.length));
  };
  return React__default.createElement("li", _extends({
    id: id,
    role: "option",
    "aria-selected": focused
  }, rest, style), (display = getDisplay(), highlightedDisplay = renderHighlightedDisplay(display), 
  renderSuggestion ? renderSuggestion(suggestion, query, highlightedDisplay, index, focused) : highlightedDisplay));
}

Suggestion.propTypes = {
  id: PropTypes.string.isRequired,
  query: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  ignoreAccents: PropTypes.bool,
  suggestion: PropTypes.oneOfType([ PropTypes.string, PropTypes.shape({
    id: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]).isRequired,
    display: PropTypes.string
  }) ]).isRequired,
  renderSuggestion: PropTypes.func,
  focused: PropTypes.bool
};

var styled$1 = createDefaultStyle({
  cursor: "pointer"
}, function(props) {
  return {
    "&focused": props.focused
  };
}), Suggestion$1 = styled$1(Suggestion), lineStyle = {
  borderRadius: "1.25rem",
  height: "0.5rem",
  marginBottom: "0.5rem",
  background: "linear-gradient(to right, #99A0A3 0%, #707679 20%, #464A4D 40%, #464A4D 60%, #707679 80% , #99A0A3 100%)",
  backgroundSize: "1000px",
  animation: "placeholderShimmer 1.2s infinite linear",
  amimationFillMode: "forwards"
};

function ownKeys$1(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread$1(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys$1(Object(source), !0).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}

function LoadingUserItem() {
  return React.createElement("div", {
    style: {
      display: "flex",
      padding: "1rem",
      alignItems: "center",
      background: "red"
    }
  }, React.createElement("div", {
    style: {
      background: lineStyle.background,
      backgroundSize: lineStyle.backgroundSize,
      width: "2rem",
      height: "2rem",
      borderRadius: "50%",
      animation: lineStyle.animation
    }
  }), React.createElement("div", {
    style: {
      display: "block",
      alignItems: "center",
      marginLeft: "0.5rem"
    }
  }, React.createElement("div", {
    style: _objectSpread$1(_objectSpread$1({}, lineStyle), {}, {
      width: "12rem"
    })
  }), React.createElement("div", {
    style: _objectSpread$1(_objectSpread$1({}, lineStyle), {}, {
      width: "10rem"
    })
  }), React.createElement("div", {
    style: _objectSpread$1(_objectSpread$1({}, lineStyle), {}, {
      width: "8rem"
    })
  })));
}

function LoadingIndicator(_ref) {
  var style = _ref.style, className = _ref.className, classNames = _ref.classNames, styles = useStyles__default(defaultstyle, {
    style: style,
    className: className,
    classNames: classNames
  }), spinnerStyles = styles("spinner");
  return React__default.createElement("div", styles, React__default.createElement("div", spinnerStyles, React__default.createElement(React__default.Fragment, null, _toConsumableArray(Array(4)).map(function(ele) {
    return React__default.createElement(LoadingUserItem, {
      key: ele
    });
  }))));
}

var defaultstyle = {};

function SuggestionsOverlay(_ref) {
  var id = _ref.id, _ref$suggestions = _ref.suggestions, suggestions = void 0 === _ref$suggestions ? {} : _ref$suggestions, a11ySuggestionsListLabel = _ref.a11ySuggestionsListLabel, focusIndex = _ref.focusIndex, position = _ref.position, left = _ref.left, right = _ref.right, top = _ref.top, scrollFocusedIntoView = _ref.scrollFocusedIntoView, isLoading = _ref.isLoading, isOpened = _ref.isOpened, _ref$onSelect = _ref.onSelect, onSelect = void 0 === _ref$onSelect ? function() {
    return null;
  } : _ref$onSelect, ignoreAccents = _ref.ignoreAccents, containerRef = _ref.containerRef, children = _ref.children, style = _ref.style, customSuggestionsContainer = _ref.customSuggestionsContainer, onMouseDown = _ref.onMouseDown, onMouseEnter = _ref.onMouseEnter, _useState = React.useState(void 0), _useState2 = _slicedToArray(_useState, 2), ulElement = _useState2[0], setUlElement = _useState2[1];
  React.useEffect(function() {
    if (ulElement && !(ulElement.offsetHeight >= ulElement.scrollHeight) && scrollFocusedIntoView) {
      var scrollTop = ulElement.scrollTop, _ulElement$children$f = ulElement.children[focusIndex].getBoundingClientRect(), top = _ulElement$children$f.top, bottom = _ulElement$children$f.bottom, topContainer = ulElement.getBoundingClientRect().top;
      bottom = bottom - topContainer + scrollTop, (top = top - topContainer + scrollTop) < scrollTop ? ulElement.scrollTop = top : bottom > ulElement.offsetHeight && (ulElement.scrollTop = bottom - ulElement.offsetHeight);
    }
  }, [ focusIndex, scrollFocusedIntoView, ulElement ]);
  var suggestionsToRender, renderSuggestion = function(result, queryInfo, index) {
    var isFocused = index === focusIndex, childIndex = queryInfo.childIndex, query = queryInfo.query, renderSuggestion = React.Children.toArray(children)[childIndex].props.renderSuggestion;
    return React__default.createElement(Suggestion$1, {
      style: style("item"),
      key: "".concat(childIndex, "-").concat(getID(result)),
      id: getSuggestionHtmlId(id, index),
      query: query,
      index: index,
      ignoreAccents: ignoreAccents,
      renderSuggestion: renderSuggestion,
      suggestion: result,
      focused: isFocused,
      onClick: function() {
        return select(result, queryInfo);
      },
      onMouseEnter: function() {
        return handleMouseEnter(index);
      }
    });
  }, handleMouseEnter = function(index, ev) {
    onMouseEnter && onMouseEnter(index);
  }, select = function(suggestion, queryInfo) {
    onSelect(suggestion, queryInfo);
  }, getID = function(suggestion) {
    return "string" == typeof suggestion ? suggestion : suggestion.id;
  };
  return isOpened ? React__default.createElement("div", _extends({}, useStyles.inline({
    position: position || "absolute",
    left: left,
    right: right,
    top: top
  }, style), {
    onMouseDown: onMouseDown,
    ref: containerRef
  }), (suggestionsToRender = React__default.createElement("ul", _extends({
    ref: setUlElement,
    id: id,
    role: "listbox",
    "aria-label": a11ySuggestionsListLabel
  }, style("list")), Object.values(suggestions).reduce(function(accResults, _ref2) {
    var results = _ref2.results, queryInfo = _ref2.queryInfo;
    return [].concat(_toConsumableArray(accResults), _toConsumableArray(results.map(function(result, index) {
      return renderSuggestion(result, queryInfo, accResults.length + index);
    })));
  }, [])), customSuggestionsContainer ? customSuggestionsContainer(suggestionsToRender) : suggestionsToRender), function() {
    if (isLoading) return React__default.createElement(LoadingIndicator, {
      style: style("loadingIndicator")
    });
  }()) : null;
}

SuggestionsOverlay.propTypes = {
  id: PropTypes.string.isRequired,
  suggestions: PropTypes.object.isRequired,
  a11ySuggestionsListLabel: PropTypes.string,
  focusIndex: PropTypes.number,
  position: PropTypes.string,
  left: PropTypes.number,
  right: PropTypes.number,
  top: PropTypes.number,
  scrollFocusedIntoView: PropTypes.bool,
  isLoading: PropTypes.bool,
  isOpened: PropTypes.bool.isRequired,
  onSelect: PropTypes.func,
  ignoreAccents: PropTypes.bool,
  customSuggestionsContainer: PropTypes.func,
  containerRef: PropTypes.oneOfType([ PropTypes.func, PropTypes.shape({
    current: "undefined" == typeof Element ? PropTypes.any : PropTypes.instanceOf(Element)
  }) ])
};

var styled$2 = createDefaultStyle({
  zIndex: 1,
  backgroundColor: "white",
  marginTop: 14,
  minWidth: 100,
  list: {
    margin: 0,
    padding: 0,
    listStyleType: "none"
  }
}), SuggestionsOverlay$1 = styled$2(SuggestionsOverlay);

function ownKeys$2(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread$2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys$2(Object(source), !0).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$2(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function() {
    var result, Super = _getPrototypeOf(Derived);
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else result = Super.apply(this, arguments);
    return _possibleConstructorReturn(this, result);
  };
}

function _isNativeReflectConstruct() {
  if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
  if (Reflect.construct.sham) return !1;
  if ("function" == typeof Proxy) return !0;
  try {
    return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {})), 
    !0;
  } catch (e) {
    return !1;
  }
}

var makeTriggerRegex = function(trigger) {
  var options = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
  if (trigger instanceof RegExp) return trigger;
  var allowSpaceInQuery = options.allowSpaceInQuery, escapedTriggerChar = escapeRegex(trigger);
  return new RegExp("(?:^|\\s)(".concat(escapedTriggerChar, "([^").concat(allowSpaceInQuery ? "" : "\\s").concat(escapedTriggerChar, "]*))$"));
}, getDataProvider = function(data, ignoreAccents) {
  return data instanceof Array ? function(query, callback) {
    for (var results = [], i = 0, l = data.length; i < l; ++i) {
      var display = data[i].display || data[i].id;
      getSubstringIndex(display, query, ignoreAccents) >= 0 && results.push(data[i]);
    }
    return results;
  } : data;
}, KEY = {
  TAB: 9,
  RETURN: 13,
  ESC: 27,
  UP: 38,
  DOWN: 40
}, isComposing = !1, propTypes = {
  singleLine: PropTypes.bool,
  allowSpaceInQuery: PropTypes.bool,
  allowSuggestionsAboveCursor: PropTypes.bool,
  forceSuggestionsAboveCursor: PropTypes.bool,
  ignoreAccents: PropTypes.bool,
  a11ySuggestionsListLabel: PropTypes.string,
  value: PropTypes.string,
  onKeyDown: PropTypes.func,
  customSuggestionsContainer: PropTypes.func,
  onSelect: PropTypes.func,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  suggestionsPortalHost: "undefined" == typeof Element ? PropTypes.any : PropTypes.PropTypes.instanceOf(Element),
  inputRef: PropTypes.oneOfType([ PropTypes.func, PropTypes.shape({
    current: "undefined" == typeof Element ? PropTypes.any : PropTypes.instanceOf(Element)
  }) ]),
  children: PropTypes.oneOfType([ PropTypes.element, PropTypes.arrayOf(PropTypes.element) ]).isRequired
}, MentionsInput = function(_React$Component) {
  _inherits(MentionsInput, _React$Component);
  var _super = _createSuper(MentionsInput);
  function MentionsInput(_props) {
    var _this;
    return _classCallCheck(this, MentionsInput), _this = _super.call(this, _props), 
    _defineProperty(_assertThisInitialized(_this), "setContainerElement", function(el) {
      _this.containerElement = el;
    }), _defineProperty(_assertThisInitialized(_this), "getInputProps", function() {
      var _this$props = _this.props, readOnly = _this$props.readOnly, disabled = _this$props.disabled, style = _this$props.style;
      return _objectSpread$2(_objectSpread$2(_objectSpread$2(_objectSpread$2({}, omit(_this.props, [ "style", "classNames", "className" ], keys(propTypes))), style("input")), {}, {
        value: _this.getPlainText(),
        onScroll: _this.updateHighlighterScroll
      }, !readOnly && !disabled && {
        onChange: _this.handleChange,
        onSelect: _this.handleSelect,
        onKeyDown: _this.handleKeyDown,
        onBlur: _this.handleBlur,
        onCompositionStart: _this.handleCompositionStart,
        onCompositionEnd: _this.handleCompositionEnd
      }), _this.isOpened() && {
        role: "combobox",
        "aria-controls": _this.uuidSuggestionsOverlay,
        "aria-expanded": !0,
        "aria-autocomplete": "list",
        "aria-haspopup": "listbox",
        "aria-activedescendant": getSuggestionHtmlId(_this.uuidSuggestionsOverlay, _this.state.focusIndex)
      });
    }), _defineProperty(_assertThisInitialized(_this), "renderControl", function() {
      var _this$props2 = _this.props, singleLine = _this$props2.singleLine, style = _this$props2.style, inputProps = _this.getInputProps();
      return React__default.createElement("div", style("control"), _this.renderHighlighter(), singleLine ? _this.renderInput(inputProps) : _this.renderTextarea(inputProps));
    }), _defineProperty(_assertThisInitialized(_this), "renderInput", function(props) {
      return React__default.createElement("input", _extends({
        type: "text",
        ref: _this.setInputRef
      }, props));
    }), _defineProperty(_assertThisInitialized(_this), "renderTextarea", function(props) {
      return React__default.createElement("textarea", _extends({
        autoFocus: !0,
        ref: _this.setInputRef
      }, props));
    }), _defineProperty(_assertThisInitialized(_this), "setInputRef", function(el) {
      _this.inputElement = el;
      var inputRef = _this.props.inputRef;
      "function" == typeof inputRef ? inputRef(el) : inputRef && (inputRef.current = el);
    }), _defineProperty(_assertThisInitialized(_this), "setSuggestionsElement", function(el) {
      _this.suggestionsElement = el;
    }), _defineProperty(_assertThisInitialized(_this), "renderSuggestionsOverlay", function() {
      if (!isNumber(_this.state.selectionStart)) return null;
      var _this$state$suggestio = _this.state.suggestionsPosition, position = _this$state$suggestio.position, left = _this$state$suggestio.left, top = _this$state$suggestio.top, right = _this$state$suggestio.right, suggestionsNode = React__default.createElement(SuggestionsOverlay$1, {
        id: _this.uuidSuggestionsOverlay,
        style: _this.props.style("suggestions"),
        position: position,
        left: left,
        top: top,
        right: right,
        focusIndex: _this.state.focusIndex,
        scrollFocusedIntoView: _this.state.scrollFocusedIntoView,
        containerRef: _this.setSuggestionsElement,
        suggestions: _this.state.suggestions,
        customSuggestionsContainer: _this.props.customSuggestionsContainer,
        onSelect: _this.addMention,
        onMouseDown: _this.handleSuggestionsMouseDown,
        onMouseEnter: _this.handleSuggestionsMouseEnter,
        isLoading: _this.isLoading(),
        isOpened: _this.isOpened(),
        ignoreAccents: _this.props.ignoreAccents,
        a11ySuggestionsListLabel: _this.props.a11ySuggestionsListLabel
      }, _this.props.children);
      return _this.props.suggestionsPortalHost ? ReactDOM.createPortal(suggestionsNode, _this.props.suggestionsPortalHost) : suggestionsNode;
    }), _defineProperty(_assertThisInitialized(_this), "renderHighlighter", function() {
      var _this$state = _this.state, selectionStart = _this$state.selectionStart, selectionEnd = _this$state.selectionEnd, _this$props3 = _this.props, singleLine = _this$props3.singleLine, children = _this$props3.children, value = _this$props3.value, style = _this$props3.style;
      return React__default.createElement(Highlighter$1, {
        containerRef: _this.setHighlighterElement,
        style: style("highlighter"),
        value: value,
        singleLine: singleLine,
        selectionStart: selectionStart,
        selectionEnd: selectionEnd,
        onCaretPositionChange: _this.handleCaretPositionChange
      }, children);
    }), _defineProperty(_assertThisInitialized(_this), "setHighlighterElement", function(el) {
      _this.highlighterElement = el;
    }), _defineProperty(_assertThisInitialized(_this), "handleCaretPositionChange", function(position) {
      _this.setState({
        caretPosition: position
      });
    }), _defineProperty(_assertThisInitialized(_this), "getPlainText", function() {
      return getPlainText(_this.props.value || "", readConfigFromChildren(_this.props.children));
    }), _defineProperty(_assertThisInitialized(_this), "executeOnChange", function(event) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) args[_key - 1] = arguments[_key];
      var _this$props4, _this$props$valueLink;
      return _this.props.onChange ? (_this$props4 = _this.props).onChange.apply(_this$props4, [ event ].concat(args)) : _this.props.valueLink ? (_this$props$valueLink = _this.props.valueLink).requestChange.apply(_this$props$valueLink, [ event.target.value ].concat(args)) : void 0;
    }), _defineProperty(_assertThisInitialized(_this), "handleChange", function(ev) {
      if ((isComposing = !1, isIE()) && (document.activeElement && document.activeElement.contentDocument || document).activeElement !== ev.target) return;
      var value = _this.props.value || "", config = readConfigFromChildren(_this.props.children), newPlainTextValue = ev.target.value, newValue = applyChangeToValue(value, newPlainTextValue, {
        selectionStartBefore: _this.state.selectionStart,
        selectionEndBefore: _this.state.selectionEnd,
        selectionEndAfter: ev.target.selectionEnd
      }, config);
      newPlainTextValue = getPlainText(newValue, config);
      var selectionStart = ev.target.selectionStart, selectionEnd = ev.target.selectionEnd, setSelectionAfterMentionChange = !1, startOfMention = findStartOfMentionInPlainText(value, config, selectionStart);
      void 0 !== startOfMention && _this.state.selectionEnd > startOfMention && (selectionEnd = selectionStart = startOfMention + (ev.nativeEvent.data ? ev.nativeEvent.data.length : 0), 
      setSelectionAfterMentionChange = !0), _this.setState({
        selectionStart: selectionStart,
        selectionEnd: selectionEnd,
        setSelectionAfterMentionChange: setSelectionAfterMentionChange
      });
      var mentions = getMentions(newValue, config), eventMock = {
        target: {
          value: newValue
        }
      };
      _this.executeOnChange(eventMock, newValue, newPlainTextValue, mentions);
    }), _defineProperty(_assertThisInitialized(_this), "handleSelect", function(ev) {
      if (_this.setState({
        selectionStart: ev.target.selectionStart,
        selectionEnd: ev.target.selectionEnd
      }), !isComposing) {
        var el = _this.inputElement;
        ev.target.selectionStart === ev.target.selectionEnd ? _this.updateMentionsQueries(el.value, ev.target.selectionStart) : _this.clearSuggestions(), 
        _this.updateHighlighterScroll(), _this.props.onSelect(ev);
      }
    }), _defineProperty(_assertThisInitialized(_this), "handleKeyDown", function(ev) {
      if (0 !== countSuggestions(_this.state.suggestions) && _this.suggestionsElement) switch (Object.values(KEY).indexOf(ev.keyCode) >= 0 && (ev.preventDefault(), 
      ev.stopPropagation()), ev.keyCode) {
       case KEY.ESC:
        return void _this.clearSuggestions();

       case KEY.DOWN:
        return void _this.shiftFocus(1);

       case KEY.UP:
        return void _this.shiftFocus(-1);

       case KEY.RETURN:
       case KEY.TAB:
        return void _this.selectFocused();

       default:
        return;
      } else _this.props.onKeyDown(ev);
    }), _defineProperty(_assertThisInitialized(_this), "shiftFocus", function(delta) {
      var suggestionsCount = countSuggestions(_this.state.suggestions);
      _this.setState({
        focusIndex: (suggestionsCount + _this.state.focusIndex + delta) % suggestionsCount,
        scrollFocusedIntoView: !0
      });
    }), _defineProperty(_assertThisInitialized(_this), "selectFocused", function() {
      var _this$state2 = _this.state, suggestions = _this$state2.suggestions, focusIndex = _this$state2.focusIndex, _Object$values$reduce = Object.values(suggestions).reduce(function(acc, _ref) {
        var results = _ref.results, queryInfo = _ref.queryInfo;
        return [].concat(_toConsumableArray(acc), _toConsumableArray(results.map(function(result) {
          return {
            result: result,
            queryInfo: queryInfo
          };
        })));
      }, [])[focusIndex], result = _Object$values$reduce.result, queryInfo = _Object$values$reduce.queryInfo;
      _this.addMention(result, queryInfo), _this.setState({
        focusIndex: 0
      });
    }), _defineProperty(_assertThisInitialized(_this), "handleBlur", function(ev) {
      var clickedSuggestion = _this._suggestionsMouseDown;
      _this._suggestionsMouseDown = !1, clickedSuggestion || _this.setState({
        selectionStart: null,
        selectionEnd: null
      }), window.setTimeout(function() {
        _this.updateHighlighterScroll();
      }, 1), _this.props.onBlur(ev, clickedSuggestion);
    }), _defineProperty(_assertThisInitialized(_this), "handleSuggestionsMouseDown", function(ev) {
      _this._suggestionsMouseDown = !0;
    }), _defineProperty(_assertThisInitialized(_this), "handleSuggestionsMouseEnter", function(focusIndex) {
      _this.setState({
        focusIndex: focusIndex,
        scrollFocusedIntoView: !1
      });
    }), _defineProperty(_assertThisInitialized(_this), "updateSuggestionsPosition", function() {
      var caretPosition = _this.state.caretPosition, _this$props5 = _this.props, suggestionsPortalHost = _this$props5.suggestionsPortalHost, allowSuggestionsAboveCursor = _this$props5.allowSuggestionsAboveCursor, forceSuggestionsAboveCursor = _this$props5.forceSuggestionsAboveCursor;
      if (caretPosition && _this.suggestionsElement) {
        var suggestions = _this.suggestionsElement, highlighter = _this.highlighterElement, caretOffsetParentRect = highlighter.getBoundingClientRect(), caretHeight = getComputedStyleLengthProp(highlighter, "font-size"), viewportRelative = {
          left: caretOffsetParentRect.left + caretPosition.left,
          top: caretOffsetParentRect.top + caretPosition.top + caretHeight
        }, viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        if (suggestions) {
          var position = {};
          if (suggestionsPortalHost) {
            position.position = "fixed";
            var left = viewportRelative.left, top = viewportRelative.top;
            left -= getComputedStyleLengthProp(suggestions, "margin-left"), top -= getComputedStyleLengthProp(suggestions, "margin-top"), 
            left -= highlighter.scrollLeft, top -= highlighter.scrollTop;
            var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            left + suggestions.offsetWidth > viewportWidth ? position.left = Math.max(0, viewportWidth - suggestions.offsetWidth) : position.left = left, 
            allowSuggestionsAboveCursor && top + suggestions.offsetHeight > viewportHeight && suggestions.offsetHeight < top - caretHeight || forceSuggestionsAboveCursor ? position.top = Math.max(0, top - suggestions.offsetHeight - caretHeight) : position.top = top;
          } else {
            var _left = caretPosition.left - highlighter.scrollLeft, _top = caretPosition.top - highlighter.scrollTop;
            _left + suggestions.offsetWidth > _this.containerElement.offsetWidth ? position.right = 0 : position.left = _left, 
            allowSuggestionsAboveCursor && viewportRelative.top - highlighter.scrollTop + suggestions.offsetHeight > viewportHeight && suggestions.offsetHeight < caretOffsetParentRect.top - caretHeight - highlighter.scrollTop || forceSuggestionsAboveCursor ? position.top = _top - suggestions.offsetHeight - caretHeight : position.top = _top;
          }
          position.left === _this.state.suggestionsPosition.left && position.top === _this.state.suggestionsPosition.top && position.position === _this.state.suggestionsPosition.position || _this.setState({
            suggestionsPosition: position
          });
        }
      }
    }), _defineProperty(_assertThisInitialized(_this), "updateHighlighterScroll", function() {
      var input = _this.inputElement, highlighter = _this.highlighterElement;
      input && highlighter && (highlighter.scrollLeft = input.scrollLeft, highlighter.scrollTop = input.scrollTop, 
      highlighter.height = input.height);
    }), _defineProperty(_assertThisInitialized(_this), "handleCompositionStart", function() {
      isComposing = !0;
    }), _defineProperty(_assertThisInitialized(_this), "handleCompositionEnd", function() {
      isComposing = !1;
    }), _defineProperty(_assertThisInitialized(_this), "setSelection", function(selectionStart, selectionEnd) {
      if (null !== selectionStart && null !== selectionEnd) {
        var el = _this.inputElement;
        if (el.setSelectionRange) el.setSelectionRange(selectionStart, selectionEnd); else if (el.createTextRange) {
          var range = el.createTextRange();
          range.collapse(!0), range.moveEnd("character", selectionEnd), range.moveStart("character", selectionStart), 
          range.select();
        }
      }
    }), _defineProperty(_assertThisInitialized(_this), "updateMentionsQueries", function(plainTextValue, caretPosition) {
      _this._queryId++, _this.suggestions = {}, _this.setState({
        suggestions: {}
      });
      var value = _this.props.value || "", children = _this.props.children, config = readConfigFromChildren(children), positionInValue = mapPlainTextIndex(value, config, caretPosition, "NULL");
      if (null !== positionInValue) {
        var substringStartIndex = getEndOfLastMention(value.substring(0, positionInValue), config), substring = plainTextValue.substring(substringStartIndex, caretPosition);
        React__default.Children.forEach(children, function(child, childIndex) {
          if (child) {
            var regex = makeTriggerRegex(child.props.trigger, _this.props), match = substring.match(regex);
            if (match) {
              var querySequenceStart = substringStartIndex + substring.indexOf(match[1], match.index);
              _this.queryData(match[2], childIndex, querySequenceStart, querySequenceStart + match[1].length, plainTextValue);
            }
          }
        });
      }
    }), _defineProperty(_assertThisInitialized(_this), "clearSuggestions", function() {
      _this._queryId++, _this.suggestions = {}, _this.setState({
        suggestions: {},
        focusIndex: 0
      });
    }), _defineProperty(_assertThisInitialized(_this), "queryData", function(query, childIndex, querySequenceStart, querySequenceEnd, plainTextValue) {
      var _this$props6 = _this.props, children = _this$props6.children, ignoreAccents = _this$props6.ignoreAccents, mentionChild = React.Children.toArray(children)[childIndex], syncResult = getDataProvider(mentionChild.props.data, ignoreAccents)(query, _this.updateSuggestions.bind(null, _this._queryId, childIndex, query, querySequenceStart, querySequenceEnd, plainTextValue));
      syncResult instanceof Array && _this.updateSuggestions(_this._queryId, childIndex, query, querySequenceStart, querySequenceEnd, plainTextValue, syncResult);
    }), _defineProperty(_assertThisInitialized(_this), "updateSuggestions", function(queryId, childIndex, query, querySequenceStart, querySequenceEnd, plainTextValue, results) {
      if (queryId === _this._queryId) {
        _this.suggestions = _objectSpread$2(_objectSpread$2({}, _this.suggestions), {}, _defineProperty({}, childIndex, {
          queryInfo: {
            childIndex: childIndex,
            query: query,
            querySequenceStart: querySequenceStart,
            querySequenceEnd: querySequenceEnd,
            plainTextValue: plainTextValue
          },
          results: results
        }));
        var focusIndex = _this.state.focusIndex, suggestionsCount = countSuggestions(_this.suggestions);
        _this.setState({
          suggestions: _this.suggestions,
          focusIndex: focusIndex >= suggestionsCount ? Math.max(suggestionsCount - 1, 0) : focusIndex
        });
      }
    }), _defineProperty(_assertThisInitialized(_this), "addMention", function(_ref2, _ref3) {
      var id = _ref2.id, display = _ref2.display, childIndex = _ref3.childIndex, querySequenceStart = _ref3.querySequenceStart, querySequenceEnd = _ref3.querySequenceEnd, plainTextValue = _ref3.plainTextValue, value = _this.props.value || "", config = readConfigFromChildren(_this.props.children), _mentionsChild$props = React.Children.toArray(_this.props.children)[childIndex].props, markup = _mentionsChild$props.markup, displayTransform = _mentionsChild$props.displayTransform, appendSpaceOnAdd = _mentionsChild$props.appendSpaceOnAdd, onAdd = _mentionsChild$props.onAdd, start = mapPlainTextIndex(value, config, querySequenceStart, "START"), end = start + querySequenceEnd - querySequenceStart, insert = makeMentionsMarkup(markup, id, display);
      appendSpaceOnAdd && (insert += " ");
      var newValue = spliceString(value, start, end, insert);
      _this.inputElement.focus();
      var displayValue = displayTransform(id, display);
      appendSpaceOnAdd && (displayValue += " ");
      var newCaretPosition = querySequenceStart + displayValue.length;
      _this.setState({
        selectionStart: newCaretPosition,
        selectionEnd: newCaretPosition,
        setSelectionAfterMentionChange: !0
      });
      var eventMock = {
        target: {
          value: newValue
        }
      }, mentions = getMentions(newValue, config), newPlainTextValue = spliceString(plainTextValue, querySequenceStart, querySequenceEnd, displayValue);
      _this.executeOnChange(eventMock, newValue, newPlainTextValue, mentions), onAdd && onAdd(id, display, start, end), 
      _this.clearSuggestions();
    }), _defineProperty(_assertThisInitialized(_this), "isLoading", function() {
      var isLoading = !1;
      return React__default.Children.forEach(_this.props.children, function(child) {
        isLoading = isLoading || child && child.props.isLoading;
      }), isLoading;
    }), _defineProperty(_assertThisInitialized(_this), "isOpened", function() {
      return isNumber(_this.state.selectionStart) && (0 !== countSuggestions(_this.state.suggestions) || _this.isLoading());
    }), _defineProperty(_assertThisInitialized(_this), "_queryId", 0), _this.suggestions = {}, 
    _this.uuidSuggestionsOverlay = Math.random().toString(16).substring(2), _this.handleCopy = _this.handleCopy.bind(_assertThisInitialized(_this)), 
    _this.handleCut = _this.handleCut.bind(_assertThisInitialized(_this)), _this.handlePaste = _this.handlePaste.bind(_assertThisInitialized(_this)), 
    _this.state = {
      focusIndex: 0,
      selectionStart: null,
      selectionEnd: null,
      suggestions: {},
      caretPosition: null,
      suggestionsPosition: {},
      setSelectionAfterHandlePaste: !1
    }, _this;
  }
  return _createClass(MentionsInput, [ {
    key: "componentDidMount",
    value: function() {
      document.addEventListener("copy", this.handleCopy), document.addEventListener("cut", this.handleCut), 
      document.addEventListener("paste", this.handlePaste), this.updateSuggestionsPosition();
    }
  }, {
    key: "componentDidUpdate",
    value: function(prevProps, prevState) {
      prevState.suggestionsPosition === this.state.suggestionsPosition && this.updateSuggestionsPosition(), 
      this.state.setSelectionAfterMentionChange && (this.setState({
        setSelectionAfterMentionChange: !1
      }), this.setSelection(this.state.selectionStart, this.state.selectionEnd)), this.state.setSelectionAfterHandlePaste && (this.setState({
        setSelectionAfterHandlePaste: !1
      }), this.setSelection(this.state.selectionStart, this.state.selectionEnd));
    }
  }, {
    key: "componentWillUnmount",
    value: function() {
      document.removeEventListener("copy", this.handleCopy), document.removeEventListener("cut", this.handleCut), 
      document.removeEventListener("paste", this.handlePaste);
    }
  }, {
    key: "render",
    value: function() {
      return React__default.createElement("div", _extends({
        ref: this.setContainerElement
      }, this.props.style), this.renderControl(), this.renderSuggestionsOverlay());
    }
  }, {
    key: "handlePaste",
    value: function(event) {
      if (event.target === this.inputElement && this.supportsClipboardActions(event)) {
        event.preventDefault();
        var _this$state3 = this.state, selectionStart = _this$state3.selectionStart, selectionEnd = _this$state3.selectionEnd, _this$props7 = this.props, value = _this$props7.value, children = _this$props7.children, config = readConfigFromChildren(children), markupStartIndex = mapPlainTextIndex(value, config, selectionStart, "START"), markupEndIndex = mapPlainTextIndex(value, config, selectionEnd, "END"), pastedMentions = event.clipboardData.getData("text/react-mentions"), pastedData = event.clipboardData.getData("text/plain"), newValue = spliceString(value, markupStartIndex, markupEndIndex, pastedMentions || pastedData).replace(/\r/g, ""), newPlainTextValue = getPlainText(newValue, config), eventMock = {
          target: _objectSpread$2(_objectSpread$2({}, event.target), {}, {
            value: newValue
          })
        };
        this.executeOnChange(eventMock, newValue, newPlainTextValue, getMentions(newValue, config));
        var nextPos = (findStartOfMentionInPlainText(value, config, selectionStart) || selectionStart) + getPlainText(pastedMentions || pastedData, config).length;
        this.setState({
          selectionStart: nextPos,
          selectionEnd: nextPos,
          setSelectionAfterHandlePaste: !0
        });
      }
    }
  }, {
    key: "saveSelectionToClipboard",
    value: function(event) {
      var selectionStart = this.inputElement.selectionStart, selectionEnd = this.inputElement.selectionEnd, _this$props8 = this.props, children = _this$props8.children, value = _this$props8.value, config = readConfigFromChildren(children), markupStartIndex = mapPlainTextIndex(value, config, selectionStart, "START"), markupEndIndex = mapPlainTextIndex(value, config, selectionEnd, "END");
      event.clipboardData.setData("text/plain", event.target.value.slice(selectionStart, selectionEnd)), 
      event.clipboardData.setData("text/react-mentions", value.slice(markupStartIndex, markupEndIndex));
    }
  }, {
    key: "supportsClipboardActions",
    value: function(event) {
      return !!event.clipboardData;
    }
  }, {
    key: "handleCopy",
    value: function(event) {
      event.target === this.inputElement && this.supportsClipboardActions(event) && (event.preventDefault(), 
      this.saveSelectionToClipboard(event));
    }
  }, {
    key: "handleCut",
    value: function(event) {
      if (event.target === this.inputElement && this.supportsClipboardActions(event)) {
        event.preventDefault(), this.saveSelectionToClipboard(event);
        var _this$state4 = this.state, selectionStart = _this$state4.selectionStart, selectionEnd = _this$state4.selectionEnd, _this$props9 = this.props, children = _this$props9.children, value = _this$props9.value, config = readConfigFromChildren(children), markupStartIndex = mapPlainTextIndex(value, config, selectionStart, "START"), markupEndIndex = mapPlainTextIndex(value, config, selectionEnd, "END"), newValue = [ value.slice(0, markupStartIndex), value.slice(markupEndIndex) ].join(""), newPlainTextValue = getPlainText(newValue, config), eventMock = {
          target: _objectSpread$2(_objectSpread$2({}, event.target), {}, {
            value: newPlainTextValue
          })
        };
        this.executeOnChange(eventMock, newValue, newPlainTextValue, getMentions(value, config));
      }
    }
  } ]), MentionsInput;
}(React__default.Component);

_defineProperty(MentionsInput, "propTypes", propTypes), _defineProperty(MentionsInput, "defaultProps", {
  ignoreAccents: !1,
  singleLine: !1,
  allowSuggestionsAboveCursor: !1,
  onKeyDown: function() {
    return null;
  },
  onSelect: function() {
    return null;
  },
  onBlur: function() {
    return null;
  }
});

var getComputedStyleLengthProp = function(forElement, propertyName) {
  var length = parseFloat(window.getComputedStyle(forElement, null).getPropertyValue(propertyName));
  return isFinite(length) ? length : 0;
}, isMobileSafari = "undefined" != typeof navigator && /iPhone|iPad|iPod/i.test(navigator.userAgent), styled$3 = createDefaultStyle({
  position: "relative",
  overflowY: "visible",
  input: {
    display: "block",
    width: "100%",
    position: "absolute",
    margin: 0,
    top: 0,
    left: 0,
    boxSizing: "border-box",
    backgroundColor: "transparent",
    fontFamily: "inherit",
    fontSize: "inherit",
    letterSpacing: "inherit"
  },
  "&multiLine": {
    input: _objectSpread$2({
      height: "100%",
      bottom: 0,
      overflow: "hidden",
      resize: "none"
    }, isMobileSafari ? {
      marginTop: 1,
      marginLeft: -3
    } : null)
  }
}, function(_ref4) {
  var singleLine = _ref4.singleLine;
  return {
    "&singleLine": singleLine,
    "&multiLine": !singleLine
  };
}), MentionsInput$1 = styled$3(MentionsInput), defaultStyle = {
  fontWeight: "inherit"
}, Mention = function(_ref) {
  var display = _ref.display, style = _ref.style, className = _ref.className, classNames = _ref.classNames, styles = useStyles__default(defaultStyle, {
    style: style,
    className: className,
    classNames: classNames
  });
  return React__default.createElement("strong", styles, display);
};

Mention.defaultProps = {
  trigger: "@",
  markup: "@[__display__](__id__)",
  displayTransform: function(id, display) {
    return display || id;
  },
  onAdd: function() {
    return null;
  },
  onRemove: function() {
    return null;
  },
  renderSuggestion: null,
  isLoading: !1,
  appendSpaceOnAdd: !1
}, exports.Mention = Mention, exports.MentionsInput = MentionsInput$1;
