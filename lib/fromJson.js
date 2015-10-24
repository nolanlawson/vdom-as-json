'use strict';

var VirtualNode = require('virtual-dom/vnode/vnode');
var VirtualText = require('virtual-dom/vnode/vtext');
var VirtualPatch = require('virtual-dom/vnode/vpatch');
var SoftSetHook =
  require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook');

function arrayFromJson(json) {
  var res = [];
  for (var i = 0; i < json.length; i++) {
    res.push(fromJson(json[i]));
  }
  return res;
}

function plainObjectFromJson(json) {
  var keys = Object.keys(json);
  var res = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    res[key] = fromJson(json[key]);
  }
  return res;
}

function virtualNodeFromJson(json) {
  return new VirtualNode(json.tagName,
    plainObjectFromJson(json.properties),
    arrayFromJson(json.children),
    json.key,
    json.namespace);
}

function virtualTextFromJson(json) {
  return new VirtualText(json.text);
}

function virtualPatchFromJson(json) {
  return new VirtualPatch(
    json.patchType,
    json.vNode && fromJson(json.vNode),
    json.patch && fromJson(json.patch)
  );
}

function softSetHookFromJson(json) {
  return new SoftSetHook(json.value);
}

function objectFromJson(json) {
  switch (json.type) {
    case 'VirtualPatch':
      return virtualPatchFromJson(json);
    case 'VirtualNode':
      return virtualNodeFromJson(json);
    case 'VirtualText':
      return virtualTextFromJson(json);
    case 'SoftSetHook':
      return softSetHookFromJson(json);
  }
  return plainObjectFromJson(json);
}

function fromJson(json) {
  var type = typeof json;

  switch (type) {
    case 'string':
    case 'boolean':
      return json;
  }

  // type === 'object'

  if (Array.isArray(json)) {
    return arrayFromJson(json);
  }

  return objectFromJson(json);
}

module.exports = fromJson;