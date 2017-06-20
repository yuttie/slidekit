const slidekit = function(svgDoc) {
    'use strict';

    var currentIndex = 0;

    var module = {};
    module.gotoSlide = function(i) {
        var s = svgDoc.querySelector('#slide-' + i);
        if (s) {
            currentIndex = i;
            var svg = svgDoc.querySelector('svg');
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
};

var sk;
const slides = document.querySelector('#slides');
slides.addEventListener('load', function(e) {
    sk = slidekit(this.contentDocument);

    // Move to the first slide
    sk.gotoSlide(0);

    // Key bindings
    document.addEventListener('keydown', function(e) {
        if (e.keyCode === 0 || e.keyCode === 39) {
            // next
            sk.nextSlide();
        }
        else if (e.keyCode === 8 || e.keyCode === 37) {
            // previous
            sk.prevSlide();
        }
    });
});
