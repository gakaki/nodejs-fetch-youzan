"use strict";

let YouzanSDK             = require('../youzan/YouzanSDK')
let YouzanFetch           = require('./orders_row')
let sleep                 = require('sleep')

const youzan = new YouzanSDK();

var webdriverio = require('webdriverio');
var options = {
    desiredCapabilities: {
        browserName: 'safari',
        debug:false
    }
};

var url = "https://koudaitong.com/v2/trade/order#list&p=1&type=all&state=all&orderby=book_time&tuanId=&order=desc&page_size=20&disable_express_type="
let wi  = webdriverio.remote(options)
    .init()
    .url(url)

wi.getTitle().then(function(title) {
    console.log('Title was: ' + title);
}).getHTML('.js-list-body-region').then(function(html) {

    let w = new Worker(wi);
    w.exec();

});


class WorkerProductPage {

    constructor(flag){
        this.wi             = wi
        this.timeout        = 600
        this.rows_total     = []
        this.page_flag      = flag


    }

    async fetch_page_data(){
        let html 			   	  = await this.wi.pause(this.timeout).getHTML('.js-list-body-region')
        let c                     = new YouzanFetch($)
        let res                   = c.get_page_rows(html);

        res.map( (el,i) => {
            el["flag"]            = this.page_flag //判断是售罄还是啥
            return el
        })


        this.rows_total.push(res)
        console.log("rows",html,res)
    }
    async fetch_page(){

        let selector_page_next 	  = '.fetch_page.next'
        let isExisting            = await this.wi.isExisting(selector_page_next)
        console.log(">>>>>>>>>>>>是否存在下一页按钮",isExisting);
        if(isExisting) {
            this.wi.pause(this.timeout).click(selector_page_next)
            await this.fetch_page_data();
            await this.fetch_page()
        }else{
            await this.fetch_page_data();
        }

    }

    async exec(){
        await this.fetch_page();
        this.rows_total = [].concat(...this.rows_total)
        console.log("执行结束  总算到达页面尾部了" )
        console.log(this.rows_total)
        return this.rows_total
    }
}

class Worker{
    constructor(wi){
        this.wi             = wi;
        this.timeout        = 600;
        // this.page_flags     = ["index","soldout","draft"];
        this.page_flags     = ["index","soldout"];
        this.rows_total     = [];
    }

    async fetch_tab_pages(){
        var worker_procut_page      = null
        for ( let flag of this.page_flags ){
            worker_procut_page      = new WorkerProductPage(flag)

            //点击一下标题栏呗
            let tab_selector        = "#js-nav-list-" + flag + " a";
            console.log(">>>>>>>点击了",tab_selector)

            await this.wi.click(tab_selector)
            await this.wi.pause(1000);

            let  produc_page_data   = await worker_procut_page.exec()
            this.rows_total.push(produc_page_data)
            console.log(this.rows_total)
        }
    }
    async exec(){

        await this.fetch_tab_pages()

        try{
            //只有三个标签都搞定之后才能写入
            this.wi.end();
            await this.combine_with_youzan_api_data();
        }catch(ex){
            console.log(ex.message)
        }
    }

    async combine_with_youzan_api_data(){

        this.rows_total = [].concat(...this.rows_total)

        let m = this
        let count = 0
        for(let r of m.rows_total){
            let product_id		  = r['id'];
            console.log( "r id" , product_id )
            let youzan_row_data   = await youzan.api_product_row( product_id );
            r  = Object.assign(r,youzan_row_data);

            count++;
            r["product_id"] = r['id'];
            r['id']         = count;
            console.log( "r youzan data combine is " , r )

            sleep.usleep(500000)

            console.log("现在的总数为",m.rows_total.length, "当前为 : " , count)
        }

        let data = m.rows_total


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

        return m.rows_total
    }


}
