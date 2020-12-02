import { CodeEditor } from './code-editor';
import { openCodeStr, getObject, getConstuctor } from './consts';

export default (editor, opts) => {
    const cm = editor.Commands;
    let codeEditor = null;

    cm.add(openCodeStr, {
        run: editor => {
            !codeEditor && (codeEditor = new CodeEditor(editor, opts)) && codeEditor.buildCodePanel();
            codeEditor.showCodePanel();
        },
        stop: editor => {
            codeEditor && codeEditor.hideCodePanel();
        },
    });

    cm.add(getObject, (editor, sender, options = {}) => {
        return new CodeEditor(editor, { ...options, ...opts });
    });

    cm.add(getConstuctor, () => {
        return CodeEditor;
    });
}