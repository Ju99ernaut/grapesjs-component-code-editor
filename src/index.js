import commands from './commands';

export default (editor, opts = {}) => {
  const options = {
    ...{
      // default options

      //Edit styles as inline
      inlineCss: false,
      //Allow editing of javascript, set allowScripts to true for this to work
      editJs: false,
      //Open stylesManager when html is saved
      openStyleOnSave: true
    },
    ...opts
  };

  // Load commands
  commands(editor, options);
};