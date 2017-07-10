'use strict';
import './style.scss';
import SlideKit from './slidekit';
const slidesSvg = require('./slides.svg');
const speech = require('./speech.md');

// Put the slides SVG inline
let svg = document.createRange().createContextualFragment(slidesSvg).firstChild as SVGSVGElement;
document.body.appendChild(svg);

const presenterPane = document.querySelector('#presenter-pane') as Element;
presenterPane.innerHTML = speech;

var sk = new SlideKit(document.querySelector('#slides') as SVGSVGElement);

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

const qbox = document.querySelector('#querybox') as HTMLInputElement;
qbox.addEventListener('keydown', function(e: KeyboardEvent) {
  if (e.keyCode === 27) {
    const qbox = e.target as HTMLInputElement;
    qbox.value = '';
    qbox.blur();
    sk.query(qbox.value);
  }
});

qbox.addEventListener('input', function(e: Event) {
  const qbox = e.target as HTMLInputElement;
  sk.query(qbox.value);
});

// Key bindings
document.addEventListener('keydown', function(e: KeyboardEvent) {
  if ((e.target as Element).tagName === 'BODY') {
    if (e.keyCode === 32 || e.keyCode === 39 || e.keyCode === 34) {
      // next
      sk.nextSlide();
      e.preventDefault();
    }
    else if (e.keyCode === 8 || e.keyCode === 37 || e.keyCode === 33) {
      // previous
      sk.prevSlide();
      e.preventDefault();
    }
    else if (e.keyCode === 27) {
      // overview
      sk.switchOverview();
      e.preventDefault();
    }
    else if (e.keyCode === 66) {
      // blur
      sk.switchBlur();
      e.preventDefault();
    }
    else if (e.keyCode === 80) {
      // blur
      sk.switchPresenterMode();
      e.preventDefault();
    }
    else if (e.keyCode === 67) {
      // clone
      const win = window.open(window.location.hash);
      sk.registerSyncWindow(win);
      e.preventDefault();
    }
    else if (e.keyCode === 191) {
      // search
      const qbox = document.querySelector('#querybox') as HTMLInputElement;
      qbox.focus();
      e.preventDefault();
    }
  }
});

document.addEventListener('wheel', function(e) {
  if (e.deltaY > 0) {
      // next
      sk.nextSlide();
      e.preventDefault();
  }
  else if (e.deltaY < 0) {
      // previous
      sk.prevSlide();
      e.preventDefault();
  }
});

// Make `sk` global
(window as any).sk = sk;
