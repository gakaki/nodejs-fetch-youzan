"use strict";

let YouzanSDK             = require('../youzan/YouzanSDK')
let OrdersRow             = require('./orders_row')
let sleep                 = require('sleep')
let DB                    = require('./db')
let lodash                = require("lodash")
var webdriverio           = require('webdriverio')

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
        this.wi                 = wi
        this.timeout            = 600
        this.rows_total         = []
        this.test_page_count    = 0
    }


    async fetch_page_data(){
        let html 			   	  = await this.wi.getHTML('.ui-table-order')
        let c                     = new OrdersRow()
        let res                   = c.get_orders(html);

        this.rows_total.push(res)
        console.log("rows",html,res)
    }

    mock_page_count(){
        this.test_page_count = this.test_page_count + 1
        if ( this.test_page_count > 2) {
            return false
        }else {
            return  true
        }
    }
    async fetch_next_page(){

        let selector_page_next 	  = '.ui-pagination-prev:last-child'
        let isExisting            = await this.wi.isExisting(selector_page_next)
        console.log(">>>>>>>>>>>>是否存在下一页按钮",isExisting);

        // if(isExisting && this.mock_page_count()) {
        if(isExisting ) {
            this.wi.pause(this.timeout).waitForExist(selector_page_next,5000)
                .click(selector_page_next)
                // .moveToObject(selector_page_next,0,0)
            await this.fetch_page_data();
            await this.fetch_next_page()
        }else{
            await this.fetch_page_data();
        }

    }

    flatten_orders(){
        let orders = []
        for (var i = 0; i < this.rows_total.length; i++) {
            for (var j = 0; j < this.rows_total[i].length; j++) {
                orders.push(this.rows_total[i][j])
            }
        }

        return orders
    }
    async exec(){
        await this.fetch_next_page()
        this.rows_total = this.flatten_orders()

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
        var order_page          = new WorkerOrderPage()
        let order_page_data     = await order_page.exec()
        this.rows_total.push(order_page_data)
        console.log(this.rows_total)
    }
    async exec(){
        try{
            await this.fetch_orders()
            this.wi.end();
            await this.to_db();
        }catch(ex){
            console.log(ex.message)
        }
    }

    async to_db(){

        this.rows_total = [].concat(...this.rows_total)

        var db = new DB()
        await db.conn()
        let res   = await db.full_insert_order( this.rows_total)
        console.log("显示一下数据库结果" , res)

        // await this.fetch_youzan_order_product_detail()
        // res  = await db.full_insert_order_detail( this.rows_total)

        console.log("显示一下最后的所有数据 长度" , this.rows_total.length)
        return  this.rows_total
    }

    async fetch_youzan_order_product_detail(){

        let count = 0

        for(let r of this.rows_total){
            let alias		  = r['alias'];
            console.log( "r alias" , product_id )
            let youzan_row_data   = await youzan.api_product_row_by_alias( alias );
            r  = Object.assign(r,youzan_row_data);

            count++;
            r["product_id"] = r['id'];
            r['id']         = count;
            console.log( "r youzan data combine is " , r )

            sleep.usleep(500000)

            console.log("现在的总数为",this.rows_total.length, "当前为 : " , count)
        }
        return this.rows_total
    }
}
