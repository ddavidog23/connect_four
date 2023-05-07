let st = require("./server_tools");
let fs = require('fs');
let ct = require('./client_tools');

exports.signup = (req, res, q) => {
  let username = q.query.username;
  let password = q.query.password;
  if (!username || !password) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("username and password are required.");
    return;
  }
  st.query(
    "INSERT INTO users(username,password) VALUES (?,?)",
    [username, password],
    (result, err) => {
      if (err) {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("taken");
        console.log(err);
        return;
      } else {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Signup Complete");
      }
    }
  );
};

exports.login = (req, res, q) => {
  let username = q.query.username;
  let password = q.query.password;
  if (!username || !password) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("username and password are required.");
    return;
  }
  st.query(
    "SELECT COUNT (*) AS count FROM users WHERE username=? AND BINARY password=?",
    [username, password],
    (result, err) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("sorry about that.");
        return;
      }
      if (result && result.length > 0) {
        if (result[0].count == 1) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end('OK');
        } else {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("wrong");
          return;
        }
      }
    }
  );
};

exports.get_lobby = (req, res, q) => {
  let username = q.query.username;
  let password = q.query.password;
  if (!username || !password) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("username and password are required.");
    return;
  }
  st.query('UPDATE users SET lobby =? WHERE username=? AND NOT lobby=-1', [Date.now(),username],(result, err)=>{
    if(err) throw err;
    st.query('SELECT username FROM users WHERE ? - lobby < 2000', [Date.now()], (result, err)=>{
      if(err) throw err;
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify(result))
    })
  })
}

exports.start_game = (req, res, q) => {
  let username = q.query.username;
  let password = q.query.password;
  if (!username || !password) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("username and password are required.");
    return;
  }
  let partner = q.query.partner;
  if(!partner) return;
  st.query('UPDATE users SET lobby = -1 WHERE username IN (?,?) AND -lobby<2000',[username, partner, Date.now()], (result, err)=>{
    if (err) throw err;
    if(result.affectedRows == 2) {
      st.query("INSERT INTO games(player1,player2) VALUES (?,?)",[username,partner], (result, err)=>{
        if (err) throw err;
        res.writeHead(200, {'Content-Type' : 'text/plain'});
        res.end('OK');
      })
    } else {
      res.writeHead(200, {'Content-Type' : 'text/plain'});
      res.end('OK'); 
    }
  });
}

exports.leave_game = (req, res, q) => {
  let username = q.query.username;
  let password = q.query.password;
  if (!username || !password) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("username and password are required.");
    return;
  }
  st.query('SELECT id,player1,player2 FROM games WHERE (player1=? OR player2=?) AND active =1',[username, username],(result, err)=>{
    if (err) throw err;
    if(result.length >= 1){
      let gameId = result[0].id;
      let partner;
      if(result[0].player1 == username){
        partner = result[0].player2;
      } else {
        partner = result[0].player1;
      }

      st.query('UPDATE games SET active=0 WHERE id=? AND active=1',[gameId], (result, err)=>{
        if (err) throw err;
        if (result.affectedRows == 1) {
          st.query('UPDATE users SET lobby=0 WHERE username IN (?,?)',[username, partner],(result,err)=>{
            if (err) {
              res.writeHead(200, {'Content-Type' : 'text/plain'});
              res.end('error');
              return;
            };
            res.writeHead(200, {'Content-Type' : 'text/plain'});
            res.end('OK');
          })
        } else if(result.affectedRows == 0) {
          st.query('UPDATE users SET lobby=0 WHERE username = ?',[username],(result,err)=>{
            if (err) throw err;
            res.writeHead(200, {'Content-Type' : 'text/plain'});
            res.end('OK');
          })
        }
      })
    }
  })
}

exports.get_game_id = (req, res, q) => {
  let username = q.query.username;
  let password = q.query.password;
  if (!username || !password) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("username and password are required.");
    return;
  }
st.query('SELECT id FROM games WHERE (player1=? OR player2=?) AND active=1',[username, username], (result, err)=>{
  if (err) throw err;
  if(result.length >= 1) {
    let gameId = result[0].id;
    res.writeHead(200, {'Content-Type' : 'text/plain'});
    res.end(gameId + "");
  } else {
    res.writeHead(200, {'Content-Type' : 'text/plain'});
    res.end('-1');
  }
});
}

exports.get_game_status = (req, res, q) => {
  let username = q.query.username;
  let password = q.query.password;
  if (!username || !password) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("username and password are required.");
    return;
  }
  let gameId = q.query.id;
  if (!gameId) return;
  st.query('SELECT player1, player2, active, cell1,cell2,cell3,cell4,cell5,cell6,cell7,cell8,cell9,cell10,cell11,cell12,cell13,cell14,cell15,cell16,cell17,cell18,cell19,cell20,cell21,cell22,cell23,cell24,cell25,cell26,cell27,cell28,cell29,cell30,cell31,cell32,cell33,cell34,cell35,cell36,cell37,cell38,cell39,cell40,cell41,cell42 FROM games WHERE id=? AND (player1=? OR player2=?)', [gameId, username, username], (result, err)=>{
    if (err) throw err;
    if(result.length == 1) {
      let gameStatus = {
        id: gameId,
        player1: result[0].player1,
        player2: result[0].player2,
        active: result[0].active[0]==1,
        board: [
          result[0].cell1, result[0].cell2, result[0].cell3, result[0].cell4, result[0].cell5, result[0].cell6, result[0].cell7,
          result[0].cell8, result[0].cell9, result[0].cell10, result[0].cell11, result[0].cell12, result[0].cell13, result[0].cell14,
          result[0].cell15, result[0].cell16, result[0].cell17, result[0].cell18, result[0].cell19, result[0].cell20, result[0].cell21,
          result[0].cell22, result[0].cell23, result[0].cell24, result[0].cell25, result[0].cell26, result[0].cell27, result[0].cell28,
          result[0].cell29, result[0].cell30, result[0].cell31, result[0].cell32, result[0].cell33, result[0].cell34, result[0].cell35,
          result[0].cell36, result[0].cell37, result[0].cell38, result[0].cell39, result[0].cell40, result[0].cell41, result[0].cell42
        ],
      };
      res.writeHead(200, {'Content-Type' : 'application/json'});
      res.end(JSON.stringify(gameStatus));
    }
  })
} 

exports.play_cell = (req, res, q) => {
  let username = q.query.username;
  let password = q.query.password;
  if (!username || !password) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("username and password are required.");
    return;
  }
  let cell = q.query.cell;
  let gameId = q.query.id;
  if (cell && gameId) {
    cell = parseInt(cell);
    gameId = parseInt(gameId);
    if (isNaN(cell) || isNaN (gameId) || cell < 0 || cell > 41) {
      res.end('?');
      return
    }
    st.query('SELECT player1, player2, cell1,cell2,cell3,cell4,cell5,cell6,cell7,cell8,cell9,cell10,cell11,cell12,cell13,cell14,cell15,cell16,cell17,cell18,cell19,cell20,cell21,cell22,cell23,cell24,cell25,cell26,cell27,cell28,cell29,cell30,cell31,cell32,cell33,cell34,cell35,cell36,cell37,cell38,cell39,cell40,cell41,cell42 FROM games WHERE id = ? AND active = 1',[gameId], (result, err) => {
      if(err) throw err;
      if (result.length == 1) {
        let player1 = result[0].player1;
        let player2 = result[0].player2;
        if (player1 == username || player2 == username) {
          let redOrYellow = player1 == username ? 1 : 2;
          let board = [
            result[0].cell1, result[0].cell2, result[0].cell3, result[0].cell4, result[0].cell5, result[0].cell6, result[0].cell7,
            result[0].cell8, result[0].cell9, result[0].cell10, result[0].cell11, result[0].cell12, result[0].cell13, result[0].cell14,
            result[0].cell15, result[0].cell16, result[0].cell17, result[0].cell18, result[0].cell19, result[0].cell20, result[0].cell21,
            result[0].cell22, result[0].cell23, result[0].cell24, result[0].cell25, result[0].cell26, result[0].cell27, result[0].cell28,
            result[0].cell29, result[0].cell30, result[0].cell31, result[0].cell32, result[0].cell33, result[0].cell34, result[0].cell35,
            result[0].cell36, result[0].cell37, result[0].cell38, result[0].cell39, result[0].cell40, result[0].cell41, result[0].cell42
          ];

          let countRed = 0;
          for (let i = 1; i < 42; i++) {
            if (board[i] != 0) countRed++;
          }
          let isRedTurn = countRed % 2 == 0;
          let win = false;
          let player = isRedTurn ? 1 : 2;

          if (board[cell] == 0 && ((isRedTurn && redOrYellow == 1) || (!isRedTurn && redOrYellow == 2))) {//empty cell
            if (cell >= 35 || board[cell + 7] != 0) {
              st.query('UPDATE games SET cell'+(cell+1)+'='+redOrYellow+' WHERE id = ?',[gameId], (result, err) => {
                if (err) throw err;
                res.writeHead(200, {'Content-Type' : 'text/plain'});
                res.end('OK');
              })
            }
          } else {
            res.end('error');
            return;
          }

          for (let i = 0; i < 6 && !win; i++) {
            for (let j = 0; j < 7 && !win; j++) {
              let index = i * 7 + j;
              if (board[index] == player) {
                //check horizontal
                if (j < 4 && board[index + 1] == player && board[index + 2] == player && board[index + 3] == player) {
                  win = true;
                  break;
                }
                //check vertical
                if (i < 3 && board[index + 7] == player && board[index + 14] == player && board[index + 21] == player) {
                  win = true;
                  break;
                }
                //check alahson down left
                if (i < 3 && j > 2 && board[index + 6] == player && board[index + 12] == player && board[index + 18] == player) {
                  win = true;
                  break;
                }
                //check alahson down right
                if (i < 3 && j < 4 && board[index + 8] == player && board[index + 16] == player && board[index + 24] == player) {
                  win = true;
                  break;
                }
              }
            }
          }

          if (win) {
              st.query('SELECT id,player1,player2 FROM games WHERE (player1=? OR player2=?) AND active =1',[username, username],(result, err)=>{
    if (err) throw err;
    if(result.length >= 1){
      let gameId = result[0].id;
      let partner;
      if(result[0].player1 == username){
        partner = result[0].player2;
      } else {
        partner = result[0].player1;
      }

      st.query('UPDATE games SET active=0 WHERE id=? AND active=1',[gameId], (result, err)=>{
        if (err) throw err;
        if (result.affectedRows == 1) {
          st.query('UPDATE users SET lobby=0 WHERE username IN (?,?)',[username, partner],(result,err)=>{
            if (err) {
              res.writeHead(200, {'Content-Type' : 'text/plain'});
              res.end('error');
              return;
            };
            res.writeHead(200, {'Content-Type' : 'text/plain'});
            res.end('OK');
          })
        } else if(result.affectedRows == 0) {
          st.query('UPDATE users SET lobby=0 WHERE username = ?',[username],(result,err)=>{
            if (err) throw err;
            res.writeHead(200, {'Content-Type' : 'text/plain'});
            res.end('OK');
          })
        }
      })
    }
  })
          } else {
            res.writeHead(400, {'Content-Type' : 'text/plain'});
            res.end('Sorry about that :/')
          }
        } else {
          res.end('error');
          return;
        }
      }
    })
  } else {
    res.end('?');
    return;
  }
};


