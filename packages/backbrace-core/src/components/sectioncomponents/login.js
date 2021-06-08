import { Card } from './card';
import { fetch, bind } from '../../data';
import { navigate } from '../../route';
import { settings } from '../../settings';
import { appState } from '../../state';
import { get as getData } from '../../providers/data';

/**
 * @class Login
 * @augments Card
 * @description
 * Login section component.
 */
export class Login extends Card {

    /**
     * Component attributes.
     * @static
     * @returns {Map<string,string>} Returns attributes.
     */
    static attributes() {
        return new Map([
            ...super.attributes(),
            ['path', 'string'],
            ['data', 'string'],
            ['loginquery', 'string'],
            ['loginbind', 'string']
        ]);
    }

    /**
     * @constructs Login
     */
    constructor() {

        super();

        /**
         * @description
         * Attribute. Path to navigate to after the login is successful.
         * @type {string}
         */
        this.path = '';

        /**
         * @description
         * Attribute. Data source to query.
         * @type {string}
         */
        this.data = '';

        /**
         * @description
         * Attribute. Query to run when logging in.
         * @type {string}
         */
        this.loginquery = '';

        /**
         * @description
         * Attribute. Binding path to the login object.
         * @type {string}
         */
        this.loginbind = '';

        this.extendState({
            loginError: ''
        });

    }

    /**
     * Executes after login is successful.
     * @async
     * @returns {Promise<void>}
     */
    async onLogin() {

        const path = this.path || this.params.callbackPath;
        const config = getData().config;

        // Get the user info.
        if (config.user?.source) {

            let ret = await getData().find(config.user);

            if (ret) {

                // Check for errors.
                if (ret.error)
                    throw this.error('onlogin', ret.error);

                // Bind the result.
                let bindData = bind(config.user.bind, ret.data);
                appState.user = bindData[0];
            }
        }

        // Navigate to the callback path.
        if (path)
            await navigate(path);
    }

    /**
     * Execute the login query.
     * @async
     * @returns {Promise<void>}
     */
    async login() {

        // Generate variables.
        let variables = {};
        for (let f of this.fields.values()) {
            if (!f.value) {
                this.setState({ loginError: `Please enter your ${f.caption}` });
                return;
            }
            variables[f.design.bind || f.design.name] = f.value;
        }

        this.setState({ isLoading: true, loginError: '' });

        let data = await fetch(this.data, this.loginquery, variables);

        if (data) {

            // Check for errors.
            if (data?.errors?.[0].message) {
                this.setState({ isLoading: false, loginError: data.errors[0].message });
                return;
            }

            // Bind the result.
            let bindData = bind(this.loginbind, data);

            // Save the auth.
            appState.auth = bindData;
            appState.isAuthenticated = true;

            this.setState({ isLoading: false });

            await this.onLogin();

        }

    }

    /** @override */
    async load() {

        // Auto login.
        if (settings.auth.refreshTokenURL) {
            let res = await window.fetch(settings.auth.refreshTokenURL, {
                credentials: 'include'
            });
            if (res.ok) {

                let data = await res.json();

                // Save the auth.
                appState.auth = data;
                appState.isAuthenticated = true;

                await this.onLogin();
                return;
            }
        }

        await super.load();

        // Login on enter.
        for (let f of this.fields.values())
            f.addEventListener('keyup', (ev) => {
                if (ev.keyCode === 13) {
                    ev.preventDefault();
                    this.login();
                }
            });
    }

    /** @override */
    renderContent() {
        return this.html`
            ${super.renderContent()}
            ${this.state['loginError'] ? this.html`<span class="bb-login-error">${this.state['loginError']}</span>` : ''}
            <bb-button caption="Login" class="clickable" @click=${this.login}></bb-button>
        `;
    }

}

export default Login;

Card.define('bb-login', Login);
