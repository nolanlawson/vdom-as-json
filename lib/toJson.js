'use strict';

var types = require('./types');
var undefinedConst = require('./undefined');

var SoftSetHook =
  require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook');

function arrayToJson(arr, ctx) {
  var len = arr.length;
  var i = -1;
  var res = new Array(len);
  while (++i < len) {
    res[i] = toJson(arr[i], ctx);
  }
  return res;
}

function plainObjectToJson(obj, ctx) {
  var res = {};
  var trackPatchIndex = false;
  var childCtx = ctx;
  if(obj && obj['a'] && obj['a'].tagName) {
    childCtx = cloneObj({}, ctx); //clone ctx
    trackPatchIndex = true;
  }
  //childCtx['patchHashIndex'] = null;

  /* jshint -W089 */
  /* this is fine; these objects are always plain */
  for (var key in obj) {
    var val = obj[key];
    if(trackPatchIndex) {
      childCtx['patchHashIndex'] = parseInt(key);
    }
    res[key] = typeof val !== 'undefined' ?
        toJson(val, childCtx) : undefinedConst;
  }
  return res;
}

function virtualNodeToJson(obj, ctx) {
  var res = {
    // type
    t: types.VirtualNode,
    tn: obj.tagName
  };
  if (Object.keys(obj.properties).length) {
    res.p = plainObjectToJson(obj.properties, ctx);
  }
  if (obj.children.length) {
    res.c = arrayToJson(obj.children, ctx);
  }
  if (obj.key) {
    res.k = obj.key;
  }
  if (obj.namespace) {
    res.n = obj.namespace;
  }
  return res;
}

function virtualTextToJson(obj, ctx) {
  return {
    // type
    t: types.VirtualTree,
    // text
    x: obj.text
  };
}

function virtualPatchToJson(obj, ctx) {
  var res = {
    // type
    t: types.VirtualPatch,
    // patch type
    pt: obj.type
  };

  if (obj.vNode) {
    if(ctx && ctx.patchHashIndex != null) {
      //if the context contains the index (from the key in the hash) for this
      //patch, use it as a string key for this value so we can just reference
      //that point in the root tree instead of serializing same content over
      //again
      res.v = "i:"+ctx.patchHashIndex;
    } else {
      res.v = toJson(obj.vNode, ctx);
    }
  }

  if (obj.patch) {
    res.p = toJson(obj.patch, ctx);
  }

  return res;
}

function softSetHookToJson(obj, ctx) {
  return {
    // type
    t: types.SoftSetHook,
    value: obj.value
  };
}

function objectToJson(obj, ctx) {
  if ('patch' in obj && typeof obj.type === 'number') {
    return virtualPatchToJson(obj, ctx);
  }
  if (obj.type === 'VirtualNode') {
    return virtualNodeToJson(obj, ctx);
  }
  if (obj.type === 'VirtualText') {
    return virtualTextToJson(obj, ctx);
  }
  if (obj instanceof SoftSetHook) {
    return softSetHookToJson(obj, ctx);
  }

  // plain object
  return plainObjectToJson(obj, ctx);
}

function toJson(obj, ctx) {

  var type = typeof obj;

  switch (type) {
    case 'string':
    case 'boolean':
    case 'number':
      return obj;
  }

  // type === 'object'
  if (Array.isArray(obj)) {
    return arrayToJson(obj, ctx || {});
  }

  if (!obj) { // null
    return null;
  }

  //If we enter with a null context and we've got an object with an 'a'
  //property with an object with tag name then it's likely we have a
  //patchset object and the a is the original root of the diff tree
  if(obj && obj['a'] && obj['a'].tagName && !ctx) {
    ctx = {diffRoot: obj['a']};
  } else if(ctx == null) {
    ctx = {};
  }

  return objectToJson(obj, ctx);
}

//PhantomJS doesn't support Object.assigns, so just implement a clone
//method here.
function cloneObj(a,b) {
  Object.keys(b).forEach(function(k) {
    a[k] = b[k];
  });
  return a;
}

module.exports = toJson;
