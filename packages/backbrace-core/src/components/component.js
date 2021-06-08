import { render as renderLit, TemplateResult, defaultTemplateProcessor } from 'lit-html/lit-html';
import { styleMap } from 'lit-html/directives/style-map';
import { classMap } from 'lit-html/directives/class-map';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { asyncAppend } from 'lit-html/directives/async-append.js';
import { asyncReplace } from 'lit-html/directives/async-replace.js';
import { observable, autorun, action, makeObservable, extendObservable } from 'mobx';

import { processLinks } from '../route';
import { uid } from '../util';

import { get as getErrorHandler } from '../providers/error';
import { error } from '../error';
import { ComponentError } from '../errors/component';

/**
 * @ignore
 * @description
 * Convert an attribute to a property.
 * @param {string|null} value Attribute value.
 * @param {string} type Attribute type.
 * @returns {unknown} Returns the property value.
 */
function fromAttribute(value, type) {
    switch (type) {
        case 'boolean':
            return value !== null;
        case 'number':
            return value === null ? null : Number(value);
        case 'Object':
        case 'Array':
            return JSON.parse(value || '');
    }
    return value;
}

/**
 * @class Component
 * @augments HTMLElement
 * @description
 * Component class.
 *
 * Used as the base for all components.
 */
export class Component extends HTMLElement {

    /**
     * @constructs Component
     */
    constructor() {

        super();

        /**
         * @description
         * Unique identifier for the component. Automatically generated.
         * @type {number}
         */
        this.uid = uid();

        /**
         * @description
         * Interprets a template literal as a HTML template.
         * @param {TemplateStringsArray} strings Template string.
         * @param {...any} values Template values.
         * @returns {unknown} Returns the HTML template.
         */
        this.html = (strings, ...values) =>
            new TemplateResult(strings, values, 'html', defaultTemplateProcessor);

        /**
         * @ignore
         * @description
         * Stores the changed properties since the last update.
         * @type {Map<string,string>}
         */
        this.changedProperties = new Map();

        /**
         * @description
         * If `true`, the component is connected to the DOM.
         * @type {boolean}
         */
        this.connected = false;

        /**
         * @description
         * Old display style.
         * @type {string}
         */
        this.oldDisplay = this.style.display;

        const err = error(this.tagName.toLowerCase(), this, ComponentError);

        /**
         * @description
         * Component error.
         * @param {string} code Error code.
         * @param {string} message Error message.
         * @returns {import('../errors/app').AppError} Returns a new error object.
         */
        this.error = (code, message) => err(code, message);

        /**
         * @description
         * Component state.
         * @type {Readonly<import('../types').componentState>}
         */
        this.state = observable({
            data: [],
            hasError: false,
            hasFocus: false,
            error: null,
            isLoading: false,
            isLoaded: false
        });

        makeObservable(this, {
            setState: action
        });
    }

    /**
     * Set the new state of the component.
     * @param {any} state New component state.
     * @returns {void}
     */
    setState(state) {
        this.state = Object.assign(this.state, state);
    }

    /**
     * Extend the component state.
     * @param {any} props New state properties.
     * @returns {void}
     */
    extendState(props) {
        extendObservable(this.state, props);
    }

    /**
     * Called when the component is connected to the DOM.
     * @ignore
     * @returns {void}
     */
    connectedCallback() {
        const autoUpdate = () => {
            if (!this.connected) {
                this.connected = true;
                this.update(true);
                this.componentDidMount();
            } else {
                this.update();
            }
        };
        autorun(autoUpdate);
    }

    /**
     * Called when the component is removed from the DOM.
     * @ignore
     * @returns {void}
     */
    disconnectedCallback() {
        this.connected = false;
        this.componentWillUnmount();
    }

    /**
     * Component attributes.
     * @static
     * @returns {Map<string,string>} Returns a map of the names and types of the attributes.
     */
    static attributes() {
        return new Map();
    }

    /**
     * Define the component as a DOM element.
     * @param {string} name Element name.
     * @param {CustomElementConstructor} comp Component class.
     * @returns {void}
     */
    static define(name, comp) {
        if (!window.customElements.get(name))
            window.customElements.define(name, comp);
    }

    /**
     * Component attributes (internal use only).
     * @ignore
     * @static
     * @returns {string[]} Returns attributes.
     */
    static get observedAttributes() {
        return Array.from(this.attributes().keys());
    }

    /**
     * @description
     * Get the container element of the component.
     * @returns {HTMLElement|DocumentFragment} Returns the container element.
     */
    container() {
        return this;
    }

    /**
     * Set a component attribute.
     * @param {string} name Attribute name.
     * @param {string} value Attribute value. If `value` is null, the attribute will be removed.
     * @returns {void}
     */
    setAttribute(name, value) {

        const oldval = this[name];

        if (typeof value === 'boolean' && value === true)
            value = '';

        if (value === null) {
            super.removeAttribute(name);
        } else {
            super.setAttribute(name, value);
        }

        // @ts-ignore
        const type = this.constructor.attributes().get(name);

        this[name] = fromAttribute(value, type);
        this.changedProperties.set(name, oldval);
    }

    /**
     * Attribute changed event (internal use only).
     * @ignore
     * @param {string} name Attribute name.
     * @param {string} oldValue Old value.
     * @param {string} newValue New value.
     * @returns {void}
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            try {
                // @ts-ignore
                const type = this.constructor.attributes().get(name);
                this[name] = fromAttribute(newValue, type);
                this.changedProperties.set(name, oldValue);
                this.update();
            } catch (e) {
                throw this.error('atrributes', `Cannot set component property: ${name}, Value: ${newValue}. Error: ${e.message || e}`);
            }
        }
    }

    /**
     * Impliment `render` to define a template for the component.
     * @returns {unknown} Returns the HTML template.
     */
    render() {
        return this.html`
            <span></span>
        `;
    }

    /**
     * Invokes before updating the component.
     * @param {Map<string,any>} changedProperties Map of changed properties.
     * @returns {boolean} Return false to skip updating of the component.
     */
    shouldComponentUpdate(changedProperties) {
        return true;
    }

    /**
     * Invoked immediately after a component is mounted (inserted into the DOM).
     * @returns {void}
     */
    componentDidMount() {
    }

    /**
     * Invoked immediately after updating occurs. This method is not called for the initial render.
     * @param {Map<string,any>} changedProperties Map of changed properties.
     * @returns {void}
     */
    componentDidUpdate(changedProperties) {
    }

    /**
     * Is invoked immediately before a component is unmounted and destroyed.
     * @returns {void}
     */
    componentWillUnmount() {
    }

    /**
     * Update the component.
     * @property {boolean} [first] First render.
     * @property {boolean} [skipErrors] Skip error handling.
     * @returns {void}
     */
    update(first, skipErrors) {

        // Only update the component if it is attached to the DOM.
        if (!this.connected)
            return;

        // Render the component.
        if (first || this.shouldComponentUpdate(this.changedProperties)) {

            try {

                renderLit(this.render(), this.container(), { eventContext: this });

                // We have updated.
                if (!first) {
                    this.componentDidUpdate(this.changedProperties);
                }

            } catch (e) {
                // Handle the error if we aren't in the error state.
                if (!this.state.hasError && !skipErrors) {
                    getErrorHandler().handleError(e);
                    this.update(false, true);
                    return;
                }
            }

            // Process links.
            processLinks(this);
        }

        this.changedProperties.clear();
    }

    /**
     * Renders the result as HTML instead of text.
     * @param {unknown} value Value to render as HTML
     * @returns {Function}
     */
    unsafeHTML(value) {
        return unsafeHTML(value);
    }

    /**
     * Renders the result of an aysnc function.
     * @param {AsyncIterable<any>} value Value to render as HTML
     * @returns {Function}
     */
    asyncAppend(value) {
        return asyncAppend(value);
    }

    /**
     * Renders the result of an aysnc function.
     * @param {AsyncIterable<any>} value Value to render as HTML
     * @returns {Function}
     */
    asyncReplace(value) {
        return asyncReplace(value);
    }

    /**
     * Apply css properties to an element.
     * @param {Object} style Style object to apply.
     * @returns {Function}
     */
    styleMap(style) {
        return styleMap(style);
    }

    /**
     * Apply classes to an element.
     * @param {Object} classes Classes to apply.
     * @returns {Function}
     */
    classMap(classes) {
        return classMap(classes);
    }

    /**
     * Show the component.
     * @returns {void}
     */
    show() {
        this.oldDisplay = this.oldDisplay || 'block';
        this.style.display = this.oldDisplay;
    }

    /**
     * Hide the component.
     * @returns {void}
     */
    hide() {
        this.oldDisplay = this.style.display;
        this.style.display = 'none';
    }

    /**
     * Remove the component from the DOM.
     * @returns {void}
     */
    remove() {
        const parent = this.parentNode;
        if (parent)
            parent.removeChild(this);
    }

}
