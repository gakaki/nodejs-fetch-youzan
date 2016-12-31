"use strict";

let r = require('rethinkdb');

class DB {

    constructor(){
    }

    async full_insert_product( rows ){
        await this.table_remove_insert(this.tableProduct , rows)
    }

    async full_insert_order( rows ){
        await this.table_remove_insert(this.tableOrder , rows)
    }

    async full_insert_order_detail( rows ){
        await this.table_remove_insert(this.tableOrderDetail , rows)
    }
    async table_remove_insert(table_object,rows){
        try {
            await table_object.delete().run(this.conn)
            await table_object.insert( rows ).run(this.conn)
        }catch(e){
            console.log(">>>>> rethinkdb full_insert_order_detail 插入出错",JSON.stringify(e, null, 2));
        }
    }

    async conn(){
        try {
            this.conn                   = await r.connect( {host: 'wowdsgn.com', port: 28015} );

            this.db 			        = r.db("youzan")
            this.tableProduct 	        = this.db.table("product")
            this.tableOrder 	        = this.db.table("order")
            this.tableOrderDetail 	    = this.db.table("order_detail")
            this.tableTestMe            = this.db.table("test_me")

            await this.create_tables()

        }catch(e) {
            console.log(">>>> rethinkdb 连接失败!!!",e)
        }
    }

    async create_table(table_name){
        try {
            let w = await this.db.tableCreate(table_name).run(this.conn)
            console.log(w)
        }catch(e){
            console.log(">>>>> rethinkdb 创建数据表 就算存在 在创建也无所谓",e.toString())
            return null
        }
    }
    async create_tables(){
        await this.create_table('test_me')
        await this.create_table('product')
        await this.create_table('order')
        await this.create_table('order_detail')
    }
    async test(){

        try {
            let rows = [
                {
                    row_id:"1",
                    name:"gakaki"
                },
                {
                    row_id:"2",
                    name:"hxmwith"
                }
            ]



            let u      = await this.table_remove_insert(this.tableTestMe , rows)
            let cursor = await this.tableTestMe.run(this.conn)
            let res    = await cursor.toArray()
            console.log("rethinkdb 测试方法 返回数据为 ",res)

            return res

        }catch(e){
            console.log(">>>>> rethinkdb tableTestMe 插入出错",e.toString())
            return null
        }
    }
}


module.exports = DB