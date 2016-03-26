'use strict';

var types = require('./types');
var VirtualNode = require('virtual-dom/vnode/vnode');
var VirtualText = require('virtual-dom/vnode/vtext');
var VirtualPatch = require('virtual-dom/vnode/vpatch');
var SoftSetHook =
  require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook');

function arrayFromJson(json, makeHandler) {
  var len = json.length;
  var i = -1;
  var res = new Array(len);
  while (++i < len) {
    res[i] = fromJson(json[i], makeHandler);
  }
  return res;
}

function plainObjectFromJson(json, makeHandler) {
  var res = {};
  /* jshint -W089 */
  /* this is fine; these objects are always plain */
  for (var key in json) {
    var val = json[key];
    res[key] = typeof val !== 'undefined' ? fromJson(val, makeHandler) : val;
  }
  return res;
}

function virtualNodeFromJson(json, makeHandler) {
  return new VirtualNode(json.tn,
    json.p ? plainObjectFromJson(json.p, makeHandler) : {}, // patch
    json.c ? arrayFromJson(json.c, makeHandler) : [], // children
    json.k, // key
    json.n); // namespace
}

function virtualTextFromJson(json) {
  return new VirtualText(json.x);
}

function virtualPatchFromJson(json, makeHandler) {
  return new VirtualPatch(
    json.pt, // patchType
    json.v ? fromJson(json.v, makeHandler) : null, // virtualNode
    json.p && fromJson(json.p, makeHandler) // patch
  );
}

function softSetHookFromJson(json) {
  return new SoftSetHook(json.value);
}

function objectFromJson(json, makeHandler) {
  switch (json.t) { // type
    case types.VirtualPatch:
      return virtualPatchFromJson(json, makeHandler);
    case types.VirtualNode:
      return virtualNodeFromJson(json, makeHandler);
    case types.VirtualTree:
      return virtualTextFromJson(json);
    case types.SoftSetHook:
      return softSetHookFromJson(json);
  }
  return plainObjectFromJson(json, makeHandler);
}

function fromJson(json, makeHandler) {
  var type = typeof json;

  switch (type) {
    case 'boolean':
    case 'number':
      return json;
    case 'string':
      if (json.substr(0, 14) === "_vdom_as_json_"){
        return makeHandler(json.substr(14));
      }
      return json;
  }

  // type === 'object'

  if (Array.isArray(json)) {
    return arrayFromJson(json, makeHandler);
  }

  if (!json) { // null
    return null;
  }

  return objectFromJson(json, makeHandler);
}

module.exports = fromJson;
