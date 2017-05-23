var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var _ = require('lodash');
var app = express();

app.use(bodyParser.json());

var timeserie = require('./series');

var now = Date.now();

for (var i = timeserie.length -1; i >= 0; i--) {
  var series = timeserie[i];
  var decreaser = 0;
  for (var y = series.datapoints.length -1; y >= 0; y--) {
    series.datapoints[y][1] = Math.round((now - decreaser) /1000) * 1000;
    decreaser += 50000;
  }
}

var annotation = {
  name : "annotation name",
  enabled: true,
  datasource: "generic datasource",
  showLine: true,
}

var annotations = [
  { annotation: annotation, "title": "Donlad trump is kinda funny", "time": 1450754160000, text: "teeext", tags: "taaags" },
  { annotation: annotation, "title": "Wow he really won", "time": 1450754160000, text: "teeext", tags: "taaags" },
  { annotation: annotation, "title": "When is the next ", "time": 1450754160000, text: "teeext", tags: "taaags" }
];

var now = Date.now();
var decreaser = 0;
for (var i = 0;i < annotations.length; i++) {
  var anon = annotations[i];

  anon.time = (now - decreaser);
  decreaser += 1000000
}

var table =
  {
    columns: [{text: 'Time', type: 'time'}, {text: 'Country', type: 'string'}, {text: 'Number', type: 'number'}],
    values: [
      [ 1234567, 'SE', 123 ],
      [ 1234567, 'DE', 231 ],
      [ 1234567, 'US', 321 ],
    ]
  };


function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "accept, content-type");
}

var url = 'http://localhost:8890';
var now = Date.now();
var decreaser = 0;
for (var i = 0;i < table.values.length; i++) {
  var anon = table.values[i];

  anon[0] = (now - decreaser);
  decreaser += 1000000
}

app.all('/', function(req, res) {
  setCORSHeaders(res);
  res.send('I have a quest for you!');
  res.end();
});

app.all('/search', function(req, res){
  setCORSHeaders(res);
  console.log('search: req.url', req.url);
  console.log('search: req.body', req.body);
  // TODO: auto generate metric name based on pubsub topic
  //var topics = ["Twitter Top N Hashtags"];
  //res.json(topics);
  //res.end();
  //return;

  request(url + '/ws/v1/pubsub/topics',
    function (error, response, body) {
      if (response && response.statusCode && (response.statusCode === 404)) {
        console.log('ERROR: status code: ', response.statusCode);
        res.json([]);
        res.end();
        return;
      }

      var topics = [];
      body = JSON.parse(body);
      if (body) {
        for (var i=0; i < body.length; i++) {
          topics.push(body[i].topic);
        }
      }
      res.json(topics);
      res.end();
    }
  );
});

app.all('/annotations', function(req, res) {
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);

  res.json(annotations);
  res.end();
})

app.all('/query', function(req, res){
  setCORSHeaders(res);
  //console.log('req.url', req.url);
  //console.log('req.body', req.body);

  var reqJson = req.body;
  if (!reqJson || !reqJson.targets) {
    console.log('ERROR: cannot resolve pubsub topic from', req.body);
    res.json([]);
    res.end();
    return;
  }

  var tsResult = [];
  //var pubSubTopic = 'twitter.topHashtags';
  var pubSubTopic = reqJson.targets[0].target;

  // TODO: add support for multiple targets

  request(url + '/ws/v1/pubsub/topics/'+pubSubTopic,
    function (error, response, body) {
      // if the topic is not registered with the pubsub server
      if (response && response.statusCode && (response.statusCode === 404)) {
        console.log('ERROR: topic: ', pubSubTopic, ' status code: ', response.statusCode);
        res.json([]);
        res.end();
        return;
      }

      // parse body object
      console.log('response for ' + pubSubTopic + ':', body)
      try {
        body = JSON.parse(body);
      } catch (error) {
        console.log('ERROR: parsing response: ', error);
        res.json([]);
        res.end();
        return;
      }

      if (body && body.data && body.data.data) {

        var rows = [];
        var cols = [];
        // tableCols structure:
        // [{"text": "Hashtag"}, {"text": "Count"}]
        var tableCols = [];
        var keys = [];

        // get data object keys
        for (key in body.data.data[0]) {
          if(body.data.data[0].hasOwnProperty(key)) {
            keys.push(key);
            tableCols.push({"text":key})
          }
        }

        // structure data
        for (var i=0; i < body.data.data.length; i++) {
          var row = [];
          for (var j=0; j<keys.length; j++) {
            row.push(body.data.data[i][keys[j]]);
          }
          rows.push(row);
        }

        var tableData = {
          "columns": tableCols,
          "rows": rows,
          "type": "table"
        };
        res.json([tableData]);
        res.end();
      }

      // no body or body.data or body.data.result
      else {
        res.json([]);
        res.end();
      }

    }
  );

  // TODO: add response for timeseries data
});

app.listen(3333);

console.log("Server is listening to port 3333");
