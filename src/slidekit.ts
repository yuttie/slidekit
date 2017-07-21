"use strict";
import * as anime from "animejs";

// Workaround for Chrome
// With Chrome browser, Anime.js doesn't seem to begin animation correctly if
// an initial value of translate{X,Y} is less than 1e-4.
function fixSmallNumber(x: number) {
  if (Math.abs(x) < 1e-4) {
    return 0;
  }
  else {
    return x;
  }
}

export default class SlideKit {
  private svg: SVGSVGElement;
  private layer: SVGElement;
  private stack: (number | string)[];
  private overviewReturnIndex: number | string | null;
  private slideChangeCallbacks: ((slideIndex: number | string) => void)[];

  constructor(svg: SVGSVGElement) {
    this.svg = svg;
    this.layer = this.svg.querySelector("#slides-layer") as SVGElement;

    const overview = this.svg.querySelector("#slide-overview") as SVGElement;
    overview.classList.add("hidden");

    this.stack = [0];
    this.overviewReturnIndex = null;
    this.slideChangeCallbacks = [];

    // Workaround for Firefox
    for (const path of this.svg.querySelectorAll("path")) {
      if (path.style.strokeMiterlimit && parseFloat(path.style.strokeMiterlimit) > 100) {
        path.style.strokeMiterlimit = "100";
      }
    }
    for (const tspan of this.svg.querySelectorAll("tspan")) {
      if (tspan.textContent === "") {
        (tspan.parentNode as SVGElement).removeChild(tspan);
      }
    }
    for (const text of this.svg.querySelectorAll("text")) {
      if (text.textContent === "") {
        (text.parentNode as SVGElement).removeChild(text);
      }
    }

    const self = this;
    for (const slide of this.svg.querySelectorAll('[id^="slide-"]')) {
      const slideIndex: number | string = (() => {
        const slideIndexStr = slide.id.slice("slide-".length);
        if (/^\d+$/.test(slideIndexStr)) {
          return parseInt(slideIndexStr);
        }
        else {
          return slideIndexStr;
        }
      })();
      slide.addEventListener("click", e => {
        if (self.overviewReturnIndex !== null) {
          self.overviewReturnIndex = slideIndex;
          self.switchOverview();
        }
      });
    }
  }

  showSlide(i: number | string) {
    const s = this.svg.querySelector("#slide-" + i);
    if (s) {
      this.stack[this.stack.length - 1] = i;

      // Save the current viewBox
      const viewBox = this.svg.getAttribute("viewBox");

      // Reset the user coordinate system
      this.svg.removeAttribute("viewBox");
      this.layer.classList.add("untransformed");

      // Workaround for Firefox
      for (const symbol of this.svg.querySelectorAll("symbol")) {
        symbol.classList.add("unstaged");
      }

      // Get the bounding box of the slide
      const bb = s.getBoundingClientRect();

      // Workaround for Firefox
      for (const symbol of this.svg.querySelectorAll("symbol")) {
        symbol.classList.remove("unstaged");
      }

      // Restore the viewBox
      this.svg.setAttribute("viewBox", viewBox as string);
      this.layer.classList.remove("untransformed");

      // Move the entire layer
      anime({
        targets: this.svg,
        viewBox: `0 0 ${bb.width} ${bb.height}`,
        easing: "easeOutSine",
        duration: 500
      });
      anime({
        targets: this.layer,
        translateX: -fixSmallNumber(bb.left),
        translateY: -fixSmallNumber(bb.top),
        easing: "easeOutSine",
        duration: 500
      });

      for (const callback of this.slideChangeCallbacks) {
        callback(i);
      }

      return i;
    }
    else {
      return false;
    }
  }

  nextSlide() {
    const current = this.stack[this.stack.length - 1];
    if (typeof current === "number") {
      return this.showSlide(current + 1);
    }
    else {
      return false;
    }
  }

  prevSlide() {
    const current = this.stack[this.stack.length - 1];
    if (typeof current === "number") {
      return this.showSlide(current - 1);
    }
    else {
      return false;
    }
  }

  currentSlide(): number | string {
    return this.stack[this.stack.length - 1];
  }

  pushSlide(i: number | string): void {
    this.stack.push(i);
    this.showSlide(this.currentSlide());
  }

  popSlide(): number | string | null {
    if (this.stack.length > 1) {
      const popped = this.stack.pop() as number | string;
      this.showSlide(this.currentSlide());

      return popped;
    }
    else {
      // Cannot pop the last element
      return null;
    }
  }

  replaceSlide(i: number | string): number | string | null {
    const old = this.currentSlide();
    this.stack[this.stack.length - 1] = i;
    this.showSlide(this.currentSlide());

    return old;
  }

  switchOverview() {
    if (this.overviewReturnIndex === null) {
      this.overviewReturnIndex = this.stack[this.stack.length - 1];
      this.stack[this.stack.length - 1] = "overview";
      this.showSlide(this.stack[this.stack.length - 1]);
    }
    else {
      this.stack[this.stack.length - 1] = this.overviewReturnIndex;
      this.overviewReturnIndex = null;
      this.showSlide(this.stack[this.stack.length - 1]);
    }
  }

  query(query: string) {
    const qs = query.toLowerCase().split(/\s+/);
    for (const elem of this.svg.querySelectorAll("text")) {
      if (qs.every(q => (elem.textContent as string).toLowerCase().indexOf(q) === -1)) {
        elem.classList.add("not-match");
      }
      else {
        elem.classList.remove("not-match");
      }
    }
  }

  onSlideChange(callback: (slideIndex: number | string) => void) {
    this.slideChangeCallbacks.push(callback);
  }
}
