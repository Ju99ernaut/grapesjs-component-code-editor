import {
    CodeEditor
} from './code-editor';
import {
    openCodeStr
} from './consts';

export default (editor, opts) => {
    const cm = editor.Commands;
    let codeEditor = null;

    cm.add(openCodeStr, {
        run: (editor, senderBtn) => {
            if (!codeEditor) codeEditor = new CodeEditor(editor, senderBtn, opts);
            codeEditor.showCodePanel();
        },
        stop: (editor, senderBtn) => {
            if (codeEditor) codeEditor.hideCodePanel();
        },
    });
}