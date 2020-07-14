//Original work Copyright (c) 2018, Duarte Henriques, https://github.com/portablemind/grapesjs-code-editor
//Modified work Copyright (c) 2020, Brendon Ngirazi, 
//All rights reserved.
//
//Redistribution and use in source and binary forms, with or without modification,
//are permitted provided that the following conditions are met:
//
//- Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//- Redistributions in binary form must reproduce the above copyright notice, this
//  list of conditions and the following disclaimer in the documentation and/or
//  other materials provided with the distribution.
//- Neither the name "GrapesJS" nor the names of its contributors may be
//  used to endorse or promote products derived from this software without
//  specific prior written permission.
//THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
//ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
//WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
//DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
//ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
//(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
//LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
//ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
//SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import Split from 'split.js';
import juice from 'juice';

class CodeEditor {
    constructor(editor, senderBtn, opts) {
        this.editor = editor;
        this.pfx = editor.getConfig('stylePrefix');
        this.opts = opts || {
            inlineCss: false,
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

        if (!this.opts.inlineCss) {
            this.cssCodeEditor = this.buildCodeEditor('css');
            cssTextArea = document.createElement('textarea');
            sections.push(this.buildSection('css', this.cssCodeEditor, cssTextArea));
        }

        panel.set('appendContent', this.codePanel).trigger('change:appendContent');
        this.htmlCodeEditor.init(htmlTextArea);
        if (!this.opts.inlineCss) this.cssCodeEditor.init(cssTextArea);
        this.updateEditorContents();

        this.findWithinEditor('.cp-apply-html')
            .get(0)
            .addEventListener('click', this.updateHtml.bind(this));

        if (!this.opts.inlineCss) {
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
        }

        this.editor.on('component:add', model => {
            this.editor.select(model);
            this.updateEditorContents();
            if (this.opts.openStyleOnSave) {
                const sm = this.editor.Panels.getButton('views', 'open-sm');
                sm && sm.set('active', 1);
            }
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
        this.findWithinEditor('.gjs-pn-views-container').get(0).style.width =
            '35%';
        this.findWithinEditor('.gjs-cv-canvas').get(0).style.width = '65%';
    }

    hideCodePanel() {
        if (this.codePanel) this.codePanel.style.display = 'none';
        this.findWithinEditor('.gjs-pn-views-container').get(0).style.width = '15%';
        this.findWithinEditor('.gjs-cv-canvas').get(0).style.width = '85%';
        this.isShowing = false;
    }

    refreshEditors() {
        this.htmlCodeEditor.editor.refresh();
        if (!this.opts.inlineCss) {
            this.cssCodeEditor.editor.refresh();
        }
    }

    updateHtml() {
        const htmlCode = this.htmlCodeEditor.editor.getValue();
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
        const htmlInlineCss = juice(
            `${htmlCode}<style>${idStyles}</style>`
        );
        const component = this.editor.getSelected();
        const coll = component.collection;
        const at = coll.indexOf(component);
        coll.remove(component);
        coll.add(htmlInlineCss, {
            at
        });

        //console.log(this.senderBtn);
        this.senderBtn.set('active', false);
        //console.log(this.senderBtn);

        //this.hideCodePanel();
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
            //this.ccid = component.ccid;
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

        if (this.opts.inlineCss) {
            const html = component.toHTML();

            const htmlInlineCss = juice(
                `${html}<style>${this.editor.CodeManager.getCode(component, 'css', {
                    cssc: this.editor.CssComposer
                })}</style>`
            );
            result += htmlInlineCss;
        } else {
            const html = component.toHTML();
            result += html;
        }

        const js = this.opts.editJs ? component.get('script') : '';
        result += js ? `<script>${js}</script>` : '';

        return result;
    }
}

export default CodeEditor;