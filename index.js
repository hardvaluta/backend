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
var bodyParser = require("body-parser");
var expressValidator = require('express-validator');
var app = express();
app.use(bodyParser.json());
app.use(expressValidator([]));

var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
})

// Convenience

function returnQuery(query, res) {
  connection.query(query, function(err, rows, fields) {
    if (err) {
      res.status(500).send(err);
      return;
    }

    res.send(rows);
  });
}

// User
app.post('/user/create', function (req, res) {
  req.check('username').notEmpty();
  req.check('password').notEmpty();

  if (req.validationErrors()) {
    res.status(500).send();
    return;
  }

  var sha1 = require('sha1');
  var hahsedPassword = sha1(req.body.password);

  var query = 'INSERT INTO User (username, password) VALUES (\''+ req.body.username + '\', \'' + hahsedPassword +'\');'
  connection.query(query, function(err, rows, fields) {
    if (err) {
      var message = "";
      if (err.code == 'ER_DUP_ENTRY') {
        message = "not_unique_username";
      }

      res.status(500).send(message);
      return;
    }

    returnQuery('SELECT * FROM User WHERE id = ' + rows.insertId + ';', res);
  });
})

app.post('/user/authenticate', function (req, res) {
  req.check('username').notEmpty();
  req.check('password').notEmpty();

  var sha1 = require('sha1');
  var hashedPassword = sha1(req.body.password);

  var query = 'SELECT * FROM User WHERE username = \'' + req.body.username + '\' AND password = \'' + hashedPassword + '\';'
  connection.query(query, function(err, rows, fields) {
    if (err) {
      res.status(500).send();
      return;
    } else if (rows.length == 0) {
      res.status(500).send('incorect_username_password');
      return;
    }

    res.send(rows);
  });
})

app.get('/user/:id(\\d+)/', function (req, res) {
  returnQuery('SELECT * FROM User WHERE id = ' + req.params.id + ';', res)
})

/*app.post('/user/progress', function(req, res) {
  var id = req.body.id;
  var count = req.body.count;
  var difficulty = req.body-parser.difficulty;
  var score = 1;

  var query = 'UPDATE User SET score = score + ' + score + ' WHERE id = ' +  id + ";";
  connection.query(query, function(err, rows, fields) {
    if (err) {
      res.status(500).send();
      return;
    }

    res.send();
  });
})*/

// Game
app.get('/game/:id(\\d+)/', function (req, res) {
  returnQuery('SELECT * FROM Game WHERE id = ' + req.params.id + ';', res)
})

app.get('/game/current'), function (req, res) {
  var query = 'SELECT * FROM Game WHERE player1 = ' + req.params.id + 'OR player2 = ' + req.params.id + ';';
}

// Image
app.get('/game/:id(\\d+)/', function (req, res) {
   returnQuery('SELECT * FROM Image WHERE id = ' + req.params.id + ';', res)
})

// Question
app.get('/question/random', function (req, res) {
  req.check('difficulty').notEmpty().isInt();
  req.check('count').notEmpty().isInt();

  if (req.validationErrors()) {
    res.status(500).send();
    return;
  }

  returnQuery('SELECT * FROM Question WHERE difficulty = ' + req.query.difficulty + ' ORDER BY RAND() LIMIT ' + req.query.count + ';', res)
})

app.get('/question/:id(\\d+)/', function (req, res) {
   returnQuery('SELECT * FROM Question WHERE id = ' + req.params.id + ';', res)
})

// Data

app.get('/data/:id(\\d+)/', function (req, res) {
   res.sendFile('/home/demo/data/images/' + req.params.id + '.png');
})
