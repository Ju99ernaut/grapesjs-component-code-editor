//Original work Copyright (c) 2018, Duarte Henriques, https://github.com/portablemind/grapesjs-code-editor
//Modified work Copyright (c) 2020, Brendon Ngirazi, 
//All rights reserved.

import Split from 'split.js';

export class CodeEditor {
    constructor(editor, senderBtn, opts) {
        this.editor = editor;
        this.pfx = editor.getConfig('stylePrefix');
        this.sm = editor.Panels.getButton('views', 'open-sm');
        this.opts = opts || {
            editJs: false,
        };
        this.senderBtn = senderBtn;
        this.isShowing = true;
        this.buildCodePanel(editor);
    }

    findPanel() {
        const pn = this.editor.Panels;
        const id = 'views-container';
        const panel = pn.getPanel(id) || pn.addPanel({
            id
        });
        return panel;
    }

    findWithinEditor(arg) {
        return this.editor.$(arg, this.editor.getEl());
    }

    buildCodeEditor(type) {
        let codeEditor = this.editor.CodeManager.getViewer('CodeMirror').clone();
        codeEditor.set({
            codeName: type === 'html' ? 'htmlmixed' : 'css',
            readOnly: false,
            theme: 'hopscotch',
            autoBeautify: true,
            autoCloseTags: true,
            autoCloseBrackets: true,
            styleActiveLine: true,
            smartIndent: true,
        });
        return codeEditor;
    }

    buildSection(type, editor, textArea) {
        const section = document.createElement('section');
        section.innerHTML = `
            <div class="codepanel-separator">
                <div class="codepanel-label">${type}</div>
                <button class="cp-apply-${type} ${this.pfx}btn-prim">Apply</button>
            </div>`;
        section.appendChild(textArea);
        this.codePanel.appendChild(section);
        return section;
    }

    buildCodePanel(editor) {
        const panel = this.findPanel();
        this.codePanel = document.createElement('div');
        this.codePanel.classList.add('code-panel');

        let sections = [];
        let cssTextArea = null;

        this.htmlCodeEditor = this.buildCodeEditor('html');
        const htmlTextArea = document.createElement('textarea');
        sections.push(this.buildSection('html', this.htmlCodeEditor, htmlTextArea));

        this.cssCodeEditor = this.buildCodeEditor('css');
        cssTextArea = document.createElement('textarea');
        sections.push(this.buildSection('css', this.cssCodeEditor, cssTextArea));

        panel.set('appendContent', this.codePanel).trigger('change:appendContent');
        this.htmlCodeEditor.init(htmlTextArea);
        if (!this.opts.inlineCss) this.cssCodeEditor.init(cssTextArea);
        this.updateEditorContents();

        this.findWithinEditor('.cp-apply-html')
            .get(0)
            .addEventListener('click', this.updateHtml.bind(this));

        this.findWithinEditor('.cp-apply-css')
            .get(0)
            .addEventListener('click', this.updateCss.bind(this));

        Split(sections, {
            direction: 'vertical',
            sizes: [50, 50],
            minSize: 100,
            gutterSize: 1,
            onDragEnd: this.refreshEditors.bind(this),
        });

        this.editor.on('component:add', model => {
            this.editor.select(model);
            this.updateEditorContents();
        });
        this.editor.on('component:update', model => {
            this.updateEditorContents();
        });

        return this.codePanel;
    }

    showCodePanel() {
        this.isShowing = true;
        this.updateEditorContents();
        this.codePanel.style.display = 'block';
        // make sure editor is aware of width change after the 300ms effect ends
        setTimeout(this.refreshEditors.bind(this), 320);
        this.findWithinEditor(`.${this.pfx}pn-views-container`).get(0).style.width =
            '35%';
        this.findWithinEditor(`.${this.pfx}cv-canvas`).get(0).style.width = '65%';
    }

    hideCodePanel() {
        if (this.codePanel) this.codePanel.style.display = 'none';
        this.findWithinEditor(`.${this.pfx}pn-views-container`).get(0).style.width = '15%';
        this.findWithinEditor(`.${this.pfx}cv-canvas`).get(0).style.width = '85%';
        this.opts.openStyleOnClose && this.sm && this.sm.set('active', 1);
        this.isShowing = false;
    }

    refreshEditors() {
        this.htmlCodeEditor.editor.refresh();
        this.cssCodeEditor.editor.refresh();
    }

    updateHtml() {
        let htmlCode = this.htmlCodeEditor.editor.getValue();
        if (!htmlCode || htmlCode === this.previousHtmlCode) return;
        this.previousHtmlCode = htmlCode;

        let idStyles = '';
        this.cssCodeEditor.editor
            .getValue()
            .split(/(?<=}\n)/g)
            .forEach(rule => {
                if (/^#/.test(rule))
                    idStyles += rule;
            });

        htmlCode += `<style>${idStyles}</style>`;

        const component = this.editor.getSelected();
        component.replaceWith(htmlCode);

        this.opts.openStyleOnClose && this.senderBtn.set('active', false) && this.hideCodePanel();
    }

    updateCss() {
        const cssCode = this.cssCodeEditor.editor.getValue();
        if (!cssCode || cssCode === this.previousCssCode) return;
        this.previousCssCode = cssCode;
        this.editor.SelectorManager.add(this.editor.Parser.parseCss(cssCode));
        //this.editor.setStyle(cssCode)
        const cc = this.editor.CssComposer;
        const selectorRules = cssCode.split(/(?<=}\n)/g);
        for (let pair in selectorRules) {
            let rulePair = selectorRules[pair].split(/(?={)/g);
            //? selector eg. #id, rule eg. {color: 'red'}
            if (!/^@/.test(rulePair[0]))
                cc.setRule(rulePair[0], rulePair[1].replace("{", "")); //Somehow a "{" is being prepended
        }
    }

    updateEditorContents() {
        if (!this.isShowing) return;

        const component = this.editor.getSelected();
        if (component) {
            this.htmlCodeEditor.setContent(this.getComponentHtml(component));
            if (!this.opts.inlineCss) {
                this.cssCodeEditor.setContent(this.editor.CodeManager.getCode(component, 'css', {
                    cssc: this.editor.CssComposer
                }));
            }
        }
    }

    getComponentHtml(component) {
        let result = '';

        component.getEl().classList.remove(`${this.pfx}selected`)
        const html = this.opts.clearData ? component.toHTML() : component.getEl().outerHTML;
        component.getEl().classList.add(`${this.pfx}selected`);
        result += html;

        const js = this.opts.editJs ? component.get('script') : '';
        result += js ? `<script>${js}</script>` : '';

        return result;
    }
}