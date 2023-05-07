let http = require('http');
let url = require('url');
let st = require('./server_tools');
let api = require('./api_functions');

const apiFunctions = {
  '/login' : api.login,
  '/signup' : api.signup,
  '/get_lobby' : api.get_lobby,
  '/start_game' : api.start_game,
  '/leave_game' : api.leave_game,
  '/get_game_id' : api.get_game_id,
  '/get_game_status' : api.get_game_status,
  '/play_cell' : api.play_cell,
}

http.createServer((req, res) => {
  let q = url.parse(req.url, true);
  let path = q.pathname;
  if(path.startsWith('/api')){
    path = path.substring(4);
    if(!apiFunctions[path]){
      res.writeHead(400, {'Content-Type': 'plain/text'});
      res.end('no such action');
      return
    }
    apiFunctions[path](req, res, q);
  } else {
    st.serveStaticFile(path, res);
  }
}).listen(8080, ()=>{
  console.log('Listening on port 8080');
})

