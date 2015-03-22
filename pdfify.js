var Session = function(page, callbacks) {
    this.callbacks = callbacks;
    this.i = 0;
    this.next = function() {
	var func = this.callbacks.shift();
	if (func !== undefined) {
	    func(page, this.i);
            this.i += 1;
	} else {
	    page.onCallback = function() {};
	}
    };

    page.onInitialized = function() {
        page.evaluate(function() {
            document.addEventListener('DOMContentLoaded', function() {
                window.callPhantom('DOMContentLoaded');
            }, false);
        });
    };

    var self = this;
    page.onCallback = function(data) {
        if (data === 'DOMContentLoaded') {
            self.next();
        }
    }
};

/**
 * formatNumber(number, width) returns a string of length width representing the number.
 *
 * console.log(formatNumber(-1));       => -1
 * console.log(formatNumber(-123));     => -123
 * console.log(formatNumber(-1, 5));    => -0001
 * console.log(formatNumber(-123, 5));  => -0123
 * console.log(formatNumber(+1));       => 1
 * console.log(formatNumber(+123));     => 123
 * console.log(formatNumber(+1, 5));    => 00001
 * console.log(formatNumber(+123, 5));  => 00123
 */
function formatNumber(n, width) {
    width = width === undefined ? -1 : width;
    if (n >= 0) {
        var str = '' + n;
        while (str.length < width) {
            str = '0' + str;
        }
        return str;
    }
    else {
        var str = '' + Math.abs(n);
        while (str.length < width - 1) {
            str = '0' + str;
        }
        return '-' + str;
    }
}

var system = require('system');
var process = require('child_process');
var webPage = require('webpage');

var args = system.args.slice(1);
var page = webPage.create();

new Session(page, [
    function(page, _) {
        page.open(args[0]);
    },
    function(page, _) {
        var renderedFiles = [];
        var slideId = page.evaluate(function() { return SlideKit.gotoSlide(0); });
        while (slideId !== false) {
            console.log('Found #slide-' + slideId);

            var filename = 'slide-' + formatNumber(slideId, 2) + '.pdf';
            page.render(filename);
            renderedFiles.push(filename);

            slideId = page.evaluate(function() { return SlideKit.nextSlide(); });
        }

        process.execFile('pdfjoin', renderedFiles.concat('-o', 'slides.pdf'), null, function(error, stdout, stderr) {
            console.log(stderr);
            phantom.exit();
        });
    }
]).next();
