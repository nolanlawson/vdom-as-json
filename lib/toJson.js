'use strict';

var SoftSetHook =
  require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook');

function arrayToJson(arr) {
  var res = [];
  for (var i = 0; i < arr.length; i++) {
    res.push(toJson(arr[i]));
  }
  return res;
}

function plainObjectToJson(obj) {
  var keys = Object.keys(obj);
  var res = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    res[key] = toJson(obj[key]);
  }
  return res;
}

function virtualNodeToJson(obj) {
  return {
    type: 'VirtualNode',
    tagName: obj.tagName,
    properties: plainObjectToJson(obj.properties),
    children: arrayToJson(obj.children),
    key: obj.key,
    namespace: obj.namespace
  };
}

function virtualTextToJson(obj) {
  return {
    type: 'VirtualText',
    text: obj.text
  };
}

function virtualPatchToJson(obj) {
  return {
    type: 'VirtualPatch',
    patchType: obj.type,
    vNode: obj.vNode && toJson(obj.vNode),
    patch: obj.patch && toJson(obj.patch)
  };
}

function softSetHookToJson(obj) {
  return {
    type: 'SoftSetHook',
    value: obj.value
  };
}

function objectToJson(obj) {
  if ('patch' in obj && typeof obj.type === 'number') {
    return virtualPatchToJson(obj);
  }
  if (obj.type === 'VirtualNode') {
    return virtualNodeToJson(obj);
  }
  if (obj.type === 'VirtualText') {
    return virtualTextToJson(obj);
  }
  if (obj instanceof SoftSetHook) {
    return softSetHookToJson(obj);
  }

  // plain object
  return plainObjectToJson(obj);
}

function toJson(obj) {

  var type = typeof obj;

  switch (type) {
    case 'string':
    case 'boolean':
      return obj;
  }

  // type === 'object'
  if (Array.isArray(obj)) {
    return arrayToJson(obj);
  }

  return objectToJson(obj);
}

module.exports = toJson;