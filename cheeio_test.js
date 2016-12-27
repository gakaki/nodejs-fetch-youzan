"use strict";

let YouzanFetch = require('./worker/DomOperate')

let fs                    = require('fs')
let $                     = require('cheerio');

let h                     = fs.readFileSync('cheeio_test.html', 'utf-8');
 h                        = $.load(h);
let data                  = h.html();


let c                     = new YouzanFetch($)
let res                   = c.get_page_rows(data);

console.log(res);




















