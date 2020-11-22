import { CodeEditor } from './code-editor';
import { openCodeStr, getConstuctor } from './consts';

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

    cm.add(getConstuctor, () => {
        return CodeEditor;
    })
}