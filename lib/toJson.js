'use strict';

var types = require('./types');

var SoftSetHook =
  require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook');

function arrayToJson(arr, serializeFunction) {
  var len = arr.length;
  var i = -1;
  var res = new Array(len);
  while (++i < len) {
    res[i] = toJson(arr[i], serializeFunction);
  }
  return res;
}

function plainObjectToJson(obj, serializeFunction) {
  var res = {};
  /* jshint -W089 */
  /* this is fine; these objects are always plain */
  for (var key in obj) {
    var val = obj[key]
      , type = typeof val
      , serialized;
    if (type === "undefined"){
      res[key] = val;
    } else if (type === "function") {
      serialized = serializeFunction(key, val);
      res[serialized[0]] = "_vdom_as_json_" + serialized[1];
    } else {
      res[key] = toJson(val, serializeFunction);
    }
  }
  return res;
}

function virtualNodeToJson(obj, serializeFunction) {
  var res = {
    // type
    t: types.VirtualNode,
    tn: obj.tagName
  };
  if (Object.keys(obj.properties).length) {
    res.p = plainObjectToJson(obj.properties, serializeFunction);
  }
  if (obj.children.length) {
    res.c = arrayToJson(obj.children, serializeFunction);
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

function virtualPatchToJson(obj, serializeFunction) {
  var res = {
    // type
    t: types.VirtualPatch,
    // patch type
    pt: obj.type
  };

  if (obj.vNode) {
    res.v = toJson(obj.vNode, serializeFunction);
  }

  if (obj.patch) {
    res.p = toJson(obj.patch, serializeFunction);
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

function objectToJson(obj, serializeFunction) {
  if ('patch' in obj && typeof obj.type === 'number') {
    return virtualPatchToJson(obj, serializeFunction);
  }
  if (obj.type === 'VirtualNode') {
    return virtualNodeToJson(obj, serializeFunction);
  }
  if (obj.type === 'VirtualText') {
    return virtualTextToJson(obj);
  }
  if (obj instanceof SoftSetHook) {
    return softSetHookToJson(obj);
  }

  // plain object
  return plainObjectToJson(obj, serializeFunction);
}

function toJson(obj, serializeFunction) {

  var type = typeof obj;

  switch (type) {
    case 'string':
    case 'boolean':
    case 'number':
      return obj;
  }

  // type === 'object'
  if (Array.isArray(obj)) {
    return arrayToJson(obj, serializeFunction);
  }

  if (!obj) { // null
    return null;
  }

  return objectToJson(obj, serializeFunction);
}

module.exports = toJson;
