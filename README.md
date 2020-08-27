# Grapesjs Component Code Editor

A plugin that allows you to edit the code of a component that is selected on the canvas

>Recommended to use [grapesje-parser-postcss](https://github.com/artf/grapesjs-parser-postcss) with this plugin to avoid issues with `styles` as explained [here](https://grapesjs.com/docs/guides/Custom-CSS-parser.html#cssom-results-are-inconsistent)

<p align="center">
 <img src="https://media.giphy.com/media/mDGcQfZdQGHUAhlLD7/giphy.gif">
</p>

### HTML
```html
<link href="https://unpkg.com/grapesjs/dist/css/grapes.min.css" rel="stylesheet">
<script src="https://unpkg.com/grapesjs"></script>
<link href="https://unpkg.com/grapesjs-component-code-editor/dist/grapesjs-component-code-editor.min.css" rel="stylesheet">
<script src="https://unpkg.com/grapesjs-component-code-editor"></script>

<div id="gjs"></div>
```

### JS
```js
const editor = grapesjs.init({
	container: '#gjs',
  height: '100%',
  fromElement: true,
  storageManager: false,
  //...
  panels: {
    defaults: [
      {
        buttons: [
          //...
          {
            attributes: { title: 'Open Code' },
            className: 'fa fa-code',
            command: 'open-code',
            id: 'open-code'
          }
          //...
        ],
        id: 'views'
      }
    ]
  },
  //...
  plugins: ['grapesjs-component-code-editor'],
});
```

### CSS
```css
body, html {
  margin: 0;
  height: 100%;
}
```


## Summary

* Plugin name: `grapesjs-component-code-editor`
* Commands
    * `open-code`



## Options

| Option | Description | Default |
|-|-|-
| `editJs` | Lets you edit component scripts `allowScripts` must be set to true | `false` |
| `openStyleOnClose` | Open `stylesManager` when you close the `code-editor` | `true` |
| `clearData` | Remove all `gjs-data` attributes from the component | `false` |



## Download

* CDN
  * `https://unpkg.com/grapesjs-component-code-editor`
* NPM
  * `npm i grapesjs-component-code-editor`
* GIT
  * `git clone https://github.com/ju99ernaut/grapesjs-component-code-editor.git`



## Usage

Directly in the browser
```html
<link href="https://unpkg.com/grapesjs/dist/css/grapes.min.css" rel="stylesheet"/>
<script src="https://unpkg.com/grapesjs"></script>
<link href="./dist/grapesjs-component-code-editor.min.css" rel="stylesheet">
<script src="./dist/grapesjs-component-code-editor.min.js"></script>

<div id="gjs"></div>

<script type="text/javascript">
  var editor = grapesjs.init({
      container: '#gjs',
      // ...
      panels: { /* add panel button with command open-code */}
      plugins: ['grapesjs-component-code-editor'],
      pluginsOpts: {
        'grapesjs-component-code-editor': { /* options */ }
      }
  });
</script>
```

Modern javascript
```js
import grapesjs from 'grapesjs';
import plugin from 'grapesjs-component-code-editor';
import 'grapesjs/dist/css/grapes.min.css';
import 'grapesjs-component-code-editor/dist/grapesjs-component-code-editor.min.css';

const editor = grapesjs.init({
  container : '#gjs',
  // ...
  plugins: [plugin],
  pluginsOpts: {
    [plugin]: { /* options */ }
  }
  // or
  plugins: [
    editor => plugin(editor, { /* options */ }),
  ],
});
```

Adding after `editor` initialization
```js
const pn = editor.Panels;
const panelViews = pn.addPanel({
  id: 'views'
});
panelViews.get('buttons').add([{
  attributes: {
     title: 'Open Code'
  },
  className: 'fa fa-file-code-o',
  command: 'open-code',
  id: 'open-code'
}]);
```



## Development

Clone the repository

```sh
$ git clone https://github.com/ju99ernaut/grapesjs-component-code-editor.git
$ cd grapesjs-component-code-editor
```

Install dependencies

```sh
$ npm i
```

Start the dev server

```sh
$ npm start
```

Build the source

```sh
$ npm run build
```



## License

MIT
