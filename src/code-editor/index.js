//Original work Copyright (c) 2018, Duarte Henriques, https://github.com/portablemind/grapesjs-code-editor
//Modified work Copyright (c) 2020, Brendon Ngirazi, 
//All rights reserved.

import Split from 'split.js';

export class CodeEditor {
    constructor(editor, opts) {
        this.editor = editor;
        this.$ = editor.$;
        this.pfx = editor.getConfig('stylePrefix');
        this.opts = opts || {
            editJs: false,
        };
        this.canvas = this.findWithinEditor(`.${this.pfx}cv-canvas`);
        this.panelViews = this.findWithinEditor(`.${this.pfx}pn-views-container`);
        this.isShowing = true;
    }

    findPanel() {
        const pn = this.editor.Panels;
        const id = 'views-container';
        const panel = pn.getPanel(id) || pn.addPanel({
            id
        });
        return panel;
    }

    findWithinEditor(selector) {
        return this.$(selector, this.editor.getEl());
    }

    buildCodeEditor(type) {
        const {
            editor,
            opts
        } = this;

        return editor.CodeManager.createViewer({
            codeName: type === 'html' ? 'htmlmixed' : 'css',
            theme: 'hopscotch',
            readOnly: 0,
            autoBeautify: 1,
            autoCloseTags: 1,
            autoCloseBrackets: 1,
            styleActiveLine: 1,
            smartIndent: 1,
            ...opts.codeViewOptions
        });
    }

    buildSection(type, codeViewer) {
        const {
            $,
            pfx
        } = this;
        const section = $('<section></section>');
        section.append($(`
            <div class="codepanel-separator">
                <div class="codepanel-label">${type}</div>
                <button class="cp-apply-${type} ${pfx}btn-prim">Apply</button>
            </div>`));
        const codeViewerEl = codeViewer.getElement();
        codeViewerEl.style.height = 'calc(100% - 25px)';
        section.append(codeViewerEl);
        this.codePanel.append(section);
        return section.get(0);
    }

    buildCodePanel() {
        const {
            $,
            editor,
        } = this;
        const panel = this.findPanel();
        this.codePanel = $('<div></div>');
        this.codePanel.get(0).classList.add('code-panel');

        this.htmlCodeEditor = this.buildCodeEditor('html');
        this.cssCodeEditor = this.buildCodeEditor('css');

        const sections = [this.buildSection('html', this.htmlCodeEditor),
            this.buildSection('css', this.cssCodeEditor)
        ];

        panel.set('appendContent', this.codePanel).trigger('change:appendContent');
        this.updateEditorContents();

        this.codePanel.find('.cp-apply-html')
            .on('click', this.updateHtml.bind(this));

        this.codePanel.find('.cp-apply-css')
            .on('click', this.updateCss.bind(this));

        Split(sections, {
            direction: 'vertical',
            sizes: [50, 50],
            minSize: 100,
            gutterSize: 1,
            onDragEnd: this.refreshEditors.bind(this),
        });

        editor.on('component:update', model => {
            this.updateEditorContents();
        });
    }

    showCodePanel() {
        this.isShowing = true;
        this.updateEditorContents();
        this.codePanel.get(0).style.display = 'block';
        // make sure editor is aware of width change after the 300ms effect ends
        setTimeout(this.refreshEditors.bind(this), 320);
        this.panelViews.get(0).style.width = '35%';
        this.canvas.get(0).style.width = '65%';
    }

    hideCodePanel() {
        if (this.codePanel) this.codePanel.get(0).style.display = 'none';
        this.panelViews.get(0).style.width = '15%';
        this.canvas.get(0).style.width = '85%';
        this.isShowing = false;
    }

    refreshEditors() {
        this.htmlCodeEditor.refresh();
        this.cssCodeEditor.refresh();
    }

    updateHtml() {
        const {
            editor,
            component
        } = this
        let htmlCode = this.htmlCodeEditor.getContent().trim();
        if (!htmlCode || htmlCode === this.previousHtmlCode) return;
        this.previousHtmlCode = htmlCode;

        let idStyles = '';
        this.cssCodeEditor
            .getContent()
            .split(/(?<=}\n)/g)
            .forEach(rule => {
                if (/^#/.test(rule))
                    idStyles += rule;
            });

        htmlCode += `<style>${idStyles}</style>`;

        editor.select(component.replaceWith(htmlCode));
    }

    updateCss() {
        const cssCode = this.cssCodeEditor.getContent().trim();
        if (!cssCode || cssCode === this.previousCssCode) return;
        this.previousCssCode = cssCode;
        this.editor.Components.addComponent(`<style>${cssCode}</style>`);
    }

    updateEditorContents() {
        if (!this.isShowing) return;

        this.component = this.editor.getSelected();
        if (this.component) {
            this.htmlCodeEditor.setContent(this.getComponentHtml(this.component));
            this.cssCodeEditor.setContent(this.editor.CodeManager.getCode(this.component, 'css', {
                cssc: this.editor.CssComposer
            }));
        }
    }

    getComponentHtml(component) {
        const {
            pfx,
            opts
        } = this;
        let result = '';
        const componentEl = component.getEl();

        !opts.clearData && componentEl.classList.remove(`${pfx}selected`);
        const html = opts.clearData ? component.toHTML() :
            (componentEl.id === 'wrapper' ? componentEl.innerHTML : componentEl.outerHTML);
        !opts.clearData && componentEl.classList.add(`${pfx}selected`);
        result += html;

        const js = opts.editJs ? component.getScriptString() : '';
        result += js ? `<script>${js}</script>` : '';

        return result;
    }
}