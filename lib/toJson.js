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
  var res = {
    type: 'VirtualNode',
    tagName: obj.tagName
  };
  if (Object.keys(obj.properties).length) {
    res.properties = plainObjectToJson(obj.properties);
  }
  if (obj.children.length) {
    res.children = arrayToJson(obj.children);
  }
  if (obj.key) {
    res.key = obj.key;
  }
  if (obj.namespace) {
    res.namespace = obj.namespace;
  }
  return res;
}

function virtualTextToJson(obj) {
  return {
    type: 'VirtualText',
    text: obj.text
  };
}

function virtualPatchToJson(obj) {
  var res = {
    type: 'VirtualPatch',
    patchType: obj.type
  };

  if (obj.vNode) {
    res.vNode = toJson(obj.vNode);
  }

  if (obj.patch) {
    res.patch = toJson(obj.patch);
  }

  return res;
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