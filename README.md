vdom-to-json 
----

Convert [virtual-dom](https://github.com/Matt-Esch/virtual-dom) trees and patches to and from JSON. Designed for generating patches on the server or in a web worker and then sending that to the client.

Install
---

```
npm install vdom-to-json
```

If you need an AMD or browser-ready version, please use `dist/vdom-to-json.js` or [download from wzrd.in](https://wzrd.in/standalone/vdom-to-json@latest).

Usage
---

```js

var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var toJson = require('vdom-to-json/toJson');
var fromJson = require('vdom-to-json/fromJson');



```
