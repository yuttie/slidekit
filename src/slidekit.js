import anime from 'animejs';

export default function slidekit(svg) {
  'use strict';

  const layer = svg.querySelector('#slides-layer');

  const overview = svg.querySelector('#slide-overview');
  overview.style.visibility = 'hidden';

  const svgTitle = svg.querySelector('title');
  document.title = svgTitle.textContent;
  svgTitle.parentNode.removeChild(svgTitle);
  let currentIndex = 0;
  let overviewReturnIndex = null;
  let blur = { value: '0px', direction: 0 };

  const module = {};
  module.showSlide = function(i) {
    const s = svg.querySelector('#slide-' + i);
    if (s) {
      currentIndex = i;

      // Save the current viewBox
      const viewBox = svg.getAttribute('viewBox');
      const transform = layer.style.getPropertyValue('transform');

      // Reset the user coordinate system
      svg.removeAttribute('viewBox');
      layer.style.removeProperty('transform');

      // Get the bounding box of the slide
      const bb = s.getBoundingClientRect();

      // Restore the viewBox
      svg.setAttribute('viewBox', viewBox);
      layer.style.setProperty('transform', transform);

      // Move the entire layer
      anime({
        targets: svg,
        viewBox: `0 0 ${bb.width} ${bb.height}`,
        easing: 'easeOutExpo',
        duration: 500
      });
      anime({
        targets: layer,
        translateX: -bb.left,
        translateY: -bb.top,
        easing: 'easeOutExpo',
        duration: 500
      });

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
  module.switchOverview = function() {
    if (overviewReturnIndex === null) {
      overviewReturnIndex = currentIndex;
      currentIndex = 'overview';
      sk.gotoSlide(currentIndex);
    }
    else {
      currentIndex = overviewReturnIndex;
      overviewReturnIndex = null;
      sk.gotoSlide(currentIndex);
    }
  };
  module.switchBlur = function() {
    anime.remove(blur);
    if (blur.value !== '0px' && blur.direction !== -1) {
      blur.direction = -1;
      anime({
        targets: blur,
        value: '0px',
        easing: 'linear',
        duration: 100,
        update: function() {
          svg.style.filter = `blur(${blur.value})`
        }
      });
    }
    else {
      blur.direction = +1;
      anime({
        targets: blur,
        value: '10px',
        easing: 'linear',
        duration: 100,
        update: function() {
          svg.style.filter = `blur(${blur.value})`
        }
      });
    }
  };

  window.addEventListener('popstate', function(e) {
    if (e.state !== null) {
      module.showSlide(e.state);
    }
  });

  return module;
}
