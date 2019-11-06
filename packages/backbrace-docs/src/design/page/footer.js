/**
 * @license
 * Copyright Paul Fisher <backbraceio@gmail.com> All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://backbrace.io/mitlicense
 */

backbrace.controller('footer', (viewer, section) => {

    // Set the section template.
    section.template = '{{html}}';
    section.container.css('width', '100vw');

    // Filter the data.
    section.beforeUpdate = () => {
        section.data = section.data.filter(val => val.name.toLowerCase() === 'footer');
    };

});