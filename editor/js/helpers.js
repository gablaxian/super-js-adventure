
'use strict';

// getting the first of selected node
function _(elm) { return document.querySelector(elm); }

// getting all selected nodes
function __(elm) { return document.querySelectorAll(elm) }


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
function scaleImage(img) {
    let srcCanvas       = document.createElement('canvas');
    let dstCanvas       = document.createElement('canvas');
    let srcCtx          = srcCanvas.getContext('2d');
    let dstCtx          = dstCanvas.getContext('2d');

    // set up source
    srcCanvas.width     = img.width;
    srcCanvas.height    = img.height;
    srcCtx.clearRect(0, 0, img.width, img.height);
    srcCtx.drawImage(img, 0, 0);

    let srcData = srcCtx.getImageData(0, 0, img.width, img.height).data;

    let sw = factor * img.width;
    let sh = factor * img.height;

    // set up destination
    dstCanvas.width     = sw;
    dstCanvas.height    = sh;
    dstCtx.clearRect(0, 0, sw, sh);

    let dstImgData  = dstCtx.getImageData(0,0,sw,sh);
    let dstData     = dstImgData.data;

    // factor
    let srcP = 0;
    let dstP = 0;

    for (let y = 0; y < img.height; ++y) {
        for (let i = 0; i < factor; ++i) {
            for (let x = 0; x < img.width; ++x) {

                srcP = 4 * (y * img.width + x);

                for (let j = 0; j < factor; ++j) {
                    let tmp = srcP;
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
