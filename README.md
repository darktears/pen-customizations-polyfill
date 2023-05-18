Pen Customizations API polyfill
===

This is a polyfill for the [proposed](https://github.com/WICG/proposals/issues/89) Pen Customizations API. The full explainer is located over [here](https://github.com/darktears/pen-customizations).

This polyfill implements the proposed API on top of [WebHID](https://wicg.github.io/webhid/index.html). This means that a permission will be prompted for the user to accept connecting to the touch panel.

This polyfill will only work if the hardware supports [Universal Stylus Initiative](https://universalstylus.org/) capabilities. At present most ChromeOS devices will work.

How to use the polyfill
===

This polyfill is packaged as a JavaScript module. It is available on NPM over [here](https://www.npmjs.com/package/pen-customizations-polyfill).

To install the polyfill just run:

```bash
npm install --save pen-customizations-polyfill
```

Then you can include it in your project:

```html
<script type="module" src="/path/to/modules/pen-customizations-polyfill.js"></script>
```

or in your JavaScript source file

```js
import "/path/to/modules/pen-customizations-polyfill/pen-customizations-polyfill.js";
```

That's it.

See the `demo/` directory for an example how to use the API.

Known issues
===

Check GitHub [here](https://github.com/darktears/pen-customizations-polyfill/issues).