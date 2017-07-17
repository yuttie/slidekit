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
  private layer: SVGElement;
  private currentIndex: number | string;
  private overviewReturnIndex: number | string | null;
  private syncWindows: Window[];

  constructor(private svg: SVGSVGElement) {
    this.layer = this.svg.querySelector("#slides-layer") as SVGElement;

    const overview = this.svg.querySelector("#slide-overview") as SVGElement;
    overview.classList.add("hidden");

    const svgTitle = this.svg.querySelector("svg > title") as SVGTitleElement;
    document.title = svgTitle.textContent as string;
    (svgTitle.parentNode as SVGElement).removeChild(svgTitle);
    this.currentIndex = 0;
    this.overviewReturnIndex = null;
    this.syncWindows = [];

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
    window.addEventListener("popstate", function(e) {
      if (e.state !== null) {
        self.showSlide(e.state);
      }
    });

    for (const slide of this.svg.querySelectorAll('[id^="slide-"]')) {
      const slideIndex = slide.id.slice("slide-".length);
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
      this.currentIndex = i;

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

      return i;
    }
    else {
      return false;
    }
  }

  gotoSlide(i: number | string) {
    const res = this.showSlide(i);
    if (res !== false) {
      const i = res;
      if (history.state === null) {
        window.history.replaceState(i, "", "#" + i);
      }
      else {
        window.history.pushState(i, "", "#" + i);
      }
    }

    for (const win of this.syncWindows) {
      (win as any).sk.gotoSlide(i);
    }

    return res;
  }

  nextSlide() {
    if (typeof this.currentIndex === "number") {
      return this.gotoSlide(this.currentIndex + 1);
    }
    else {
      return false;
    }
  }

  prevSlide() {
    if (typeof this.currentIndex === "number") {
      return this.gotoSlide(this.currentIndex - 1);
    }
    else {
      return false;
    }
  }

  switchOverview() {
    if (this.overviewReturnIndex === null) {
      this.overviewReturnIndex = this.currentIndex;
      this.currentIndex = "overview";
      this.gotoSlide(this.currentIndex);
    }
    else {
      this.currentIndex = this.overviewReturnIndex;
      this.overviewReturnIndex = null;
      this.gotoSlide(this.currentIndex);
    }
  }

  switchBlur() {
    this.svg.classList.toggle("blurred");
  }

  switchPresenterMode() {
    document.body.classList.toggle("presenter-mode");
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

  registerSyncWindow(win: Window) {
    this.syncWindows.push(win);
  }
}
