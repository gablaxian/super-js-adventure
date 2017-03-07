
'use strict';

// getting the first of selected nodes (returns Element)
function _(elm) { return document.querySelector(elm); }

// getting all selected nodes (returns NodeList)
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
