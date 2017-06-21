export default function slidekit(svg) {
    'use strict';

    var currentIndex = 0;

    var module = {};
    module.gotoSlide = function(i) {
        var s = svg.querySelector('#slide-' + i);
        if (s) {
            currentIndex = i;
            svg.removeAttribute('viewBox');  // reset the user coordinate system
            var bb = s.getBoundingClientRect();
            svg.setAttribute('viewBox', bb.left + ' ' + bb.top + ' ' + bb.width + ' ' + bb.height);

            return i;
        }
        else {
            return false;
        }
    };
    module.nextSlide = function() {
        return module.gotoSlide(currentIndex + 1);
    };
    module.prevSlide = function() {
        return module.gotoSlide(currentIndex - 1);
    };

    return module;
}
