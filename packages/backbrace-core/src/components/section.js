import $ from 'cash-dom';

import { Component } from './component';
import { get as getData } from '../providers/data';
import { makeObservable, observable } from 'mobx';

/**
 * @class Section
 * @augments Component
 * @description
 * Section component base class.
 */
export class Section extends Component {

    /**
     * Component attributes.
     * @static
     * @returns {Map<string,string>} Returns attributes.
     */
    static attributes() {
        return new Map([
            ['cols', 'string']
        ]);
    }

    /**
     * @constructs Section
     */
    constructor() {

        super();

        /**
         * @description
         * Section design.
         * @type {import('../types').pageSectionDesign}
         */
        this.design = null;

        /**
         * @description
         * Page params.
         * @type {Object}
         */
        this.params = {};

        /**
         * @description
         * Attribute. Column layout.
         * @type {string}
         */
        this.cols = '';

        makeObservable(this, {
            design: observable
        });
    }

    /**
     * Set the component attributes from the section design.
     * @returns {void}
     */
    setAttributes() {
        if (this.design)
            Object.entries(this.design.attributes).forEach(([name, value]) => {
                if (value.join)
                    value = value.join('');
                this.setAttribute(name, value);
            });
    }

    /** @overrides */
    componentDidMount() {
        if (this.cols)
            this.cols.split(' ').forEach((c) => this.classList.add(c));
    }

    /**
     * Load the component.
     * @async
     * @returns {Promise<void>}
     */
    async load() {
    }

    /**
     * Save the section data.
     * @async
     * @returns {Promise<void>}
     */
    async save() {

        this.setState({ isLoading: true });

        let ret = await getData().update(this.design.data, this.params, null, this.design, this.state.data);

        this.setState({ isLoading: false });

        if (ret.error)
            throw this.error('save', ret.error);

        let notify = $('<div class="notify show">Saved!</div>').appendTo('body');
        window.setTimeout(() => notify.remove(), 2000);

    }

    /**
     * Runs after all sections have been added to the page.
     * @returns {void}
     */
    show() {
    }

}
