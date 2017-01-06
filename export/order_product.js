let DB = require("../worker/db")

class ExportOrderProduct {

    async exec(){
        let db = new DB()
        await db.conn()
        let res = await db.query_order_product()
        console.log(res)
        console.log(res.length)
    }
}

let export_product = new ExportOrderProduct()
export_product.exec()

