'use strict';

var types = require('./types');
var VirtualNode = require('virtual-dom/vnode/vnode');
var VirtualText = require('virtual-dom/vnode/vtext');
var VirtualPatch = require('virtual-dom/vnode/vpatch');
var SoftSetHook =
  require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook');

function arrayFromJson(json, handler) {
  var len = json.length;
  var i = -1;
  var res = new Array(len);
  while (++i < len) {
    res[i] = fromJson(json[i], handler);
  }
  return res;
}

function plainObjectFromJson(json, handler) {
  var res = {};
  /* jshint -W089 */
  /* this is fine; these objects are always plain */
  for (var key in json) {
    var val = json[key];
    res[key] = typeof val !== 'undefined' ? fromJson(val, handler) : val;
  }
  return res;
}

function virtualNodeFromJson(json, handler) {
  return new VirtualNode(json.tn,
    json.p ? plainObjectFromJson(json.p, handler) : {}, // patch
    json.c ? arrayFromJson(json.c, handler) : [], // children
    json.k, // key
    json.n); // namespace
}

function virtualTextFromJson(json) {
  return new VirtualText(json.x);
}

function virtualPatchFromJson(json, handler) {
  return new VirtualPatch(
    json.pt, // patchType
    json.v ? fromJson(json.v, handler) : null, // virtualNode
    json.p && fromJson(json.p, handler) // patch
  );
}

function softSetHookFromJson(json) {
  return new SoftSetHook(json.value);
}

function objectFromJson(json, handler) {
  switch (json.t) { // type
    case types.VirtualPatch:
      return virtualPatchFromJson(json, handler);
    case types.VirtualNode:
      return virtualNodeFromJson(json, handler);
    case types.VirtualTree:
      return virtualTextFromJson(json);
    case types.SoftSetHook:
      return softSetHookFromJson(json);
  }
  return plainObjectFromJson(json, handler);
}

var vdomAsJsonFunctionIndexRegex = /#(\d+)/;
function fromJson(json, handler) {
  var type = typeof json;

  switch (type) {
    case 'boolean':
    case 'number':
      return json;
    case 'string':
      if (json.substr(0, 13) === "_vdom_as_json" && json.match(vdomAsJsonFunctionIndexRegex)){
        return function(){ handler(json.match(vdomAsJsonFunctionIndexRegex)[1]); };
      } else {
        return json;
      }
  }

  // type === 'object'

  if (Array.isArray(json)) {
    return arrayFromJson(json, handler);
  }

  if (!json) { // null
    return null;
  }

  return objectFromJson(json, handler);
}

module.exports = fromJson;
