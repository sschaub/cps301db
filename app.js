// Note: If the below fails to connect to MySQL with an error "Client does not support authentication protocol requested by server",
// see https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server

let express = require("express");
let bodyParser = require('body-parser');
let mysql = require("mysql");
let sqlformatter = require("sql-formatter");

let dbUser = process.env.DBUSER
let dbPass = process.env.DBPASS

if (!dbUser || !dbPass) {
    console.log('Must set DBUSER and DBPASS environment variables.')
    process.exit(1)
}

let univdbpool = mysql.createPool({    
    "host": "localhost",
    "user": dbUser,
    "password": dbPass,
    "database": "univdb",
    "connectionLimit": 10
});

let ordentrypool = mysql.createPool({    
    "host": "localhost",
    "user": dbUser,
    "password": dbPass,
    "database": "ordentry",
    "connectionLimit": 10
});


let app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))

app.post('/execute', function (req, res) {
    let selPool = req.body['schema'];
    let pool = (selPool == 'univdb') ? univdbpool : ordentrypool;
    pool.getConnection(function(err, connection) {
        if (err) {
            res.send("Problem obtaining connection: " + err);
            return;
        }
        connection.query("set session sql_mode = 'ansi'", function (err, results) {
            let sql = req.body['sql']
            console.log("sql: " + sql);
            connection.query(sql, function (err, result, fields) {
                if (err) {
                    connection.release();
                    res.send(err);
                    return;
                }
                table = "<table border='1'><tr>";
                for (let i = 0; i < fields.length; ++i) {
                    table += "<th>" + fields[i].name;
                }
                for (let row = 0; row < result.length; ++row) {
                    table += "\n<tr>"
                    for (let col = 0; col < fields.length; ++col) {
                        table += "<td>" + result[row][fields[col].name]
                    }
                }
                table += "</table>"
                res.send(table);
                //console.log(result);
                connection.release();  // release connection
            });
    
        });
    });
});

app.post('/format', function (req, res) {
    let sql = req.body['sql'];
    res.send(sqlformatter.format(sql, {
        language: 'mysql'
      }));
})

app.get('/tables', function (req, res) {
    let selPool = req.query['schema'];
    let pool = (selPool == 'univdb') ? univdbpool : ordentrypool;
    pool.getConnection(function(err, connection) {
        if (err) {
            res.send("Problem obtaining connection: " + err);
            return;
        }
        connection.query("show tables", function (err, results, fields) {
            if (err) {
                connection.release();
                res.send(err);
                return;
            }
            tables = [];
            for (let i = 0; i < results.length; ++i) {
                tables.push(results[i][fields[0].name])
            }
            res.send(tables);
            connection.release();  // release connection    
        });
    });
});

module.exports = app;
