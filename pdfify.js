const process = require('process');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const phantom = require('phantom');


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


const fp = process.argv[2];
(async function() {
    const instance = await phantom.create([], { logLevel: 'error' });
    const page = await instance.createPage();
    await page.open(fp);

    if (!await page.evaluate(function() { return sk; })) {
        console.log("The global variable `sk' is not available!");
    }
    else {
        const renderedFiles = [];
        let slideId = await page.evaluate(function() { return sk.gotoSlide(0); });
        while (slideId !== false) {
            console.log('Found #slide-' + slideId);

            const filename = 'slide-' + formatNumber(slideId, 2) + '.pdf';
            await page.render(filename);
            renderedFiles.push(filename);

            slideId = await page.evaluate(function() { return sk.nextSlide(); });
        }

        try {
            await execFile('pdfjoin', renderedFiles.concat('-o', 'slides.pdf'));
        }
        catch (e) {
            console.log('Error: pdfjoin failed!');
        }
    }

    await instance.exit();
}());
