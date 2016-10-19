// MYSQL

var mysql = require('mysql');
var connection = mysql.createConnection({
  multipleStatements: true,
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



app.use(function (req, res, next) {
  console.log(req.method + ' ' + req.path);
  next();
})



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

      res.status(505).send(message);
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
  returnQuery('SELECT * FROM User WHERE id = ' + req.params.id + ';', res);
})

app.get('/user/all', function (req, res) {
  returnQuery('SELECT * FROM User', res);
})

app.post('/user/:id(\\d+)/challenge', function (req, res) {
  req.check('context_id').notEmpty().isInt();
  req.check('type').notEmpty().isInt();

  if (req.validationErrors()) {
    res.status(500).send();
    return;
  }

  var typeName = req.body.type == 1 ? "Sentence" : "Memory"
  var typeCount = req.body.type == 1 ? 4 : 6
  var query = 'INSERT INTO Game (player1, player2, type) VALUES ('+ req.body.context_id +', ' + req.params.id + ', ' + req.body.type + '); INSERT INTO Rounds (game_id, round_id) SELECT LAST_INSERT_ID(), id FROM ' + typeName + ' ORDER BY RAND() LIMIT ' + typeCount + ';'
  connection.query(query, function(err, rows, fields) {
    if (err) {
      res.status(505).send();
      return;
    }

    res.send()
  });
})









// Game
app.get('/game/:id(\\d+)', function (req, res) {
  returnQuery('SELECT * FROM Game WHERE id = ' + req.params.id + ';', res)
})

app.get('/game/list', function (req, res) {
  req.check('context_id');

  if (req.validationErrors()) {
    res.status(500).send();
    return;
  }

  var query = 'SELECT * FROM Game WHERE player1 = ' + req.query.context_id + ' OR player2 = ' + req.query.context_id + ';';
  returnQuery(query, res);
});

app.post('/game/:id(\\d+)/accept', function (req, res) {
  var query = 'UPDATE Game SET state = 1 WHERE id = ' + req.params.id + ';';
  connection.query(query, function(err, rows, fields) {
    if (err) {
      res.status(500).send();
      return;
    }

    res.send();
  });
});

app.post('/game/:id(\\d+)/decline', function (req, res) {
  var query = 'UPDATE Game SET state = 3 WHERE id = ' + req.params.id + ';';
  connection.query(query, function(err, rows, fields) {
    if (err) {
      res.status(500).send();
      return;
    }

    res.send();
  });
});

app.get('/game/:id(\\d+)/rounds', function (req, res) {
  var typeName = req.body.type == 1 ? "Sentence" : "Memory"
  var query = 'SELECT * FROM Rounds INNER JOIN '+ typeName + ' ON round_id WHERE game_id = ' + req.params.id + ';';
  returnQuery(query, res);
});

app.post('/game/:id(\\d+)/progress', function (req, res) {
  req.check('score').notEmpty().isInt();
  if (req.validationErrors()) {
    res.satus(500).send();
  }

  var query = 'UPDATE Game SET player1_score = IF(player1 = ' + req.body.context_id + ', ' + req.body.score + ', player1_score), player2_score = IF(player2 = ' + req.body.context_id + ', ' + req.body.score + ', player2_score), state = IF(player2 = ' + req.body.context_id + ', 3, 2) WHERE id = ' + req.params.id + ';'
  connection.query(query, function(err, rows, fields) {
    if (err) {
      res.status(505).send();
      return;
    }

    res.send()
  });
});








// Image
app.get('/image/:id(\\d+)/', function (req, res) {
   returnQuery('SELECT * FROM Image WHERE id = ' + req.params.id + ';', res)
})



// Type
app.get('/type/:id(\\d+)', function (req, res) {
  req.check('count');
  if (req.validationErrors()) {
    req.status(505).send()
  }

  var typeName = req.params.id == 1 ? "Sentence" : "Memory"
  returnQuery('SELECT * FROM ' + typeName + ' ORDER BY RAND() LIMIT ' +  req.query.count + ';', res);
});





// Data

app.get('/data/:id(\\d+)/', function (req, res) {
   res.sendFile('/home/demo/data/images/' + req.params.id + '.jpg');
})
