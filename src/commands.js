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
            // remove senderBtn from CodeEditor ref commit 5b341960bdcd7e4d93dc9d07000e87f7d9d875c1
            !codeEditor && (codeEditor = new CodeEditor(editor, opts)) && codeEditor.buildCodePanel();
            codeEditor.showCodePanel();
        },
        stop: (editor, senderBtn) => {
            codeEditor && codeEditor.hideCodePanel();
        },
    });
}