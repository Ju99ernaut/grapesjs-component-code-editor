import type { Plugin } from "grapesjs";
import { CodeEditor } from "./code-editor";
import { openCodeStr, getObject, getConstuctor } from "./consts";
import { PluginOptions } from ".";

export const commands: Plugin<PluginOptions> = (editor, opts) => {
  const cm = editor.Commands;
  let codeEditor: InstanceType<typeof CodeEditor> | null = null;

  cm.add(openCodeStr, {
    run: (editor) => {
      !codeEditor &&
        (codeEditor = new CodeEditor(editor, opts)) &&
        codeEditor.buildCodePanel();
      codeEditor.showCodePanel();
    },
    stop: () => {
      codeEditor && codeEditor.hideCodePanel();
    },
  });

  cm.add(getObject, () => {
    return codeEditor;
  });

  cm.add(getConstuctor, () => {
    return CodeEditor;
  });
};
