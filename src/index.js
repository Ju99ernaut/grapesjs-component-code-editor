import commands from './commands';

export default (editor, opts = {}) => {
  const options = {
    ...{
      //Allow editing of javascript, set allowScripts to true for this to work
      editJs: false,
      //Remove component data eg data-gjs-type="..."
      clearData: false,
      //Code viewer options
      codeViewOptions: {},
      //Used to remove css from the Selector Manager
      cleanCssBtn: true,
      //Save HTML button text
      htmlBtnText: 'Apply',
      //Save CSS button text
      cssBtnText: 'Apply',
      //Clean CSS button text
      cleanCssBtnText: 'Delete'
    },
    ...opts
  };

  // Load commands
  commands(editor, options);
};