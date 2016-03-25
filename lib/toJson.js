'use strict';

var types = require('./types');

var SoftSetHook =
  require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook');

function arrayToJson(arr, functionIndex) {
  var len = arr.length;
  var i = -1;
  var res = new Array(len);
  while (++i < len) {
    res[i] = toJson(arr[i], functionIndex);
  }
  return res;
}

function plainObjectToJson(obj, functionIndex) {
  var res = {};
  /* jshint -W089 */
  /* this is fine; these objects are always plain */
  for (var key in obj) {
    var val = obj[key];
    res[key] = typeof val !== 'undefined' ? toJson(val, functionIndex) : val;
  }
  return res;
}

function virtualNodeToJson(obj, functionIndex) {
  var res = {
    // type
    t: types.VirtualNode,
    tn: obj.tagName
  };
  if (Object.keys(obj.properties).length) {
    res.p = plainObjectToJson(obj.properties, functionIndex);
  }
  if (obj.children.length) {
    res.c = arrayToJson(obj.children, functionIndex);
  }
  if (obj.key) {
    res.k = obj.key;
  }
  if (obj.namespace) {
    res.n = obj.namespace;
  }
  return res;
}

function virtualTextToJson(obj) {
  return {
    // type
    t: types.VirtualTree,
    // text
    x: obj.text
  };
}

function virtualPatchToJson(obj, functionIndex) {
  var res = {
    // type
    t: types.VirtualPatch,
    // patch type
    pt: obj.type
  };

  if (obj.vNode) {
    res.v = toJson(obj.vNode, functionIndex);
  }

  if (obj.patch) {
    res.p = toJson(obj.patch, functionIndex);
  }

  return res;
}

function softSetHookToJson(obj) {
  return {
    // type
    t: types.SoftSetHook,
    value: obj.value
  };
}

function objectToJson(obj, functionIndex) {
  if ('patch' in obj && typeof obj.type === 'number') {
    return virtualPatchToJson(obj, functionIndex);
  }
  if (obj.type === 'VirtualNode') {
    return virtualNodeToJson(obj, functionIndex);
  }
  if (obj.type === 'VirtualText') {
    return virtualTextToJson(obj);
  }
  if (obj instanceof SoftSetHook) {
    return softSetHookToJson(obj);
  }

  // plain object
  return plainObjectToJson(obj, functionIndex);
}

function toJson(obj, functionIndex) {

  var type = typeof obj, nextIndex;

  switch (type) {
    case 'string':
    case 'boolean':
    case 'number':
      return obj;
    case 'function':
      if (!obj._vdom_as_json_f_i){
        nextIndex = functionIndex.nextIndex;
        functionIndex.map[nextIndex] = obj; // Save into map so we can find function by index later
        obj._vdom_as_json_f_i = nextIndex; // Save index on function object so we don't make new indexes for the same function
        functionIndex.nextIndex = nextIndex + 1;
        return "_vdom_as_json_f_i#" + nextIndex;
      } else {
        return "_vdom_as_json_f_i#" + obj._vdom_as_json_f_i;
      }
  }

  // type === 'object'
  if (Array.isArray(obj)) {
    return arrayToJson(obj, functionIndex);
  }

  if (!obj) { // null
    return null;
  }

  return objectToJson(obj, functionIndex);
}

module.exports = toJson;
