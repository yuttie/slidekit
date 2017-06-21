import slidekit from './slidekit';

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
