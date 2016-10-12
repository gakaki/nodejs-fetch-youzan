

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
        table.insert({'data':1}).run(connection, (err, result) => {
            if (err) throw err;
            console.log(JSON.stringify(result, null, 2));
        })
    })

//
})