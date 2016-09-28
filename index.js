// MYSQL
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'backend'
});
connection.connect();

// App
var express = require('express');
var app = express();

var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
})

// Convenience
function query(string, res) {
  connection.query(string, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.status(505).send('somethng went wrong');
      return
    }

    res.send(rows);
  });
}


// User
app.post('/user/create', function (req, res) {
  var username = req.params['username'] || ''
  var email = req.params['email'] || ''
  query('INSERT INTO User (username, email) VALUES (\''+ username + '\', \'' + email +'\');', res)
})

app.get('/user/:id(\\d+)/', function (req, res) {
  query('SELECT * FROM User WHERE id = ' + req.params['id'] + ';', res)
})

/** Convenience really only used for testing and debug **/
app.get('/user/list', function (req, res) {
   query('SELECT * FROM User;', res)
})


// Game
app.get('/game/:id(\\d+)/', function (req, res) {
   query('SELECT * FROM Game WHERE id = ' + req.params['id'] + ';', res)
})

/** Convenience really only used for testing and debug **/
app.get('/game/list', function (req, res) {
   query('SELECT * FROM Game;', res)
})


// Image
app.get('/game/:id(\\d+)/', function (req, res) {
   query('SELECT * FROM Image WHERE id = ' + req.params['id'] + ';', res)
})


// Question
app.get('/question/:id(\\d+)/', function (req, res) {
   query('SELECT * FROM Question WHERE id = ' + req.params['id'] + ';', res)
})

app.get('/question/random', function (req, res) {
  var difficulty = req.params['difficulty'] || 1;
  var count = req.params['count'] || 4;

  query('SELECT * FROM Question WHERE difficulty = ' + difficulty + ' ORDER BY RAND() LIMIT ' + count + ';', res)
})
