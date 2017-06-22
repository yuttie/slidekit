export default function slidekit(svg) {
  'use strict';

  document.title = svg.querySelector('title').textContent;
  var currentIndex = 0;

  var module = {};
  module.showSlide = function(i) {
    var s = svg.querySelector('#slide-' + i);
    if (s) {
      currentIndex = i;

      // Reset the user coordinate system
      svg.removeAttribute('viewBox');
      let layer = svg.querySelector('#slides-layer');
      layer.removeAttribute('transform');

      // Get the bounding box of the slide
      var bb = s.getBoundingClientRect();

      // Move the entire layer
      layer.setAttribute('transform', `translate(${-bb.left}, ${-bb.top})`)
      svg.setAttribute('viewBox', `0 0 ${bb.width} ${bb.height}`);

      return i;
    }
    else {
      return false;
    }
  };
  module.gotoSlide = function(i) {
    const res = module.showSlide(i);
    if (res !== false) {
      const i = res;
      if (history.state === null) {
        window.history.replaceState(i, null, '#' + i);
      }
      else {
        window.history.pushState(i, null, '#' + i);
      }
    }
    return res;
  };
  module.nextSlide = function() {
    return module.gotoSlide(currentIndex + 1);
  };
  module.prevSlide = function() {
    return module.gotoSlide(currentIndex - 1);
  };

  window.addEventListener('popstate', function(e) {
    if (e.state !== null) {
      module.showSlide(e.state);
    }
  });

  return module;
}
