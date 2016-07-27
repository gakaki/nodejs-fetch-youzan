"use strict";


let YouzanFetch           = require('./DomOperate')
let sleep                 = require('sleep');

let fs                    = require('fs')
let $                     = require('cheerio');

let h                     = fs.readFileSync('cheeio_test.html', 'utf-8');
h                         = $.load(h);
let data                  = h.html();



var webdriverio = require('webdriverio');
var options = {
    desiredCapabilities: {
        browserName: 'chrome',
        debug:false
    }
};



var url = "https://koudaitong.com/v2/showcase/goods?"
let wi  = webdriverio.remote(options)
    .init()
    .url(url)


wi.getTitle().then(function(title) {
        console.log('Title was: ' + title);
    })
    .setValue("[name=account]","13621822254")
    .setValue("[name=password]","z5896321")
    .waitForExist('.js-list-body-region',100000)
    .getTitle().then(function(title) {
        console.log('Title was: ' + title);
    }).getHTML('.js-list-body-region').then(function(html) {
        let w = new Worker(wi);
        w.exec();
    });

let async_youzan_row = async function( num_iid ){

		// 引入有赞SDK
		let SDK 		= require('youzan-sdk');
		// 初始化SDK，在 https://koudaitong.com/v2/apps/open/setting 开启API接口，复制相应 AppID、AppSecert

		let AppID 		= "0eb3d2acf73c033353"
		let AppSecert 	= "e4dbae40b7a367c1efb7eea48c00fa75"
		let sdk_obj 	= SDK({key: AppID, secret: AppSecert})
		let data 		= await sdk_obj.get('kdt.item.get', {
		    num_iid: num_iid,
		    fields: ""
		});

		let youzan_row  = data.response.item;
		console.log(youzan_row);
		return youzan_row;
}



class Worker{
    constructor(wi){
        this.rows_total = [];
        this.wi         = wi;
        this.timeout    = 600;

    }
    to_db(){

        var r = require('rethinkdb');

        var connection = null;
        r.connect( {host: 'wowdsgn.com', port: 28015}, (err, conn) => {
			
            if (err) throw err;
            connection = conn;
			
			let dbName 		= 'youzan'
			let tableName 	= "product"
			let db 			= r.db(dbName)
			let table		= db.table(tableName)
			
			
            table.delete().run(connection, (err, result) => {
                if (err) throw err;
	            table.insert(this.rows_total).run(connection, (err, result) => {
	                if (err) throw err;
	                console.log(JSON.stringify(result, null, 2));
	            })
            })
           
//
        })
    }
    async exec(){
		
        let selector_page_next 	  = '.fetch_page.next';
		let html 			   	  = await this.wi.pause(this.timeout).getHTML('.js-list-body-region')
		
    
        let c                     = new YouzanFetch($)
        let data                  = html[0];
        let res                   = c.get_page_rows(data);
        console.log("rows",html,res)
		for(let r of res){
			let product_id		  = r['id'];
			console.log( "r id" , product_id )
			let youzan_row_data   = await async_youzan_row( product_id );
			console.log( "r youzan data is " , youzan_row_data )
			r  = Object.assign(r,youzan_row_data);
		}

        this.rows_total.push(res)
        this.wi.pause(this.timeout).click(selector_page_next)

        this.wi.isExisting(selector_page_next).then((isExisting) =>{
            console.log(isExisting);
            if(isExisting){
                this.exec();
            }else{
                this.rows_total = [].concat(...this.rows_total);
                console.log(this.rows_total);

                this.wi.end();
                this.to_db();

            }
        })

    }
}
