"use strict";

let $                             = require('cheerio')
let fs                            = require('fs')
class OrdersRow{
    constructor(){
        this.final_data           = []
    }
    test(){
        let h                     = fs.readFileSync('order_test.html', 'utf-8')
        h                         = $.load(h)
        let data                  = h.html()
        let order_row             = new OrdersRow()
        let orders                = order_row.get_orders(data)
        console.log(orders)
    }

    get_orders(data){

        this.page_data        = $('.widget-list-item',data);
        this.final_data       = this.page_data.map( (i, el) => {

            let row_header      = this.get_header_row(el)
            row_header['rows']  = this.get_body_rows(el)
            return row_header

        })
        return this.final_data;
    }
    //获得 状态 enlish字段
    get_status_en(data){
        // let status_list = {
        //
        // }
        //     let status = {
        //         "":TRADE_NO_CREATE_PAY, //没有创建支付交易
        //         "":WAIT_BUYER_PAY,      //等待买家付款
        //         "":TRADE_NO_CREATE_PAY,
        //         "":TRADE_NO_CREATE_PAY,
        //         "":TRADE_NO_CREATE_PAY,
        //         "":TRADE_NO_CREATE_PAY,
        //         "":TRADE_NO_CREATE_PAY,
        //         "":TRADE_NO_CREATE_PAY,
        //                                  ）
        //
        //     WAIT_GROUP（等待成团，即：买家已付款，等待成团）
        //     WAIT_SELLER_SEND_GOODS（等待卖家发货，即：买家已付款）
        //     WAIT_BUYER_CONFIRM_GOODS（等待买家确认收货，即：卖家已发货）
        //     TRADE_BUYER_SIGNED（买家已签收）
        //     TRADE_CLOSED（付款以后用户退款成功，交易自动关闭）
        //     ALL_WAIT_PAY（包含：WAIT_BUYER_PAY、TRADE_NO_CREATE_PAY）
        //     ALL_CLOSED（所有关闭订单）
    }
    //获得头部订单数据
    get_header_row(el){

        var header_row              = $(el).find(".header-row").eq(0) //注意这个node版本的css selector 不支持 :eq(0)这种写法
        var content_row_0           = $(el).find(".content-row").eq(0)

        var href                    = header_row.find(".js-opts a").attr("href").trim()
        var order_no                = header_row.find("td div").eq(0).contents().first().text().trim().replace("订单号: ","").trim()
        var order_type              = header_row.find("span.c-gray").eq(0).text().trim()
        var order_no_outer          = header_row.find(".clearfix span").eq(0).text().trim()
        var pay_no                  = header_row.find(".clearfix span").eq(1).text().trim()

        var pay_user_company        = content_row_0.find(".customer-cell p").eq(0).text().trim()
        var pay_user_name           = content_row_0.find(".customer-cell p.user-name").text().trim()
        var pay_user_mobile         = content_row_0.find("td.customer-cell").eq(0).contents().last().text().trim()

        var created_at              = content_row_0.find("td.time-cell .td-cont").text().trim()
        var order_status            = content_row_0.find(".js-order-state").eq(0).text().trim()
        var order_status_en         = this.get_status_en( order_status )
        var pay_money               = content_row_0.find(".pay-price-cell .text-center div").text().trim()
        pay_money                   = pay_money.replace(/(?!-)[^0-9.]/g, "")

        var res             = {

            href			: href,                 //查看具体详情链接页面
            order_no        : order_no,             //订单号
            order_type      : order_type,           //订单支付
            order_no_outer  : order_no_outer,       //订单号外部
            pay_no          : pay_no,               //支付流水号

            pay_user_company: pay_user_company,     //支付对象的company
            pay_user_name   : pay_user_name,        //支付对象的名字
            pay_user_mobile : pay_user_mobile,      //支付对象的手机号

            created_at      : created_at,           //订单创建时间
            order_status    : order_status,         //订单状态
            order_status_en : order_status_en,       //订单状态

            pay_money       : pay_money,              //实付金额
        };

        for(var k in res){
            if (!res[k]){
                res[k] = ""
            }
        }
        console.log(" >>>> 单个产品订单 ",res)
        return res;

    }
    get_body_rows(el){

        var rows_data               = []
        var content_rows            = $(el).find(".content-row")

        content_rows.each(function(i,e){
            var row         = $(e)
            var a           = row.find(".title-cell .goods-title .new-window").eq(0)

            var image_href  = row.find(".image-cell img").eq(0).attr("src")
            var name        = a.attr("title")
            var href        = a.attr("href")

            var alias       = ""
            if ( href ){
                alias       = href.substr((href.lastIndexOf('=')+1))
            }

            var text        = row.find('.title-cell').eq(0).find('span.goods-sku').text().trim()
            var price       = row.find(".price-cell").eq(0).find("p").eq(0).text().trim()
            var num_str     = row.find(".price-cell").eq(0).find("p").eq(1).text().trim()
            var num         = num_str.replace(/(?!-)[^0-9.]/g, "")

            if (image_href){

                var o             = {
                    image_href	  : image_href ,         //产品图片链接
                    name          : name,               //产品名
                    href          : href,               //产品链接
                    alias         : alias,               //产品ID别名 一般存在于链接的最后那段 由?和/开始 作为外键的关键id
                    text          : text,               //产品名 多
                    price         : price,              //SKU价格
                    num           : num,                 //购买数量
                    num_str       : num_str,           //数量str
                };

                for(var k in o){
                    if (!o[k]){
                        o[k] = ""
                    }
                }
                rows_data.push(o);
            }else{
                return null;
            }

        })
        return rows_data;
    }
}


// let ordersRow = new OrdersRow()
// ordersRow.test()



module.exports = OrdersRow
