import slidekit from './slidekit';
import slidesSvg from './slides.svg';

// Put the slides SVG inline
document.write(slidesSvg);

var sk = slidekit(document.querySelector('#slides'));

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

// Make `sk` global
window.sk = sk;
