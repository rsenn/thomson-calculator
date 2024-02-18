/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/css-loader/dist/cjs.js!./src/stylesheets/main.css":
/*!************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/stylesheets/main.css ***!
  \************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/cssWithMappingToString.js */ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "html,\nbody {\n  width: 100%;\n  height: 100%;\n}\n\nbody {\n  display: flex;\n  flex-flow: column;\n  justify-content: flex-start;\n  align-items: center;\n  font-family: sans-serif;\n  color: #525252;\n}\n\nh2 {\n  color: black;\n}\n\nbody {\n  overflow: hidden;\n}\n\nbody {\n  background: white;\n  /*background: linear-gradient(0deg, #eee, #fff);*/\n}\n\nbody {\n  user-select: none;\n}\n\nbody img {\n  height: 4em;\n  width: auto;\n  margin: 0.5em 0 2em 0;\n}\n\ninput {\n  user-select: contain;\n  margin-left: 0.5em;\n}\n\nform {\n  display: flex;\n  flex-flow: column;\n  align-items: center;\n  justify-content: space-between;\n}\n\n#fields input {\n  font-family: fixed;\n  font-size: 1rem;\n  /*padding: 0.3em 0.3em 0 0.3em;*/\n}\n\n#status {\n  position: fixed;\n  bottom: 2em;\n}\n\n#status {\n  margin-top: 2em;\n  font-size: 1rem;\n  font-weight: 0;\n}\n\n#status > div {\n  box-shadow: 0px 0px 10px black;\n  /*border: 2px solid hsla(60, 100%, 0%, 1); */\n  padding: 0.5em;\n  color: #000;\n  background: hsla(60, 100%, 50%, 1);\n  background: linear-gradient(180deg, hsla(60, 100%, 50%, 1) 0%, hsla(50, 100%, 50%, 1));\n  font-weight: bold;\n}\n\n#precision_grp {\n  font-size: 12pt;\n  align-self: center;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n#precision_grp label {\n  font-weight: 100;\n  transform: translateY(1px);\n}\n\n#precision_num {\n  margin: 0 0.5em 0 0.5em;\n}\n\na {\n  text-decoration: none;\n  color: #cb3837;\n}\n\n.fields {\n  display: flex;\n  flex: column;\n}\n\nlabel {\n  padding: 2px 4px 2px 4px;\n}\n\nlabel b {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n  width: 100%;\n}\n\ninput {\n  border: 2px #eee inset;\n  text-align: right;\n  background: white;\n  padding: 0.3em 0.3em 0 0.3em;\n  margin: 0.125em 0.125em 0.125em 0.5em;\n}\n\ninput.selected {\n  color: #d00;\n}\n\nlabel {\n  display: inline-flex;\n  align-items: center;\n}\n\nlabel.var.selected {\n  background: black;\n  color: white;\n}\n\nlabel.name.selected {\n  color: white;\n  /* font-weight: bold;*/\n  text-shadow: black 1px 1px 3px;\n}\n\nlabel.name.inductance.selected {\n  background: linear-gradient(90deg, hsla(30, 100%, 40%, 1) 0%, hsla(40, 100%, 50%, 1));\n}\n\nlabel.name.capacitance.selected {\n  background: linear-gradient(90deg, hsla(80, 100%, 40%, 1) 0%, hsla(120, 100%, 40%, 1));\n}\n\nlabel.name.frequency.selected {\n  background: linear-gradient(90deg, hsla(300, 100%, 40%, 1) 0%, hsla(280, 100%, 40%, 1));\n}\n\n#precision {\n  transform: translateY(1px);\n}\n\n#precision_num {\n  display: inline-flex;\n  align-items: center;\n  justify-content: flex-end;\n  text-align: center;\n  min-width: 2em;\n  max-width: 3em;\n  height: 1.5em;\n}\n\n#precision_grp {\n  margin-top: 2em;\n}\n\n.tooltip {\n  position: relative;\n}\n.tooltip:hover {\n  text-decoration: none;\n}\n.tooltip:after {\n  content: attr(tip);\n  font-family: Arial, Helvetica, sans-serif;\n  font-size: 90%;\n  line-height: 1.2em;\n  color: #fff;\n  width: 200px;\n  padding: 5px 10px;\n  -moz-border-radius: 6px;\n  -webkit-border-radius: 6px;\n  border-radius: 6px;\n  background: #c00d3f;\n  background: -webkit-linear-gradient(#c00d3f, #7b0a2a);\n  background: -moz-linear-gradient(#c00d3f, #7b0a2a);\n  background: -o-linear-gradient(#c00d3f, #7b0a2a);\n  background: -ms-linear-gradient(#c00d3f, #7b0a2a);\n  background: linear-gradient(#c00d3f, #7b0a2a);\n  -moz-box-shadow: 3px 3px 4px rgba(0, 0, 0, 0.65);\n  -webkit-box-shadow: 3px 3px 4px rgba(0, 0, 0, 0.65);\n  box-shadow: 3px 3px 4px rgba(0, 0, 0, 0.65);\n  position: absolute;\n  top: 27px;\n  left: -10px;\n  display: none;\n}\n.tooltip:before {\n  z-index: 1000;\n  position: absolute;\n  content: '';\n  top: 15px;\n  left: 0px;\n  border-right: 7px transparent solid;\n  border-left: 7px transparent solid;\n  display: none;\n}\n.tooltip:hover {\n  z-index: 1000;\n  position: relative;\n  color: #8325f7;\n}\n.tooltip:hover:after {\n  display: block;\n}\n.tooltip:hover:before {\n  display: block;\n}\n", "",{"version":3,"sources":["webpack://./src/stylesheets/main.css"],"names":[],"mappings":"AAAA;;EAEE,WAAW;EACX,YAAY;AACd;;AAEA;EACE,aAAa;EACb,iBAAiB;EACjB,2BAA2B;EAC3B,mBAAmB;EACnB,uBAAuB;EACvB,cAAc;AAChB;;AAEA;EACE,YAAY;AACd;;AAEA;EACE,gBAAgB;AAClB;;AAEA;EACE,iBAAiB;EACjB,iDAAiD;AACnD;;AAEA;EACE,iBAAiB;AACnB;;AAEA;EACE,WAAW;EACX,WAAW;EACX,qBAAqB;AACvB;;AAEA;EACE,oBAAoB;EACpB,kBAAkB;AACpB;;AAEA;EACE,aAAa;EACb,iBAAiB;EACjB,mBAAmB;EACnB,8BAA8B;AAChC;;AAEA;EACE,kBAAkB;EAClB,eAAe;EACf,gCAAgC;AAClC;;AAEA;EACE,eAAe;EACf,WAAW;AACb;;AAEA;EACE,eAAe;EACf,eAAe;EACf,cAAc;AAChB;;AAEA;EACE,8BAA8B;EAC9B,4CAA4C;EAC5C,cAAc;EACd,WAAW;EACX,kCAAkC;EAClC,sFAAsF;EACtF,iBAAiB;AACnB;;AAEA;EACE,eAAe;EACf,kBAAkB;EAClB,aAAa;EACb,uBAAuB;EACvB,mBAAmB;AACrB;;AAEA;EACE,gBAAgB;EAChB,0BAA0B;AAC5B;;AAEA;EACE,uBAAuB;AACzB;;AAEA;EACE,qBAAqB;EACrB,cAAc;AAChB;;AAEA;EACE,aAAa;EACb,YAAY;AACd;;AAEA;EACE,wBAAwB;AAC1B;;AAEA;EACE,aAAa;EACb,mBAAmB;EACnB,uBAAuB;EACvB,kBAAkB;EAClB,WAAW;AACb;;AAEA;EACE,sBAAsB;EACtB,iBAAiB;EACjB,iBAAiB;EACjB,4BAA4B;EAC5B,qCAAqC;AACvC;;AAEA;EACE,WAAW;AACb;;AAEA;EACE,oBAAoB;EACpB,mBAAmB;AACrB;;AAEA;EACE,iBAAiB;EACjB,YAAY;AACd;;AAEA;EACE,YAAY;EACZ,sBAAsB;EACtB,8BAA8B;AAChC;;AAEA;EACE,qFAAqF;AACvF;;AAEA;EACE,sFAAsF;AACxF;;AAEA;EACE,uFAAuF;AACzF;;AAEA;EACE,0BAA0B;AAC5B;;AAEA;EACE,oBAAoB;EACpB,mBAAmB;EACnB,yBAAyB;EACzB,kBAAkB;EAClB,cAAc;EACd,cAAc;EACd,aAAa;AACf;;AAEA;EACE,eAAe;AACjB;;AAEA;EACE,kBAAkB;AACpB;AACA;EACE,qBAAqB;AACvB;AACA;EACE,kBAAkB;EAClB,yCAAyC;EACzC,cAAc;EACd,kBAAkB;EAClB,WAAW;EACX,YAAY;EACZ,iBAAiB;EACjB,uBAAuB;EACvB,0BAA0B;EAC1B,kBAAkB;EAClB,mBAAmB;EACnB,qDAAqD;EACrD,kDAAkD;EAClD,gDAAgD;EAChD,iDAAiD;EACjD,6CAA6C;EAC7C,gDAAgD;EAChD,mDAAmD;EACnD,2CAA2C;EAC3C,kBAAkB;EAClB,SAAS;EACT,WAAW;EACX,aAAa;AACf;AACA;EACE,aAAa;EACb,kBAAkB;EAClB,WAAW;EACX,SAAS;EACT,SAAS;EACT,mCAAmC;EACnC,kCAAkC;EAClC,aAAa;AACf;AACA;EACE,aAAa;EACb,kBAAkB;EAClB,cAAc;AAChB;AACA;EACE,cAAc;AAChB;AACA;EACE,cAAc;AAChB","sourcesContent":["html,\nbody {\n  width: 100%;\n  height: 100%;\n}\n\nbody {\n  display: flex;\n  flex-flow: column;\n  justify-content: flex-start;\n  align-items: center;\n  font-family: sans-serif;\n  color: #525252;\n}\n\nh2 {\n  color: black;\n}\n\nbody {\n  overflow: hidden;\n}\n\nbody {\n  background: white;\n  /*background: linear-gradient(0deg, #eee, #fff);*/\n}\n\nbody {\n  user-select: none;\n}\n\nbody img {\n  height: 4em;\n  width: auto;\n  margin: 0.5em 0 2em 0;\n}\n\ninput {\n  user-select: contain;\n  margin-left: 0.5em;\n}\n\nform {\n  display: flex;\n  flex-flow: column;\n  align-items: center;\n  justify-content: space-between;\n}\n\n#fields input {\n  font-family: fixed;\n  font-size: 1rem;\n  /*padding: 0.3em 0.3em 0 0.3em;*/\n}\n\n#status {\n  position: fixed;\n  bottom: 2em;\n}\n\n#status {\n  margin-top: 2em;\n  font-size: 1rem;\n  font-weight: 0;\n}\n\n#status > div {\n  box-shadow: 0px 0px 10px black;\n  /*border: 2px solid hsla(60, 100%, 0%, 1); */\n  padding: 0.5em;\n  color: #000;\n  background: hsla(60, 100%, 50%, 1);\n  background: linear-gradient(180deg, hsla(60, 100%, 50%, 1) 0%, hsla(50, 100%, 50%, 1));\n  font-weight: bold;\n}\n\n#precision_grp {\n  font-size: 12pt;\n  align-self: center;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n#precision_grp label {\n  font-weight: 100;\n  transform: translateY(1px);\n}\n\n#precision_num {\n  margin: 0 0.5em 0 0.5em;\n}\n\na {\n  text-decoration: none;\n  color: #cb3837;\n}\n\n.fields {\n  display: flex;\n  flex: column;\n}\n\nlabel {\n  padding: 2px 4px 2px 4px;\n}\n\nlabel b {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n  width: 100%;\n}\n\ninput {\n  border: 2px #eee inset;\n  text-align: right;\n  background: white;\n  padding: 0.3em 0.3em 0 0.3em;\n  margin: 0.125em 0.125em 0.125em 0.5em;\n}\n\ninput.selected {\n  color: #d00;\n}\n\nlabel {\n  display: inline-flex;\n  align-items: center;\n}\n\nlabel.var.selected {\n  background: black;\n  color: white;\n}\n\nlabel.name.selected {\n  color: white;\n  /* font-weight: bold;*/\n  text-shadow: black 1px 1px 3px;\n}\n\nlabel.name.inductance.selected {\n  background: linear-gradient(90deg, hsla(30, 100%, 40%, 1) 0%, hsla(40, 100%, 50%, 1));\n}\n\nlabel.name.capacitance.selected {\n  background: linear-gradient(90deg, hsla(80, 100%, 40%, 1) 0%, hsla(120, 100%, 40%, 1));\n}\n\nlabel.name.frequency.selected {\n  background: linear-gradient(90deg, hsla(300, 100%, 40%, 1) 0%, hsla(280, 100%, 40%, 1));\n}\n\n#precision {\n  transform: translateY(1px);\n}\n\n#precision_num {\n  display: inline-flex;\n  align-items: center;\n  justify-content: flex-end;\n  text-align: center;\n  min-width: 2em;\n  max-width: 3em;\n  height: 1.5em;\n}\n\n#precision_grp {\n  margin-top: 2em;\n}\n\n.tooltip {\n  position: relative;\n}\n.tooltip:hover {\n  text-decoration: none;\n}\n.tooltip:after {\n  content: attr(tip);\n  font-family: Arial, Helvetica, sans-serif;\n  font-size: 90%;\n  line-height: 1.2em;\n  color: #fff;\n  width: 200px;\n  padding: 5px 10px;\n  -moz-border-radius: 6px;\n  -webkit-border-radius: 6px;\n  border-radius: 6px;\n  background: #c00d3f;\n  background: -webkit-linear-gradient(#c00d3f, #7b0a2a);\n  background: -moz-linear-gradient(#c00d3f, #7b0a2a);\n  background: -o-linear-gradient(#c00d3f, #7b0a2a);\n  background: -ms-linear-gradient(#c00d3f, #7b0a2a);\n  background: linear-gradient(#c00d3f, #7b0a2a);\n  -moz-box-shadow: 3px 3px 4px rgba(0, 0, 0, 0.65);\n  -webkit-box-shadow: 3px 3px 4px rgba(0, 0, 0, 0.65);\n  box-shadow: 3px 3px 4px rgba(0, 0, 0, 0.65);\n  position: absolute;\n  top: 27px;\n  left: -10px;\n  display: none;\n}\n.tooltip:before {\n  z-index: 1000;\n  position: absolute;\n  content: '';\n  top: 15px;\n  left: 0px;\n  border-right: 7px transparent solid;\n  border-left: 7px transparent solid;\n  display: none;\n}\n.tooltip:hover {\n  z-index: 1000;\n  position: relative;\n  color: #8325f7;\n}\n.tooltip:hover:after {\n  display: block;\n}\n.tooltip:hover:before {\n  display: block;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join("");
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === "string") {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, ""]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/cssWithMappingToString.js":
/*!************************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/cssWithMappingToString.js ***!
  \************************************************************************/
/***/ ((module) => {



function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

module.exports = function cssWithMappingToString(item) {
  var _item = _slicedToArray(item, 4),
      content = _item[1],
      cssMapping = _item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    // eslint-disable-next-line no-undef
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./src/stylesheets/main.css":
/*!**********************************!*\
  !*** ./src/stylesheets/main.css ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_main_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./main.css */ "./node_modules/css-loader/dist/cjs.js!./src/stylesheets/main.css");

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_main_css__WEBPACK_IMPORTED_MODULE_1__["default"], options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_main_css__WEBPACK_IMPORTED_MODULE_1__["default"].locals || {});

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : 0;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && typeof btoa !== 'undefined') {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CalcCapacitance: () => (/* binding */ CalcCapacitance),
/* harmony export */   CalcFrequency: () => (/* binding */ CalcFrequency),
/* harmony export */   CalcInductance: () => (/* binding */ CalcInductance),
/* harmony export */   CalcThompson: () => (/* binding */ CalcThompson),
/* harmony export */   ChangePrecision: () => (/* binding */ ChangePrecision),
/* harmony export */   ChangeSize: () => (/* binding */ ChangeSize),
/* harmony export */   ClearValues: () => (/* binding */ ClearValues),
/* harmony export */   CopyToClipboard: () => (/* binding */ CopyToClipboard),
/* harmony export */   Exp2Unit: () => (/* binding */ Exp2Unit),
/* harmony export */   Exponent: () => (/* binding */ Exponent),
/* harmony export */   FieldIndex: () => (/* binding */ FieldIndex),
/* harmony export */   FormatNumber: () => (/* binding */ FormatNumber),
/* harmony export */   FormatRange: () => (/* binding */ FormatRange),
/* harmony export */   GetAttributes: () => (/* binding */ GetAttributes),
/* harmony export */   GetField: () => (/* binding */ GetField),
/* harmony export */   GetMaxSize: () => (/* binding */ GetMaxSize),
/* harmony export */   GetProps: () => (/* binding */ GetProps),
/* harmony export */   GetRange: () => (/* binding */ GetRange),
/* harmony export */   GetSelected: () => (/* binding */ GetSelected),
/* harmony export */   GetSize: () => (/* binding */ GetSize),
/* harmony export */   GuessField: () => (/* binding */ GuessField),
/* harmony export */   Init: () => (/* binding */ Init),
/* harmony export */   IsNumber: () => (/* binding */ IsNumber),
/* harmony export */   IsRange: () => (/* binding */ IsRange),
/* harmony export */   IsString: () => (/* binding */ IsString),
/* harmony export */   LoadConfig: () => (/* binding */ LoadConfig),
/* harmony export */   NumericValue: () => (/* binding */ NumericValue),
/* harmony export */   OnInput: () => (/* binding */ OnInput),
/* harmony export */   ParseNumber: () => (/* binding */ ParseNumber),
/* harmony export */   ParseRange: () => (/* binding */ ParseRange),
/* harmony export */   ParseValue: () => (/* binding */ ParseValue),
/* harmony export */   PartitionArray: () => (/* binding */ PartitionArray),
/* harmony export */   ProcessValue: () => (/* binding */ ProcessValue),
/* harmony export */   ReadFields: () => (/* binding */ ReadFields),
/* harmony export */   RemoveAllChildren: () => (/* binding */ RemoveAllChildren),
/* harmony export */   RoundTo: () => (/* binding */ RoundTo),
/* harmony export */   SaveConfig: () => (/* binding */ SaveConfig),
/* harmony export */   SelectField: () => (/* binding */ SelectField),
/* harmony export */   SetField: () => (/* binding */ SetField),
/* harmony export */   SetRange: () => (/* binding */ SetRange),
/* harmony export */   SetStatus: () => (/* binding */ SetStatus),
/* harmony export */   SetupFields: () => (/* binding */ SetupFields),
/* harmony export */   Thousand: () => (/* binding */ Thousand),
/* harmony export */   Unit: () => (/* binding */ Unit),
/* harmony export */   WaitFor: () => (/* binding */ WaitFor)
/* harmony export */ });
/* harmony import */ var _stylesheets_main_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./stylesheets/main.css */ "./src/stylesheets/main.css");

const Q = s => typeof s == 'string' ? document.querySelector(s) : s;
const QA = (...a) => [...(document.querySelectorAll(a.join(', ')) ?? [])];
const GS = s => GetProps(window.getComputedStyle(Q(s)));
const GA = s => GetAttributes(Q(s));
const GR = s => Rect(Q(s)?.getBoundingClientRect());
const NUM_FIELDS = 3;
const $2PI = Math.PI * 2;
const $PI2 = Math.PI ** 2;
const Thompson = {
  calculate: (L, C) => 1 / (Math.sqrt(L * C) * $2PI * 2),
  inverse: (f, LC) => 1 / (4 * $PI2 * LC * f ** 2)
};
const buffer = new ArrayBuffer(8 * NUM_FIELDS * 2);
const values = new Float64Array(buffer, 0, NUM_FIELDS);
const values2 = new Float64Array(buffer, 24, NUM_FIELDS);
const validValues = Array.from(new Array(NUM_FIELDS * 2), () => false);
const allValues = new Float64Array(buffer);
const fieldNames = ['L', 'C', 'f'];
const unitNames = ['H', 'F', 'Hz'];
const config = {};
const minSize = 10;
document.addEventListener('load', () => {
  try {
    Init();
  } catch (e) {
    console.log('ERROR', e.message);
    throw e;
  }
});
setTimeout(Init, 100);
const rosaKm = e => Math.log(2 * Math.PI) - 1.5 - Math.log(e) / (6 * e) - 0.33084236 / e - 1 / (120 * e ** 3) + 1 / (504 * e ** 5) - 0.0011923 / e ** 7 + 5068e-7 / e ** 9;
const rosaKs = e => 1.25 - Math.log(2 * e);
function SeriesCaps(values) {
  return 1 / values.map(v => 1 / ParseNumber(v)).reduce((r, v) => r + v, 0);
}

/**
 * Calculates number of turns for a single-layer coil
 *
 * @param {Number} L          Inductance (µH)
 * @param {Number} form       form diameter (mm)
 * @param {Number} inner      inner wire diam (mm)
 * @param {Number} outer      outer wire diam (mm)
 *
 * @returns {Number}  number of turns
 */
function CoilTurns(L, form, inner, outer) {
  let n = 0,
    i = 0,
    Dk = form + outer;
  L /= 2e-4 * Math.PI * Dk;
  for (let Ks = rosaKs(outer / inner); i <= L;) {
    n += 1e-4;
    const k = n * outer / Dk;
    i = n * (Math.log(1 + Math.PI / (2 * k)) + 1 / (2.3004 + 3.437 * k + 1.763 * k * k - 0.47 / (0.755 + 1 / k) ** 1.44));
    i -= Ks + rosaKm(n);
    i *= n;
  }
  return n;
}

/**
 * Calculates inductance
 *
 * @param {Number} n     Number of turns
 * @param {Number} form  form diameter (mm)
 * @param {Number} len   coil length (mm)
 *
 * @returns {Number} inductance  (µH)
 */
function CoilInductance(n, form, len) {
  const Ks = rosaKs(1.07),
    Dk = form + len / n,
    k = len / Dk;
  return n * 2e-4 * Math.PI * Dk * (n * (Math.log(1 + Math.PI / (2 * k)) + 1 / (2.3004 + 3.437 * k + 1.763 * k * k - 0.47 / (0.755 + 1 / k) ** 1.44)) - (Ks + rosaKm(n)));
}
function OnInput({
  target
}) {
  const {
    name,
    value
  } = target;
  const idx = FieldIndex(name);
  if (idx !== undefined) {
    event.preventDefault();
    const range = ParseRange(value);
    for (let i = 0; i < 2; i++) {
      allValues[idx + i * NUM_FIELDS] = range[i];
      validValues[idx + i * NUM_FIELDS] = i < range.length;
    }
    CalcThompson();
  }
}
function GetProps(cssStyle) {
  return Object.fromEntries([...cssStyle].map(name => [name, cssStyle[name]]));
}
function GetAttributes(e) {
  return Object.fromEntries(e.getAttributeNames().map(name => [name, e.getAttribute(name)]));
}
function IsRange(fieldId) {
  return GetRange(fieldId).length > 1;
  return !!validValues[NUM_FIELDS + fieldId];
}
function FieldIndex(arg) {
  if (IsString(arg)) {
    arg = fieldNames.indexOf(arg);
    if (arg == -1) arg = {
      L: 0,
      C: 1,
      f: 2
    }[arg];
  }
  return arg;
}
function SaveConfig() {
  for (let i = 0; i < NUM_FIELDS; i++) if (validValues[i]) config['LCf'[i]] = GetField(i);
  config.selected = GetSelected();
  localStorage.setItem('config', JSON.stringify(config));
}
function LoadConfig() {
  let r = {};
  try {
    r = JSON.parse(localStorage.getItem('config') ?? '{}');
  } catch (e) {}
  return r;
}
function FieldElements(n) {
  return [...PartitionArray([...Q('#fields').children], NUM_FIELDS)][FieldIndex(n)];
}
function GetField(n) {
  const e = (FieldElements(n) ?? []).find(e => e.tagName.toLowerCase() == 'input');
  return e?.value;
}
function SetField(n, v) {
  const e = (FieldElements(n) ?? []).find(e => e.tagName.toLowerCase() == 'input');
  e.value = v;
}
function SelectField(i) {
  if (!(i >= 0 && i <= 2)) throw new Error(`SelectField i=${i}`);
  for (let j = 0; j < NUM_FIELDS; j++) {
    FieldElements(j).forEach((e, x) => e.classList[i == j ? 'add' : 'remove']('selected'));
    FieldElements(j)[2].disabled = i == j;
  }
  Q('img').src = `svg/${['inductance', 'capacitance', 'freq'][i]}-equation.svg`;
}
function GuessField() {
  if (validValues.filter(v => v === true).length == 2) return validValues.indexOf(false);
  return 0;
}
function GetSelected() {
  return QA('input').map(e => e.classList.contains('selected')).indexOf(true);
}
function GetRange(name) {
  const idx = FieldIndex(name);
  let a = [,];
  try {
    throw new Error();
    for (let i = 0; i < 2; i++) {
      if (IsNumber(allValues[idx + i * NUM_FIELDS]) && Number.isFinite(allValues[idx + i * NUM_FIELDS]) && !isNaN(allValues[idx + i * NUM_FIELDS])) {
        a[i] = allValues[idx + i * NUM_FIELDS];
        continue;
      }
      throw new Error();
    }
  } catch (e) {
    a = ParseRange(GetField(idx) ?? '');
    for (let i = 0; i < 2; i++) {
      allValues[idx + i * NUM_FIELDS] = a[i];
      validValues[idx + i * NUM_FIELDS] = i < a.length;
    }
  }
  return a;
}
function SetRange(name, value) {
  const idx = FieldIndex(name);
  if (value === undefined) {
    values[idx] = undefined;
    return true;
  }
  if (IsNumber(value)) {
    if (!Number.isFinite(value)) throw new Error(`SetRange name=${name} value=${value}`);
    if (isNaN(value)) throw new Error(`SetRange name=${name} value=${value}`);
  }
  const range = ParseRange(value);

  //console.log('SetRange', { name, value, range });

  for (let i = 0; i < 2; i++) {
    allValues[idx + i * NUM_FIELDS] = range[i];
    validValues[idx + i * NUM_FIELDS] = i < range.length;
  }
  return range;
}
function CalcThompson() {
  const sel = GetSelected();
  if (IsNumber(sel) && !isNaN(sel)) {
    const fn = [CalcInductance, CalcCapacitance, CalcFrequency][sel];
    if (typeof fn != 'function') throw new Error(`CalcThompson sel=${sel}`);
    [CalcInductance, CalcCapacitance, CalcFrequency][sel]();
    const sz = GetSize(),
      max = GetMaxSize();
    if (max > sz || sz > minSize) ChangeSize(Math.max(minSize, max));
  }
}
function FormatRange(arg, unit) {
  const results = [...arg].sort((a, b) => a - b);
  return (results.length > 1 ? [Math.min(...results), Math.max(...results)] : results).map((n, i) => FormatNumber(n, results.length <= 1 || i > 0 ? unit : undefined, config.precision <= 0 ? 'floor' : 'round', RoundTo())).join(' - ');
}
function CalcFrequency() {
  const results = [],
    L = GetRange('L'),
    C = GetRange('C');
  for (let i = 0; i < L.length; i++) for (let j = 0; j < C.length; j++) results.push(Thompson.calculate(L[i], C[j]));
  const str = FormatRange(results, 'Hz');
  SetField(2, str);
  return str;
}
function CalcInductance() {
  const results = [],
    f = GetRange('f'),
    C = GetRange('C');
  for (let i = 0; i < f.length; i++) for (let j = 0; j < C.length; j++) results.push(Thompson.inverse(f[i], C[j]));
  const str = FormatRange(results, 'H');
  SetField(0, str);
  return str;
}
function CalcCapacitance() {
  const results = [],
    f = GetRange('f'),
    L = GetRange('L');
  for (let i = 0; i < f.length; i++) for (let j = 0; j < L.length; j++) results.push(Thompson.inverse(f[i], L[j]));
  const str = FormatRange(results, 'F');
  SetField(1, str);
  return str;
}
function ClearValues(idx) {
  for (let i = 0; i < NUM_FIELDS; i++) if (idx === undefined || IsNumber(idx) && i == idx) SetRange(i, undefined);
}
function ProcessValue(value, name) {
  try {
    const [num, exp] = Unit(value);
    return Math.pow(10, exp) * num;
  } catch (e) {
    console.error('ProcessValue', {
      value,
      name
    });
  }
}
function ParseRange(value) {
  const parts = value.split(/\s*-\s*/g).map(Unit).slice(0, 2);
  if (parts[0] && parts[1]) if (parts[0][1] === null) parts[0][1] = parts[1][1];
  return parts.map(NumericValue);
}
function ParseNumber(value) {
  return NumericValue(Unit(value));
}
function ParseValue(value, name) {
  const idx = FieldIndex(name);
  if (!IsString(name)) name = 'LCf'[idx];
  if (value != '') {
    const result = ProcessValue(value, name);
    const valid = validValues[idx] = !isNaN(result);
    if (!valid || idx === undefined) throw new Error(`ParseValue idx=${idx} name=${name} value=${value} result=${result}`);
    values[idx] = valid ? result : undefined;
    return valid;
  }
}
function ReadFields(name) {
  const idx = FieldIndex(name);
  ClearValues(idx);
  QA('input').slice(0, 2).forEach(({
    name,
    value
  }, i) => {
    if (!IsNumber(idx) || i == idx) if (IsString(value) && value != '' || IsNumber(value) && Number.isFinite(value)) if (!ParseValue(value, name)) throw new Error(`ReadFields(): error parsing field '${name}'`);
  });
}
function FormatNumber(arg, unit, fn = 'round', round = RoundTo()) {
  let [num, exp = null] = Array.isArray(arg) ? arg : [arg];
  if (!IsNumber(exp)) exp = Exponent(num);
  exp = Thousand(exp, fn);
  const expStr = Exp2Unit(exp);
  if (IsNumber(unit)) unit = unitNames[unit];
  let s = round(num * Math.pow(10, -exp)) + '';
  if (typeof unit != 'undefined') {
    if (IsString(expStr)) s += ' ' + expStr;
    s += unit;
  }
  return s;
}
async function SetStatus(str, t1 = 3000, t2 = 1000) {
  const st = Q('#status');
  RemoveAllChildren(st);
  let e = st.firstElementChild ?? document.createElement('div');
  e.innerText = str;
  st.insertBefore(e, st.firstElementChild);
  Object.assign(e.style, {
    transition: 'opacity 0s'
  });
  Object.assign(e.style, {
    transition: `opacity ${t1 / 1000}s`,
    opacity: '1'
  });
  await WaitFor(t1);
  Object.assign(e.style, {
    transition: `all ${t2 / 1000}s`,
    opacity: '0'
  });
  await WaitFor(t2);
}
function SetupFields() {
  if (!globalThis.document) {
    setTimeout(() => SetupFields(), 100);
    return;
  }
  [...PartitionArray([...Q('#fields').children], NUM_FIELDS)].forEach((a, i) => {
    a.slice(0, 2).forEach(e => e.addEventListener('click', e => SelectField(i)));
    a.forEach(e => e.addEventListener('dblclick', async e => (await CopyToClipboard(GetField(i)), e.preventDefault()), true));
  });
  document.body.addEventListener('dblclick', async e => {
    const {
      target
    } = e;
    if (target.tagName.toLowerCase() == 'input') await CopyToClipboard(target.value);
    e.preventDefault();
  }, true);
}
function GetSize() {
  return +Q('input').size;
}
function GetMaxSize() {
  return Math.max(...QA('input').slice(0, 3).map(e => e.value).map(v => v.length));
}
function ChangeSize(sz = GetMaxSize()) {
  QA('input').slice(0, 3).forEach((e, i) => e.setAttribute('size', sz));
}
function ChangePrecision(p) {
  Q('#precision').value = p + '';
  Q('#precision_num').value = p + '';
  config.precision = p;
  try {
    CalcThompson();
    ReadFields();
  } catch (e) {}
}
function Init() {
  if (globalThis.initialized) return;
  globalThis.initialized = true;
  QA('input').slice(0, 3).forEach((e, i) => {
    e.addEventListener('change', OnInput, false);
    e.addEventListener('blur', OnInput, false);
  });
  SetupFields();
  Object.assign(config, LoadConfig());
  Q('#precision_num').addEventListener('change', event => {
    const {
      target
    } = event;
    const {
      value
    } = target;
    const p = +value;
    if (!isNaN(p) && p >= 0 && p <= 9) ChangePrecision(p);
  });
  Q('#precision').addEventListener('change', event => {
    const {
      target
    } = event;
    const {
      value
    } = target;
    ChangePrecision(+value);
  });
  QA('#precision, #precision_num').forEach(e => e.addEventListener('wheel', ({
    target,
    deltaY
  }) => {
    let x = +target.value - Math.sign(deltaY);
    if (!isNaN(x) && x >= 0) ChangePrecision(+x);
  }));
  if ('precision' in config) {
    Q('#precision').value = config.precision;
    Q('#precision_num').value = config.precision;
  }
  const {
    L,
    C,
    f
  } = config;
  [L, C, f].forEach((v, i) => SetField(i, IsString(v) && v != '' ? v : ''));
  if ('selected' in config) {
    if (config.selected >= 0 && config.selected <= 2) SelectField(config.selected);else delete config.selected;
  }
  if (GetSelected() === undefined) {
    let f = GuessField();
    if (!IsNumber(f) || !(f >= 0 && f <= 2)) f = 2;
    SelectField(f);
  }
  try {
    CalcThompson();
  } catch (e) {
    console.log('ERROR', e.message);
    //throw e;
  }
  setInterval(() => SaveConfig(), 500);
}
function NumericValue([num, exp]) {
  return Math.pow(10, exp) * num;
}
function WaitFor(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function RemoveAllChildren(e) {
  while (e.firstElementChild) e.removeChild(e.firstElementChild);
}
function* PartitionArray(a, size) {
  for (let i = 0; i < a.length; i += size) yield a.slice(i, i + size);
}
function Exponent(num) {
  return Math.floor(Math.log10(num));
}
function Thousand(exponent, fn = 'floor') {
  return Math.min(21, Math.max(-24, Math[fn](exponent / 3) * 3));
}
function Exp2Unit(exponent, fn = 'floor') {
  /* prettier-ignore */switch (Thousand(exponent, fn)) {
    case -24:
      return 'y';
    case -21:
      return 'z';
    case -18:
      return 'a';
    case -15:
      return 'f';
    case -12:
      return 'p';
    case -9:
      return 'n';
    case -6:
      return 'µ';
    case -3:
      return 'm';
    case -2:
      return 'c';
    case -1:
      return 'd';
    case 0:
      return '';
    case 2:
      return 'h';
    case 3:
      return 'k';
    case 6:
      return 'M';
    case 9:
      return 'G';
    case 12:
      return 'T';
    case 15:
      return 'P';
    case 18:
      return 'E';
    case 21:
      return 'Z';
  }
}
function Unit(str) {
  if (!IsString(str)) str = str + '';
  const [num, unit = ''] = [...str.replaceAll(/\s+/g, '').matchAll(/([-Ee.\d]+|[^-Ee.\d]+)/g)].map(([a]) => a);
  let exp = null;

  /* prettier-ignore */
  switch (unit[0]) {
    case 'y':
      exp = -24;
      break;
    case 'z':
      exp = -21;
      break;
    case 'a':
      exp = -18;
      break;
    case 'f':
      exp = -15;
      break;
    case 'p':
      exp = -12;
      break;
    case 'n':
      exp = -9;
      break;
    case '\u00B5':
    case '\u03BC':
    case 'u':
      exp = -6;
      break;
    case 'm':
      exp = -3;
      break;
    case 'c':
      exp = -2;
      break;
    case 'd':
      exp = -1;
      break;
    case 'h':
      exp = 2;
      break;
    case 'k':
      exp = 3;
      break;
    case 'M':
      exp = 6;
      break;
    case 'G':
      exp = 9;
      break;
    case 'T':
      exp = 12;
      break;
    case 'P':
      exp = 15;
      break;
    case 'E':
      exp = 18;
      break;
    case 'Z':
      exp = 21;
      break;
  }
  return [+num, exp];
}
function RoundTo(prec = config.precision) {
  return n => n.toFixed(prec).replace(/\.(.*[^0])0*$/g, '.$1');
}
function IsNumber(arg) {
  return typeof arg == 'number';
}
function IsString(arg) {
  return typeof arg == 'string';
}
async function CopyToClipboard(str) {
  let result = await navigator.clipboard.writeText(str);
  SetStatus(`Copied: '${str}'`);
}
function Rect({
  x,
  y,
  width,
  height
}) {
  return Object.setPrototypeOf({
    x,
    y,
    width,
    height
  }, Rect.prototype);
}
Rect.prototype[Symbol.iterator] = function* () {
  const {
    x,
    y,
    width,
    height
  } = this;
  yield* [x, y, width, height];
};
Object.defineProperties(Rect.prototype, {
  x2: {
    get() {
      return this.x + this.width;
    }
  },
  y2: {
    get() {
      return this.y + this.height;
    }
  }
});

/* prettier-ignore */
Object.assign(globalThis, {
  CalcCapacitance,
  CalcFrequency,
  CalcInductance,
  CalcThompson,
  ChangePrecision,
  ChangeSize,
  ClearValues,
  CoilInductance,
  CoilTurns,
  CopyToClipboard,
  Exp2Unit,
  Exponent,
  FieldElements,
  FieldIndex,
  FormatNumber,
  FormatRange,
  GetAttributes,
  GetField,
  GetMaxSize,
  GetProps,
  GetRange,
  GetSelected,
  GetSize,
  GuessField,
  Init,
  IsNumber,
  IsRange,
  IsString,
  LoadConfig,
  NumericValue,
  OnInput,
  ParseNumber,
  ParseRange,
  ParseValue,
  ProcessValue,
  ReadFields,
  Rect,
  RemoveAllChildren,
  RoundTo,
  SaveConfig,
  SelectField,
  SeriesCaps,
  SetField,
  SetRange,
  SetStatus,
  SetupFields,
  Thousand,
  Unit,
  WaitFor
});
/* prettier-ignore */
Object.assign(globalThis, {
  buffer,
  values,
  values2,
  validValues,
  allValues,
  config,
  Q,
  QA,
  GS,
  GA,
  GR,
  Thompson
});
})();

/******/ })()
;
//# sourceMappingURL=app.js.map