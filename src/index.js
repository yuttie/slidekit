'use strict';
import "babel-polyfill";

import './style.scss';
import slidekit from './slidekit';
import slidesSvg from './slides.svg';

// Put the slides SVG inline
document.write(slidesSvg);

var sk = slidekit(document.querySelector('#slides'));

{
  const i = parseInt(location.hash.slice(1), 10);
  if (!Number.isNaN(i)) {
    const res = sk.gotoSlide(i);
    if (res === false) {
      sk.gotoSlide(0);
    }
  }
  else {
    // Move to the first slide
    sk.gotoSlide(0);
  }
}

// Key bindings
document.addEventListener('keydown', function(e) {
  if (e.target.tagName === 'BODY') {
    if (e.keyCode === 32 || e.keyCode === 39 || e.keyCode === 34) {
      // next
      sk.nextSlide();
    }
    else if (e.keyCode === 8 || e.keyCode === 37 || e.keyCode === 33) {
      // previous
      sk.prevSlide();
    }
    else if (e.keyCode === 27) {
      // overview
      sk.switchOverview();
    }
    else if (e.keyCode === 66) {
      // blur
      sk.switchBlur();
    }
  }
});

// Make `sk` global
window.sk = sk;
