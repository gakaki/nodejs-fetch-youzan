"use strict";

let sleep                 = require('sleep');

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

    async  test(){

        let res = await this.get_all_orders_rows()
        console.log("订单数据为",youzan.rows_orders)
        console.log("订单数据总页面为",youzan.order_page_no,"每页面为",youzan.order_page_size)
        console.log("订单数据总量为",youzan.total_results)
        return res
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

            sleep.sleep(5)

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

module.exports =  YouzanSDK;