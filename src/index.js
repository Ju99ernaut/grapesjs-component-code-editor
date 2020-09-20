import commands from './commands';

export default (editor, opts = {}) => {
  const options = {
    ...{
      //Allow editing of javascript, set allowScripts to true for this to work
      editJs: false,
      //Remove component data eg data-gjs-type="..."
      clearData: false,
      //Code viewer options
      codeViewOptions: {}
    },
    ...opts
  };

  // Load commands
  commands(editor, options);
};