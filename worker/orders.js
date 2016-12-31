"use strict";

let YouzanSDK             = require('../youzan/YouzanSDK')
let OrdersRow             = require('./orders_row')
let sleep                 = require('sleep');
let DB                    = require('./db');
var webdriverio           = require('webdriverio');
var options = {
    desiredCapabilities: {
        browserName: 'safari',
        debug:false
    }
};

// async function test(){
//     let db_test               = new DB()
//     await db_test.conn()
//     await db_test.test()
//     return
// }
// test()

var url = "https://koudaitong.com/v2/trade/order#list&p=1&type=all&state=all&orderby=book_time&tuanId=&order=desc&page_size=20&disable_express_type="
let wi  = webdriverio.remote(options)
    .init()
    .url(url)

wi.getTitle().then(function(title) {
    console.log('Title was: ' + title);
}).pause(1000).getHTML('.ui-pagination-prev').then(function(html) {
    let w = new WorkerOrders(wi);
    w.exec();
});


class WorkerOrderPage {

    constructor(){
        this.wi             = wi
        this.timeout        = 600
        this.rows_total     = []
    }


    async fetch_page_data(){
        let html 			   	  = await this.wi.getHTML('.ui-table-order')
        let c                     = new OrdersRow()
        let res                   = c.get_orders(html);

        this.rows_total.push(res)
        console.log("rows",html,res)
    }
    async fetch_next_page(){

        let selector_page_next 	  = '.ui-pagination-prev:last-child'
        let isExisting            = await this.wi.isExisting(selector_page_next)
        console.log(">>>>>>>>>>>>是否存在下一页按钮",isExisting);
        if(isExisting) {

            this.wi.pause(this.timeout).waitForExist(selector_page_next,5000)
                .click(selector_page_next)
                // .moveToObject(selector_page_next,0,0)
            await this.fetch_page_data();
            await this.fetch_next_page()
        }else{
            await this.fetch_page_data();
        }

    }

    async exec(){
        await this.fetch_next_page();
        this.rows_total = [].concat(...this.rows_total)
        console.log("执行结束  总算到达页面尾部了" )
        console.log(this.rows_total)
        return this.rows_total
    }
}

class WorkerOrders{
    constructor(wi){
        this.wi             = wi;
        this.timeout        = 600;
        this.rows_total     = [];
    }

    async fetch_orders(){
        var worker_procut_page  = new WorkerOrderPage()
        let  produc_page_data   = await worker_procut_page.exec()
        this.rows_total.push(produc_page_data)
        console.log(this.rows_total)
    }
    async exec(){
        try{
            await this.fetch_orders()
            console.log(this.rows_total)
            this.wi.end();
            await this.to_db();
        }catch(ex){
            console.log(ex.message)
        }
    }

    async to_db(){

        m.rows_total = [].concat(...m.rows_total)
        await db.full_insert_order( m.rows_total)

        // await this.fetch_youzan_order_product_detail()

        var db = new DB()
        db.conn()
        await db.full_insert_order_detail( m.rows_total)
        return  m.rows_total
    }

    async fetch_youzan_order_product_detail(){

        let count = 0

        for(let r of m.rows_total){
            let alias		  = r['alias'];
            console.log( "r alias" , product_id )
            let youzan_row_data   = await youzan.api_product_row_by_alias( alias );
            r  = Object.assign(r,youzan_row_data);

            count++;
            r["product_id"] = r['id'];
            r['id']         = count;
            console.log( "r youzan data combine is " , r )

            sleep.usleep(500000)

            console.log("现在的总数为",m.rows_total.length, "当前为 : " , count)
        }
        return m.rows_total
    }
}
