import * as anime from 'animejs';

export default function slidekit(svg: SVGSVGElement) {
  'use strict';

  const layer = svg.querySelector('#slides-layer') as SVGElement;

  const overview = svg.querySelector('#slide-overview') as SVGElement;
  overview.classList.add('hidden');

  const svgTitle = svg.querySelector('svg > title') as SVGTitleElement;
  document.title = svgTitle.textContent as string;
  (svgTitle.parentNode as SVGElement).removeChild(svgTitle);
  let currentIndex: number | string = 0;
  let overviewReturnIndex: number | string | null = null;
  let blur = { value: '0px', direction: 0 };
  const syncWindows: Window[] = [];

  // Workaround for Firefox
  for (let path of svg.querySelectorAll('path')) {
    if (path.style.strokeMiterlimit && parseFloat(path.style.strokeMiterlimit) > 100) {
      path.style.strokeMiterlimit = '100';
    }
  }
  for (let tspan of svg.querySelectorAll('tspan')) {
    if (tspan.textContent === '') {
      (tspan.parentNode as SVGElement).removeChild(tspan);
    }
  }
  for (let text of svg.querySelectorAll('text')) {
    if (text.textContent === '') {
      (text.parentNode as SVGElement).removeChild(text);
    }
  }

  const module = {
    showSlide: function(i: number | string) {
      const s = svg.querySelector('#slide-' + i);
      if (s) {
        currentIndex = i;

        // Save the current viewBox
        const viewBox = svg.getAttribute('viewBox');

        // Reset the user coordinate system
        svg.removeAttribute('viewBox');
        layer.classList.add('untransformed');

        // Workaround for Firefox
        for (let symbol of svg.querySelectorAll('symbol')) {
          symbol.classList.add('unstaged');
        }

        // Get the bounding box of the slide
        const bb = s.getBoundingClientRect();

        // Workaround for Firefox
        for (let symbol of svg.querySelectorAll('symbol')) {
          symbol.classList.remove('unstaged');
        }

        // Restore the viewBox
        svg.setAttribute('viewBox', viewBox as string);
        layer.classList.remove('untransformed');

        // Move the entire layer
        anime({
          targets: svg,
          viewBox: `0 0 ${bb.width} ${bb.height}`,
          easing: 'easeOutQuad',
          duration: 500
        });
        anime({
          targets: layer,
          translateX: -bb.left,
          translateY: -bb.top,
          easing: 'easeOutQuad',
          duration: 500
        });

        return i;
      }
      else {
        return false;
      }
    },
    gotoSlide: function(i: number | string) {
      const res = module.showSlide(i);
      if (res !== false) {
        const i = res;
        if (history.state === null) {
          window.history.replaceState(i, '', '#' + i);
        }
        else {
          window.history.pushState(i, '', '#' + i);
        }
      }

      for (let win of syncWindows) {
        (win as any).sk.gotoSlide(i);
      }

      return res;
    },
    nextSlide: function() {
      if (typeof currentIndex === 'number') {
        return module.gotoSlide(currentIndex + 1);
      }
      else {
        return false;
      }
    },
    prevSlide: function() {
      if (typeof currentIndex === 'number') {
        return module.gotoSlide(currentIndex - 1);
      }
      else {
        return false;
      }
    },
    switchOverview: function() {
      if (overviewReturnIndex === null) {
        overviewReturnIndex = currentIndex;
        currentIndex = 'overview';
        module.gotoSlide(currentIndex);
      }
      else {
        currentIndex = overviewReturnIndex;
        overviewReturnIndex = null;
        module.gotoSlide(currentIndex);
      }
    },
    switchBlur: function() {
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
    },
    switchPresenterMode: function() {
      document.body.classList.toggle('presenter-mode');
    },
    query: function(query: string) {
      const qs = query.toLowerCase().split(/\s+/);
      for (let elem of svg.querySelectorAll('text')) {
        if (qs.every(q => (elem.textContent as string).toLowerCase().indexOf(q) === -1)) {
          elem.classList.add('not-match');
        }
        else {
          elem.classList.remove('not-match');
        }
      }
    },
    registerSyncWindow: function(win: Window) {
      syncWindows.push(win);
    }
  };

  window.addEventListener('popstate', function(e) {
    if (e.state !== null) {
      module.showSlide(e.state);
    }
  });

  for (let slide of svg.querySelectorAll('[id^="slide-"]')) {
    let s = slide;
    slide.addEventListener('click', e => {
      if (overviewReturnIndex !== null) {
        overviewReturnIndex = s.id.slice('slide-'.length);
        module.switchOverview();
      }
    });
  }

  return module;
}
