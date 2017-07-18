"use strict";
import "./style.scss";
import SlideKit from "./slidekit";
const slidesSvg = require("./slides.svg");
const speech = require("./speech.md");

// Put the slides SVG inline
const svg = document.createRange().createContextualFragment(slidesSvg).firstChild as SVGSVGElement;
document.body.appendChild(svg);

const presenterPane = document.querySelector("#presenter-pane") as Element;
presenterPane.innerHTML = speech;

const sk = new SlideKit(document.querySelector("#slides") as SVGSVGElement);

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

const qbox = document.querySelector("#querybox") as HTMLInputElement;
qbox.addEventListener("keydown", function(e: KeyboardEvent) {
  if (e.key === "Escape") {
    const qbox = e.target as HTMLInputElement;
    qbox.value = "";
    qbox.blur();
    sk.query(qbox.value);
  }
});

qbox.addEventListener("input", function(e: Event) {
  const qbox = e.target as HTMLInputElement;
  sk.query(qbox.value);
});

// Key bindings
document.addEventListener("keydown", function(e: KeyboardEvent) {
  if ((e.target as Element).tagName === "BODY") {
    if (e.key === " " || e.key === "ArrowRight" || e.key === "PageDown") {
      // next
      sk.nextSlide();
      e.preventDefault();
    }
    else if (e.key === "Backspace" || e.key === "ArrowLeft" || e.key === "PageUp") {
      // previous
      sk.prevSlide();
      e.preventDefault();
    }
    else if (e.key === "Escape") {
      // overview
      sk.switchOverview();
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
        sk.registerSyncWindow(win);
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
