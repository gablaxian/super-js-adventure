
'use strict';

// getting the first of selected node
function _(elm) { return document.querySelector(elm); }

// getting all selected nodes
function __(elm) { return document.querySelectorAll(elm) }


let Easing = {
    linear(time, begin, change, duration) {
        return change*(time/=duration) + begin;
    },
    easeInQuad(time, begin, change, duration) {
        return change*(time/=duration)*time + begin;
    },
    easeOutQuad(time, begin, change, duration) {
        return -change *(time/=duration)*(time-2) + begin;
    },
    easeInOutQuad(time, begin, change, duration) {
        if( (time /= duration/2) < 1 ) {
            return change/2*time*time + begin;
        }
        return -change/2 * ( (--time)*(time-2) - 1 ) + begin;
    }
}



/*****************
    Prettify()

    Pretties up a JSON string to be more readable (but does not go overboard like the 3rd parameter of JSON.stringify)
 ****************/
function prettify(str) {
    let tmpStr  = str;
    let str1    = '';
    let str2    = '';
    let level   = 0;
    let i       = 0;

    while(tmpStr[i]) {
        if(tmpStr[i] == '{') {
            level++;
            str1 = tmpStr.slice(0,i);
            str2 = tmpStr.slice(i+1, tmpStr.length);

            var spaces = '  '.repeat(level);

            tmpStr = str1 + '{\n' + spaces + str2;
        }
        if(tmpStr[i] == '}') {
            level--;
            str1 = tmpStr.slice(0,i);
            str2 = tmpStr.slice(i+1, tmpStr.length);

            var spaces = '  '.repeat(level);

            tmpStr = str1 + '\n' + spaces + '}' + str2;
            i = i + spaces.length + 1;
        }
        if(tmpStr[i] == ',' && tmpStr[i+1] == '"') {
            str1 = tmpStr.slice(0,i);
            str2 = tmpStr.slice(i+1, tmpStr.length);

            var spaces = '  '.repeat(level);

            tmpStr = str1 + ',\n' + spaces + str2;
        }

        i++;
    }

    return tmpStr;
}



// Old way of image scaling.
// Takes an image, creates a new canvas at X factor larger image than original, then redraws the image to the new canvas at the new size. Returns the new, larger image as an image object (?)
function scaleImage(img, factor) {
    var srcCanvas       = document.createElement('canvas');
    var dstCanvas       = document.createElement('canvas');
    var srcCtx          = srcCanvas.getContext('2d');
    var dstCtx          = dstCanvas.getContext('2d');

    // set up source
    srcCanvas.width     = img.width;
    srcCanvas.height    = img.height;
    srcCtx.clearRect(0, 0, img.width, img.height);
    srcCtx.drawImage(img, 0, 0);

    var srcData = srcCtx.getImageData(0, 0, img.width, img.height).data;

    var sw = factor * img.width;
    var sh = factor * img.height;

    // set up destination
    dstCanvas.width     = sw;
    dstCanvas.height    = sh;
    dstCtx.clearRect(0, 0, sw, sh);

    var dstImgData  = dstCtx.getImageData(0,0,sw,sh);
    var dstData     = dstImgData.data;

    // factor
    var srcP = 0;
    var dstP = 0;

    for (var y = 0; y < img.height; ++y) {
        for (var i = 0; i < factor; ++i) {
            for (var x = 0; x < img.width; ++x) {

                srcP = 4 * (y * img.width + x);

                for (var j = 0; j < factor; ++j) {
                    var tmp = srcP;
                    dstData[dstP++] = srcData[tmp++];
                    dstData[dstP++] = srcData[tmp++];
                    dstData[dstP++] = srcData[tmp++];
                    dstData[dstP++] = srcData[tmp++];
                }
            }
        }
    }

    dstCtx.putImageData(dstImgData, 0, 0);

    return dstCanvas.toDataURL();
}
