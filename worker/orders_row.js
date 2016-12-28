"use strict";
let $                         = require('cheerio');

class OrdersRow{
    constructor(){
        this.final_data       = [];
    }

    get_brand_name(data){
        var reg = /【.*】/
        var res = data.match(reg)
        console.log("match brand",res)
        if (!res) {
            return ""
        }
        else if (res.length >= 1)
            res     = res[0]
        else
            res     = res
        return res
    }
    get_orders(data){

        this.page_data        = $('.widget-list-item',data);
        this.page_data.map( (i, el) => {

            let row_header      = this.get_header_row(el)
            row_header['rows']  = this.get_body_rows(el)
            return row_header

        })
        return this.final_data;
    }
    //获得头部订单数据
    get_header_row(el){

        var header_row              = $(el).find(".header-row:eq(0)")

        var href                    = $(header_row).find(".js-opts a").attr("href").trim()
        var order_no                = $(header_row).find("td div:eq(0)").html().replace("订单号: ","").trim()
        var order_type              = $(header_row).find(".js-help-notes.c-gray").html().trim()
        var order_no_outer          = $(header_row).find(".clearfix span").eq(0).html().trim()
        var pay_no                  = $(header_row).find(".clearfix span").eq(1).html().trim()

        var pay_user_compan         =
        var pay_user_name           =
        var pay_user_mobile         =
        var created_at              =
        var order_status            =
        var order_status_en         =
        var pay_moneyvar            =

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

        return res;

    }
    get_body_rows(el){

        var title_el		  = $(el).find(".new-window").eq(0)
        var title             = title_el.text().trim()
        var brand             = this.get_brand_name(title)

        if (title){
            var href  		  = title_el.attr('href').trim()
            var id            = $(el).find('.checkbox').eq(0).attr("data-item-id").trim();
            var price         = $(el).find('.goods-price').eq(0).text().trim(); //供货价
            var price_int     = price.replace("￥","");

            var td4           = $(el).children('td').eq(4);
            var uv            = $(td4).children('div').eq(0).text().trim().trimLeft().replace("UV:","");
            var pv            = $(td4).children('div').eq(1).text().trim().trimLeft().replace("PV:","");

            var stock         = $(el).children('td').eq(5).text().trim();//库存

            var sale_num      = $(el).children('td').eq(6).text().trim();
            sale_num          = sale_num.replace('-',"0");

            var created_at    = $(el).children('td').eq(7).text().trim();

            var o             = {
                href			: href,                 //查看具体详情链接页面
                order_no        : order_no,             //订单号
                order_type      : order_type,           //订单支付
                order_no_outer  : order_no_outer,       //订单号外部
                pay_no          : pay_no,               //支付流水号


                title           : title,
                brand           : brand,
                id              : id,

                price           : price,
                price_int       : price_int,

                uv              : uv,
                pv              : pv,

                sale_num        : sale_num,
                stock           : stock,
                created_at      : created_at
            };

            this.final_data.push(o);
            return o;
        }else{
            return null;
        }


    }
}
module.exports = OrdersRow
