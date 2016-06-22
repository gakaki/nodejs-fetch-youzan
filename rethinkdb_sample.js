var r = require('rethinkdb');

const dbName    = "youzan"
const tableName = "product"

var connection = null;
r.connect( {host: 'wowdsgn.com', port: 28015}, (err, conn) => {
    if (err) throw err;
    connection = conn;
    connection.use(dbName);

    r.tableDrop(tableName).run(conn, (err,result) =>{
      r.tableCreate(tableName).run(conn, (err,result) =>{
        r.table(tableName).insert(this.rows_total).run(connection, (err,result) =>{
            if (err) throw err;
            console.log(JSON.stringify(result, null, 2));
        })
      })
    });
});
