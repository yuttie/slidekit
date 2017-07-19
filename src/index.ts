"use strict";
import "./style.scss";
import SlideKit from "./slidekit";
const slidesSvg = require("./slides.svg");
const speech = require("./speech.md");

class Shell {
  private sk: SlideKit;
  constructor(slidesSvg: string, speech: string) {
    // Put the slides SVG inline
    const svg = document.createRange().createContextualFragment(slidesSvg).firstChild as SVGSVGElement;
    document.body.appendChild(svg);

    const svgTitle = svg.querySelector("svg > title") as SVGTitleElement;
    document.title = svgTitle.textContent as string;
    (svgTitle.parentNode as SVGElement).removeChild(svgTitle);

    const presenterPane = document.querySelector("#presenter-pane") as Element;
    presenterPane.innerHTML = speech;

    const syncWindows: Window[] = [];

    this.sk = new SlideKit(document.querySelector("#slides") as SVGSVGElement);
    this.sk.onSlideChange((slideId: number | string) => {
      for (const win of syncWindows) {
        (win as any).shell.sk.gotoSlide(slideId);
      }
    });

    const qbox = document.querySelector("#querybox") as HTMLInputElement;
    qbox.addEventListener("keydown", function(e: KeyboardEvent) {
      if (e.key === "Escape") {
        const qbox = e.target as HTMLInputElement;
        qbox.value = "";
        qbox.blur();
        this.sk.query(qbox.value);
      }
    });

    qbox.addEventListener("input", function(e: Event) {
      const qbox = e.target as HTMLInputElement;
      this.sk.query(qbox.value);
    });

    // Key bindings
    document.addEventListener("keydown", function(e: KeyboardEvent) {
      if ((e.target as Element).tagName === "BODY") {
        if (e.key === " " || e.key === "ArrowRight" || e.key === "PageDown") {
          // next
          this.sk.nextSlide();
          e.preventDefault();
        }
        else if (e.key === "Backspace" || e.key === "ArrowLeft" || e.key === "PageUp") {
          // previous
          this.sk.prevSlide();
          e.preventDefault();
        }
        else if (e.key === "Escape") {
          // overview
          this.sk.switchOverview();
          e.preventDefault();
        }
        else if (e.key === "b") {
          // blur
          svg.classList.toggle("blurred");
          e.preventDefault();
        }
        else if (e.key === "p") {
          // blur
          document.body.classList.toggle("presenter-mode");
          e.preventDefault();
        }
        else if (e.key === "c") {
          // clone
          const win = window.open(window.location.hash);
          if (win) {
            syncWindows.push(win);
            e.preventDefault();
          }
        }
        else if (e.key === "/") {
          // search
          const qbox = document.querySelector("#querybox") as HTMLInputElement;
          qbox.focus();
          e.preventDefault();
        }
      }
    });

    document.addEventListener("wheel", function(e) {
      if (e.deltaY > 0) {
        // next
        this.sk.nextSlide();
        e.preventDefault();
      }
      else if (e.deltaY < 0) {
        // previous
        this.sk.prevSlide();
        e.preventDefault();
      }
    });

    // History management
    this.sk.onSlideChange((slideId: number | string) => {
      if (window.history.state === null) {
        window.history.replaceState(slideId, "", "#" + slideId);
      }
      else {
        window.history.pushState(slideId, "", "#" + slideId);
      }
    });
    window.addEventListener("popstate", function(e) {
      if (e.state !== null) {
        this.sk.showSlide(e.state);
      }
    });

    {
      const i = parseInt(location.hash.slice(1), 10);
      if (!Number.isNaN(i)) {
        const res = this.sk.gotoSlide(i);
        if (res === false) {
          this.sk.gotoSlide(0);
        }
      }
      else {
        // Move to the first slide
        this.sk.gotoSlide(0);
      }
    }
  }

  showSlide(i: number | string) {
    const res = this.sk.showSlide(i);

    if (res !== false) {
      const i = res;
      if (window.history.state === null) {
        window.history.replaceState(i, "", "#" + i);
      }
      else {
        window.history.pushState(i, "", "#" + i);
      }
    }

    return res;
  }

  prevSlide() {
    const res = this.sk.prevSlide();

    if (res !== false) {
      const i = res;
      if (window.history.state === null) {
        window.history.replaceState(i, "", "#" + i);
      }
      else {
        window.history.pushState(i, "", "#" + i);
      }
    }

    return res;
  }

  nextSlide() {
    const res = this.sk.nextSlide();

    if (res !== false) {
      const i = res;
      if (window.history.state === null) {
        window.history.replaceState(i, "", "#" + i);
      }
      else {
        window.history.pushState(i, "", "#" + i);
      }
    }

    return res;
  }
}

// Make `sk` global
(window as any).shell = new Shell(slidesSvg, speech);
