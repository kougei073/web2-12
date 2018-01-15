//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];

//


var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  name: String,
  text: String
});

var Post = mongoose.model('Post',PostSchema);

mongoose.connect('mongodb://localhost:27017/chat_data',
  {useMongoClient: true},
  
  function(err){
    if (err){
      console.log(err);
    }else{
      console.log('connection success!');
    }
  });
  
  Post.find({},function(err, docs){
    if(!err){
      console.log("num of item => " + docs.length);
      for(var i=0; i<docs.length; i++){
        console.log(docs[i].name);
        console.log(docs[i].text);
        var doc = docs[i];
        
        messages.push(doc);
      }
      console.log("find!");
    } else {
      console.log("not find!");
    }
  });


//
io.on('connection', function (socket) {
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };
//
var post = new Post();
post.name = name;
post.text = text;
post.save(function(err){
  if(!err){
    console.log("saved! name:" + name + ",text" + text);
  }
});
//

        broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
