import { ShadowComponent } from './shadowcomponent';

/**
 * @class Preloader
 * @augments ShadowComponent
 * @description
 * Preloader Component.
 */
export class Preloader extends ShadowComponent {

    /**
     * Component attributes.
     * @static
     * @returns {Map<string,string>} Returns attributes.
     */
    static attributes() {
        return new Map([
            ['headercolor', 'string']
        ]);
    }

    /**
     * @constructs Preloader
     */
    constructor() {

        super();

        /**
         * @description
         * Attribute. Header color (defaults to #000).
         * @type {string}
         */
        this.headercolor = '#000';

        // Update the component straight away.
        this.update();
    }

    /**
     * @override
     */
    render() {
        return this.html`
        <style>

            :host {
                display: block;
                margin-top: 100px;
                height: 205px;
                width: 100%;
                overflow: hidden;
                background: #000;
                position: relative;
                -webkit-animation-duration: 1.7s;
                animation-duration: 1.7s;
                -webkit-animation-fill-mode: forwards;
                animation-fill-mode: forwards;
                -webkit-animation-iteration-count: infinite;
                animation-iteration-count: infinite;
                -webkit-animation-timing-function: linear;
                animation-timing-function: linear;
                -webkit-animation-name: placeholderAnimate;
                animation-name: placeholderAnimate;
                background: #f6f7f8;
                background: linear-gradient(to right, #eee 2%, #ddd 18%, #eee 33%);
                background-size: 1300px;
            }

            :host([hidden]) {
                display: none;
            }

            .header {
                top: 0px;
                left: 0px;
                right: 0px;
                z-index: 3000;
                height: 60px;
                background: ${this.headercolor};
                position: fixed;
            }

            .item {
                width: 100%;
                height: 20px;
                position: absolute;
                background: #fff;
                z-index: 2;
            }

            .item:after,
            .item:before {
                width: inherit;
                height: inherit;
                content: "";
                position: absolute;
            }

            .item:nth-child(1) {
                top: 0;
                left: 0;
            }

            .item:nth-child(2) {
                top: 20px;
                left: 0;
                width: 10%;
                height: 90px;
            }

            .item:nth-child(3) {
                top: 0px;
                left: 0;
                width: 10%;
                height: 100%;
            }

            .item:nth-child(4) {
                top: 20px;
                width: 20px;
                left: 170px;
                height: 90px;
            }

            .item:nth-child(5) {
                top: 40px;
                left: 190px;
                height: 12px;
            }

            .item:nth-child(6) {
                top: 75px;
                left: 190px;
                height: 12px;
            }

            .item:nth-child(7) {
                top: 20px;
                right: 0;
                width: 23%;
                height: 20px;
            }

            .item:nth-child(8) {
                top: 0;
                right: 0;
                width: 10%;
                height: 100%;
            }

            .item:nth-child(9) {
                top: 110px;
                height: 17px;
                left: 0;
            }

            .item:nth-child(10) {
                top: 149px;
                height: 12px;
                left: 0;
            }

            .item:nth-child(11) {
                top: 183px;
                left: 0;
                height: 100%;
            }

            @-webkit-keyframes placeholderAnimate {
                0% {
                    background-position: -650px 0;
                }
                100% {
                    background-position: 650px 0;
                }
            }

            @keyframes placeholderAnimate {
                0% {
                    background-position: -650px 0;
                }
                100% {
                    background-position: 650px 0;
                }
            }

        </style>
        <div class="header">
        </div>
        <div class="item"></div>
        <div class="item"></div>
        <div class="item"></div>
        <div class="item"></div>
        <div class="item"></div>
        <div class="item"></div>
        <div class="item"></div>
        <div class="item"></div>
        <div class="item"></div>
        <div class="item"></div>
        <div class="item"></div>
        `;
    }

}

ShadowComponent.define('bb-preloader', Preloader);
