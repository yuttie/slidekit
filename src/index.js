'use strict';
import "babel-polyfill";

import './style.scss';
import slidekit from './slidekit';
import slidesSvg from './slides.svg';
import speech from './speech.md';

// Put the slides SVG inline
document.write(slidesSvg);

const presenterPane = document.querySelector('#presenter-pane');
presenterPane.innerHTML = speech;

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

const qbox = document.querySelector('#querybox');
qbox.addEventListener('keydown', function(e) {
  if (e.keyCode === 27) {
    const qbox = e.target;
    qbox.value = '';
    qbox.blur();
    sk.query(qbox.value);
  }
});

qbox.addEventListener('input', function(e) {
  const qbox = e.target;
  sk.query(qbox.value);
});

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
    else if (e.keyCode === 80) {
      // blur
      sk.switchPresenterMode();
    }
    else if (e.keyCode === 191) {
      // search
      const qbox = document.querySelector('#querybox');
      qbox.focus();
      e.preventDefault();
    }
  }
});

// Make `sk` global
window.sk = sk;
