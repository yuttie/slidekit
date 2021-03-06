"use strict";
import "./style.scss";
import SlideKit from "./slidekit";
const slidesSvg = require("./slides.svg");
const speech = require("./speech.md");

class Shell {
  private sk: SlideKit;
  private syncWindows: Window[];
  private isPoppingState: boolean = false;

  constructor(slidesSvg: string, speech: string) {
    // Put the slides SVG inline
    const svg = document.createRange().createContextualFragment(slidesSvg).firstChild as SVGSVGElement;
    document.body.appendChild(svg);

    // Remove Inkscape's sodipodi:namedview node
    const sodipodiNode = svg.querySelector("sodipodi\\:namedview");
    if (sodipodiNode) {
      const parentNode = sodipodiNode.parentNode as Node;
      while (sodipodiNode.firstChild) {
        const child = sodipodiNode.firstChild;
        parentNode.insertBefore(child, sodipodiNode);
      }
      sodipodiNode.remove();
    }

    const svgTitle = svg.querySelector("svg > title") as SVGTitleElement;
    document.title = svgTitle.textContent as string;
    (svgTitle.parentNode as SVGElement).removeChild(svgTitle);

    const presenterPane = document.querySelector("#presenter-pane") as Element;
    presenterPane.innerHTML = speech;

    this.syncWindows = [];

    this.sk = new SlideKit(document.querySelector("#slides") as SVGSVGElement);
    this.sk.onSlideChange((slideId: number | string) => {
      if (this.isPoppingState) {
        // Don't need to change the history state because the slide was switched by history manipulation
        this.isPoppingState = false;
      }
      else {
        if (window.history.state === null) {
          window.history.replaceState(slideId, "", "#" + slideId);
        }
        else {
          window.history.pushState(slideId, "", "#" + slideId);
        }
      }
      for (const win of this.syncWindows) {
        (win as any).shell.showSlide(slideId);
      }
    });

    const qbox = document.querySelector("#querybox") as HTMLInputElement;
    qbox.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const qbox = e.target as HTMLInputElement;
        qbox.value = "";
        qbox.blur();
        this.sk.query(qbox.value);
      }
    });

    qbox.addEventListener("input", (e: Event) => {
      const qbox = e.target as HTMLInputElement;
      this.sk.query(qbox.value);
    });

    qbox.addEventListener("blur", (e: Event) => {
      const qbox = e.target as HTMLInputElement;
      qbox.value = "";
      this.sk.query("");
    });

    // Key bindings
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if ((e.target as Element).tagName === "BODY") {
        if (e.key === " " || e.key === "ArrowRight" || e.key === "PageDown") {
          // next
          this.nextSlide();
          e.preventDefault();
        }
        else if (e.key === "Backspace" || e.key === "ArrowLeft" || e.key === "PageUp") {
          // previous
          this.prevSlide();
          e.preventDefault();
        }
        else if (e.key === "Escape" || e.key === "o") {
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
            this.syncWindows.push(win);
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

    document.addEventListener("wheel", (e) => {
      if (e.deltaY > 0) {
        // next
        this.nextSlide();
        e.preventDefault();
      }
      else if (e.deltaY < 0) {
        // previous
        this.prevSlide();
        e.preventDefault();
      }
    });

    // History management
    window.addEventListener("popstate", (e) => {
      if (e.state !== null) {
        this.sk.replaceSlide(e.state);
        this.sk.showCurrentSlide();
        this.isPoppingState = true;
      }
    });

    // Parse the hash
    {
      const i = parseInt(location.hash.slice(1), 10);
      if (!Number.isNaN(i)) {
        const res = this.showSlide(i);
        if (res === false) {
          this.showSlide(0);
        }
      }
      else {
        // Move to the first slide
        this.showSlide(0);
      }
    }
  }

  showSlide(i: number | string): number | string | false {
    const result = this.sk.replaceSlide(i);

    if (result !== false) {
      this.sk.showCurrentSlide();
    }

    return result;
  }

  prevSlide(): number | string | false {
    const res = this.sk.prevSlide();

    return res;
  }

  nextSlide(): number | string | false {
    const res = this.sk.nextSlide();

    return res;
  }
}

// Make `shell` global
(window as any).shell = new Shell(slidesSvg, speech);
