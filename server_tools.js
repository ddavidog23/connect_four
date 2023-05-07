let fs = require('fs');
let mysql = require('mysql');

exports.serveStaticFile = function(filename, res) {
    if(filename == '/') {
        filename = '/index.html';
    }
    let readStaticFile = function (ct) {
        fs.readFile('.' + filename, function (err, data) {
            if (!err) {
                res.writeHead(200, {'Content-Type' : ct});
                return res.end(data);
            } else {
                res.writeHead(404, {'Content-Type' : 'text/html'});
                return res.end();
            }
        });
    };

    let extToCT = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
        ".jpg": "image/jpeg",
        ".png" : "image/png"
    }
    
    let indexOfDot = filename.lastIndexOf(".");
    if (indexOfDot == -1) {
        console.log('oops not dot');
        res.writeHead(400, {'Content-Type' : 'text/html'});
        return res.end();
    } else {
        let ext = filename.substring(indexOfDot);
        let ct = extToCT[ext];
        if (!ct) {
            console.log('extension does not exist');
            res.writeHead(400, {'Content-Type' : 'text/html'});
            res.end();
        } else {
            readStaticFile(ct);
        }
    }
};

exports.query = (sql, params, callback)=>{
    let conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'DavidG526875',
        database: 'connect_four'
    });
    conn.connect((err)=>{
        if (err) {
            callback(null, err);
            return;
        }
        conn.query(sql, params, (err, result, field)=>{
            callback(result, err);
        });
        conn.end();
    });
};

function generateSessionId() {
    let timestamp = new Date().getTime().toString(36);
    let randomNum = Math.random().toString(36).substr(2, 5);
    return timestamp + randomNum;
  }
  