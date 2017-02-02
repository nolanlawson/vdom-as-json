'use strict';

var types = require('./types');
var undefinedConst = require('./undefined');
var VirtualNode = require('virtual-dom/vnode/vnode');
var VirtualText = require('virtual-dom/vnode/vtext');
var VirtualPatch = require('virtual-dom/vnode/vpatch');
var SoftSetHook =
  require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook');

function arrayFromJson(json, ctx) {
  var len = json.length;
  var i = -1;
  var res = new Array(len);
  while (++i < len) {
    res[i] = fromJson(json[i], ctx);
  }
  return res;
}

function plainObjectFromJson(json, ctx) {
  var res = {};
  /* jshint -W089 */
  /* this is fine; these objects are always plain */
  for (var key in json) {
    var val = json[key];
    if(val === undefinedConst) {
      val = undefined;
    }
    res[key] = typeof val !== 'undefined' ? fromJson(val, ctx) : val;
  }
  return res;
}

function virtualNodeFromJson(json, ctx) {
  return new VirtualNode(json.tn,
    json.p ? plainObjectFromJson(json.p, ctx) : {}, // patch
    json.c ? arrayFromJson(json.c, ctx) : [], // children
    json.k, // key
    json.n); // namespace
}

function virtualTextFromJson(json, ctx) {
  return new VirtualText(json.x);
}

function virtualPatchFromJson(json, ctx) {
  var vNode = null;
  if(typeof(json.v) === 'string' && json.v.indexOf('i:') === 0) {
    var idx = parseInt(json.v.substr(2));
    vNode = ctx.dftIndexArray[idx]; //look up this index from the dft index
  } else {
    vNode = json.v ? fromJson(json.v, ctx) : null; // virtualNode;
  }

  return new VirtualPatch(
    json.pt, // patchType
    vNode,
    json.p && fromJson(json.p, ctx) // patch
  );
}

function softSetHookFromJson(json, ctx) {
  return new SoftSetHook(json.value);
}

function objectFromJson(json, ctx) {
  switch (json.t) { // type
    case types.VirtualPatch:
      return virtualPatchFromJson(json, ctx);
    case types.VirtualNode:
      return virtualNodeFromJson(json, ctx);
    case types.VirtualTree:
      return virtualTextFromJson(json, ctx);
    case types.SoftSetHook:
      return softSetHookFromJson(json, ctx);
  }
  return plainObjectFromJson(json, ctx);
}

function fromJson(json, ctx) {
  var type = typeof json;

  switch (type) {
    case 'string':
    case 'boolean':
    case 'number':
      return json;
  }

  // type === 'object'

  if (Array.isArray(json)) {
    return arrayFromJson(json, ctx);
  }

  if (!json) { // null
    return null;
  }

  if(json && json['a'] && json['a'].tn && ctx == null) {
    ctx = {diffRoot: virtualNodeFromJson(json['a'])};
    ctx.dftIndexArray = indexRoot(ctx.diffRoot);
  }

  return objectFromJson(json, ctx);
}

function indexRoot(root) {
  var idxArray = [];
  indexNode(idxArray, root, 0);
  return idxArray;
}

function indexNode(idxArray, node, idx) {
  idxArray[idx] = node;
  if(node.children) {
    node.children.forEach(function(childNode) {
      idx = indexNode(idxArray, childNode, ++idx);
    });
  }
  return idx;
}

module.exports = fromJson;
