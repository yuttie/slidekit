# slidekit

## Usage

```sh
npm install
npm start
```

For a huge SVG file, you might have to give more memory to Node.js:

```sh
export NODE_OPTIONS="--max-old-space-size=8192"
```

In this case, we will give 8 GiB of memory to Node.js.


## Specification of SVG

To use an SVG as slides, you have to:
* have the top level <svg> element with id value of "slides"
* have <title> element as a child of <svg>
* put slides and frames under <g> whose id is "slides-layer"
* have a frame element named "frame-overview"
* have at least one slide whose id starts with "slide-"
