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

  doesSlideExist(i: number | string): boolean {
    const s = this.svg.querySelector("#slide-" + i);
    if (s) {
      return true;
    }
    else {
      return false;
    }
  }

  showCurrentSlide(): void {
    const i = this.currentSlide();
    const s = this.svg.querySelector("#slide-" + i) as SVGElement;

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
  }

  nextSlide() {
    const current = this.currentSlide();
    if (typeof current === "number") {
      const ret = this.replaceSlide(current + 1);
      if (ret !== false) {
        this.showCurrentSlide();
      }

      return ret;
    }
    else {
      return false;
    }
  }

  prevSlide() {
    const current = this.currentSlide();
    if (typeof current === "number") {
      const ret = this.replaceSlide(current - 1);
      if (ret !== false) {
        this.showCurrentSlide();
      }

      return ret;
    }
    else {
      return false;
    }
  }

  currentSlide(): number | string {
    return this.stack[this.stack.length - 1];
  }

  pushSlide(i: number | string): boolean {
    if (this.doesSlideExist(i)) {
      this.stack.push(i);

      return true;
    }
    else {
      return false;
    }
  }

  popSlide(): number | string | null {
    if (this.stack.length > 1) {
      const popped = this.stack.pop() as number | string;

      return popped;
    }
    else {
      // Cannot pop the last element
      return null;
    }
  }

  replaceSlide(i: number | string): number | string | false {
    if (this.doesSlideExist(i)) {
      const old = this.currentSlide();
      this.stack[this.stack.length - 1] = i;

      return old;
    }
    else {
      return false;
    }
  }

  switchOverview() {
    if (this.overviewReturnIndex === null) {
      const ret = this.replaceSlide("overview");
      if (ret !== false) {
        this.overviewReturnIndex = ret;
        this.showCurrentSlide();
      }
    }
    else {
      this.replaceSlide(this.overviewReturnIndex);
      this.overviewReturnIndex = null;
      this.showCurrentSlide();
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
