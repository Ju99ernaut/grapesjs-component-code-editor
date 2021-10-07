//Original work Copyright (c) 2018, Duarte Henriques, https://github.com/portablemind/grapesjs-code-editor
//Modified work Copyright (c) 2020, Brendon Ngirazi,
//All rights reserved.

import Split from 'split.js';

export class CodeEditor {
    constructor(editor, opts) {
        this.editor = editor;
        this.$ = editor.$;
        this.pfx = editor.getConfig('stylePrefix');
        this.opts = opts;
        this.canvas = this.findWithinEditor(`.${this.pfx}cv-canvas`);
        this.panelViews = opts.appendTo ? this.$(opts.appendTo) :
            this.findWithinEditor(`.${this.pfx}pn-${opts.panelId}`);
        this.isShowing = true;
    }

    findPanel() {
        const pn = this.editor.Panels;
        const id = this.opts.panelId;
        const panel = pn.getPanel(id) || pn.addPanel({ id });
        return panel;
    }

    findWithinEditor(selector) {
        return this.$(selector, this.editor.getEl());
    }

    buildCodeEditor(type) {
        const { editor, opts } = this;

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
        const { $, pfx, opts } = this;
        const section = $('<section></section>');
        const btnText = type === 'html' ? opts.htmlBtnText : opts.cssBtnText;
        const cleanCssBtn = (opts.cleanCssBtn && type === 'css') ?
            `<button class="cp-delete-${type} ${pfx}btn-prim">${opts.cleanCssBtnText}</button>` : '';
        section.append($(`
            <div class="codepanel-separator">
                <div class="codepanel-label">${type}</div>
                <div class="cp-btn-container">
                    ${cleanCssBtn}
                    <button class="cp-apply-${type} ${pfx}btn-prim">${btnText}</button>
                </div>
            </div>`));
        const codeViewerEl = codeViewer.getElement();
        codeViewerEl.style.height = 'calc(100% - 30px)';
        section.append(codeViewerEl);
        this.codePanel.append(section);
        return section.get(0);
    }

    buildCodePanel() {
        const { $, editor } = this;
        const panel = this.opts.panelId ? this.findPanel() : 0;
        this.codePanel = $('<div></div>');
        this.codePanel.addClass('code-panel');

        this.htmlCodeEditor = this.buildCodeEditor('html');
        this.cssCodeEditor = this.buildCodeEditor('css');

        const sections = [this.buildSection('html', this.htmlCodeEditor), this.buildSection('css', this.cssCodeEditor)];

        panel && !this.opts.appendTo &&
            panel.set('appendContent', this.codePanel).trigger('change:appendContent');
        this.opts.appendTo && $(this.opts.appendTo).append(this.codePanel);
        this.updateEditorContents();

        this.codePanel.find('.cp-apply-html')
            .on('click', this.updateHtml.bind(this));

        this.codePanel.find('.cp-apply-css')
            .on('click', this.updateCss.bind(this));

        this.opts.cleanCssBtn && this.codePanel.find('.cp-delete-css')
            .on('click', this.deleteSelectedCss.bind(this));

        Split(sections, {
            direction: 'vertical',
            sizes: [50, 50],
            minSize: 100,
            gutterSize: 1,
            onDragEnd: this.refreshEditors.bind(this),
        });

        editor.on('component:update', model => this.updateEditorContents());
    }

    showCodePanel() {
        this.isShowing = true;
        this.updateEditorContents();
        this.codePanel.css('display', 'block');
        // make sure editor is aware of width change after the 300ms effect ends
        setTimeout(this.refreshEditors.bind(this), 320);

        if (this.opts.preserveWidth) return;

        this.panelViews.css('width', this.opts.openState.pn);
        this.canvas.css('width', this.opts.openState.cv);
    }

    hideCodePanel() {
        if (this.codePanel) this.codePanel.css('display', 'none');
        this.isShowing = false;

        if (this.opts.preserveWidth) return;

        this.panelViews.css('width', this.opts.closedState.pn);
        this.canvas.css('width', this.opts.closedState.cv);
    }

    refreshEditors() {
        this.htmlCodeEditor.refresh();
        this.cssCodeEditor.refresh();
    }

    updateHtml(e) {
        e?.preventDefault();
        const { editor, component } = this;
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

        if (component.attributes.type === 'wrapper') {
            editor.setComponents(htmlCode);
        } else {
            editor.select(component.replaceWith(htmlCode));
        }
    }

    updateCss(e) {
        e?.preventDefault();
        const cssCode = this.cssCodeEditor.getContent().trim();
        if (!cssCode || cssCode === this.previousCssCode) return;
        this.parseRemove(cssCode);
        this.previousCssCode = cssCode;
        this.editor.addStyle(cssCode);
    }

    deleteSelectedCss(e) {
        e?.preventDefault();
        const selections = this.cssCodeEditor.editor.getSelections();
        selections.forEach(selection => this.parseRemove(selection));
        this.cssCodeEditor.editor.deleteH();
    }

    parseRemove(removeCss) {
        const { editor } = this;
        const cssc = editor.CssComposer
        const allRules = cssc.getAll();
        editor.Parser.parseCss(removeCss).forEach(p => {
            const config = {
                singleAtRule: p.singleAtRule,
                atRuleType: p.atRuleType,
                mediaText: p.mediaText,
                state: p.state
            };
            p.selectors.length &&
                p.selectors.forEach(selector => {
                    this.removeSelector(selector, allRules, cssc, config);
                });
            p.selectorsAdd &&
                p.selectorsAdd.split(', ').forEach(selector => {
                    this.removeSelector(selector, allRules, cssc, config);
                });
        });
    }

    removeSelector(rule, allRules, cssc, opts = {}) {
        const { singleAtRule, atRuleType, mediaText, state } = opts;
        const toRemove = allRules.filter(r => {
            if (atRuleType && mediaText)
                return r => r.get('atRuleType') == atRuleType && r.get('mediaText') == mediaText;
            else if (atRuleType && singleAtRule)
                return r => r.get('atRuleType') == atRuleType && r.get('singleAtRule') == singleAtRule;
            else if (state)
                return r == cssc.getRule(`${rule}:${state}`);
            return r == cssc.getRule(rule);
        });
        allRules.remove(toRemove);
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
        const { pfx, opts } = this;
        let result = '';
        const componentEl = component.getEl();

        !opts.clearData && componentEl.classList.remove(`${pfx}selected`);
        const html = opts.clearData ? component.toHTML() :
            (component.attributes.type === 'wrapper' ? componentEl.innerHTML : componentEl.outerHTML);
        !opts.clearData && componentEl.classList.add(`${pfx}selected`);
        result += html;

        const js = opts.editJs ? component.getScriptString() : '';
        result += js ? `<script>${js}</script>` : '';

        return result;
    }
}
