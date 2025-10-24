import { Plugin } from 'grapesjs';

export type PluginOptions = {
	/** Panel ID to append the code editor into */
	panelId?: string;
	/** Optional CSS selector or element to append the editor into, instead of the default panel */
	appendTo?: string | HTMLElement;
	/** State configuration when the editor is open (width percentages, etc.) */
	openState?: {
		/** Code viewer width percentage or size */
		canvas: string;
		/** Panel width percentage or size */
		panel: string;
	};
	/** State configuration when the editor is closed */
	closedState?: {
		canvas: string;
		panel: string;
	};
	/** Options passed to the internal code viewer (e.g. theme, readOnly, etc.) */
	codeViewOptions?: Record<string, any>;
	/** Prevent resizing between openState and closedState */
	preserveWidth?: boolean;
	/** Remove component data attributes (e.g. data-gjs-type) */
	clearData?: boolean;
	/** Whether to show a “Clean CSS” button in the selector manager */
	cleanCssBtn?: boolean;
	/** Label for the “Apply HTML” button */
	htmlBtnText?: string;
	/** Label for the “Apply CSS” button */
	cssBtnText?: string;
	/** Label for the “Clean CSS” button */
	cleanCssBtnText?: string;
};
export declare const plugin: Plugin;

export {
	plugin as default,
};

export {};
