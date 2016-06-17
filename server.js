var 
  fs = require('fs'),
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express();

app.use(express.static(__dirname + '/public'));
// app.use(express.bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/data', function(req, res) {
  fs.readFile('public/js/data.json', function(err, data) {
    res.set('Content-Type', 'text/json');
    res.json(data.toString());
  });
});

app.post('/change', function(req, res) {
  fs.writeFile('public/js/data.json', req.body.data, function(err) {
    if (err) {
      console.log(err.message);
    } else {
      res.send("OK");
    }
  });
});

app.listen(8080);