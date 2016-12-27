"use strict";

let YouzanFetch           = require('./products_row')
let sleep                 = require('sleep');
let fs                    = require('fs')

// let $                     = require('cheerio');
// let h                     = fs.readFileSync('cheeio_test.html', 'utf-8');
// h                         = $.load(h);
// let data                  = h.html();


class YouzanSDK {

    constructor(){
        if(! YouzanSDK.instance){
            this.sdk_obj        = this.init()
            this.rows_orders    = {}
            this.total_results  = 0
            this.order_page_no  = 1
            this.order_page_size= 400
            YouzanSDK.instance  = this;
        }

        return YouzanSDK.instance;
    }

    init(){
        let SDK 		= require('youzan-sdk');
        // 初始化SDK，在 https://koudaitong.com/v2/apps/open/setting 开启API接口，复制相应 AppID、AppSecert

        let AppID 		= "0eb3d2acf73c033353"
        let AppSecert 	= "e4dbae40b7a367c1efb7eea48c00fa75"
        let sdk_obj 	= SDK({key: AppID, secret: AppSecert})
        return sdk_obj
    }

    async api_product_row(num_iid){

        let data 		= await this.sdk_obj.get('kdt.item.get', {
            num_iid: num_iid,
            fields: ""
        });

        let youzan_row  = data.response.item;
        console.log(youzan_row);
        return youzan_row;
    }

    array_empty_or_nil(arr){
        if(typeof arr ==='object' && arr instanceof Array ){
            if(!arr.length){
                return true
            }else{
                return false
            }
        }else{
            return true
        }
    }

    async get_all_orders_rows(){
        await this.api_orders_rows()
        let res  = []
        for(var k in this.rows_orders){
            res  = res.concat(...this.rows_orders[k])
        }
        return res
    }
    async api_orders_rows(){

        let me = this;
        try{


            console.log(" >>> 注意 开始请求 page no ",me.order_page_no )

            let data 		= await this.sdk_obj.get('kdt.trades.sold.get', {
                type: "TRADE_BUYER_SIGNED",
                fields: "",
                page_size:me.order_page_size,
                page_no:me.order_page_no
            });


            if (  !data["response"] ){
                console.log(" >>> 注意出错了 没有获得数据 需要重试 ",me.order_page_no )
                await this.api_orders_rows();
            }
            if ( ! this.array_empty_or_nil( data["response"]["trades"] ) ){
                console.log(" >>> 注意获得数据了 增加页码继续 ", me.order_page_no )
                this.rows_orders[me.order_page_no] = data["response"]["trades"];
                sleep.sleep(5)
                me.order_page_no = me.order_page_no + 1;
                me.total_results = data["response"]["total_results"];
                console.log(me.order_page_no,data["response"]["trades"] );
                await this.api_orders_rows();
            }else{
                console.log(" >>> 注意 没有获得最后页数据 说明满了 ",me.order_page_no)
                console.log(" >>> 注意 最后数据 ",me.rows_orders)
                me.order_page_no = me.order_page_no - 1; //这里要退回去一个
                return
            }
        }catch(e){
            console.log(" >>> 出错重试了 ",e.toString())
            await this.api_orders_rows();
        }
    }

}

const youzan = new YouzanSDK();
// Object.freeze(youzan);

async function test(){

    let res = await youzan.get_all_orders_rows()
    console.log("订单数据为",youzan.rows_orders)
    console.log("订单数据总页面为",youzan.order_page_no,"每页面为",youzan.order_page_size)
    console.log("订单数据总量为",youzan.total_results)

}

test()

var webdriverio = require('webdriverio');
var options = {
    desiredCapabilities: {
        browserName: 'safari',
        debug:false
    }
};


var url = "https://koudaitong.com/v2/showcase/goods#list&keyword=&p=1&orderby=created_time&order=desc&page_size=20&multistore_status=0"
let wi  = webdriverio.remote(options)
    .init()
    .url(url)


// wi.getTitle().then(function(title) {
//         console.log('Title was: ' + title);
//     })
//     .setValue("[name=account]","13621822254")
//     .setValue("[name=password]","z5896321")
//     .waitForExist('.js-list-body-region',100000)
//     .getTitle().then(function(title) {
//         console.log('Title was: ' + title);
//     }).getHTML('.js-list-body-region').then(function(html) {
//         let w = new Worker(wi);
//         w.exec();
//     });


wi.getTitle().then(function(title) {
    console.log('Title was: ' + title);
}).getHTML('.js-list-body-region').then(function(html) {

    //默认是 出售中
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
