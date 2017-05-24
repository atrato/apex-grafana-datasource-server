## Apex Grafana Datasource Server

A backend for [Simple JSON Datasource](https://github.com/grafana/simple-json-datasource)
to visualize data published by the [Pub/Sub Server](https://github.com/atrato/pubsub-server)
from Apache Apex applications.

Setup: Grafana (Simple JSON Datasource) <-> Apex Grafana Datasource <-> Pub/Sub Server <-> Apex application(s)

This setup could be simplified by removing the Simple JSON Datasource indirection
and implementing the Grafana datasource directly.

To start the server (after starting the Pub/Sub server):

```
npm install
node index.js
```

### Sample Data

Applications should publish data in the following formats:

Time Series:

```json
{
  "timestamp": 1495602097837,
  "data": {
    "id": "tweetStats",
    "type": "dataResult",
    "data": [
      {
        "withHashtag": "162",
        "total": "812",
        "withURL": "289",
        "timestamp": "1495601970000"
      },
      {
        "withHashtag": "27",
        "total": "208",
        "withURL": "66",
        "timestamp": "1495602090000"
      }
    ],
    "countdown": 1
  }
}
```

Tabular:

```json
{
  "type": "data",
  "topic": "twitter.topHashtags",
  "data": {
    "id": "topHashtags",
    "type": "dataResult",
    "data": [
      {
        "count": "24",
        "label": "0",
        "hashtag": "BTSBBMAs"
      },
      {
        "count": "5",
        "label": "9",
        "hashtag": "MTVINSTAARVIGNA"
      }
    ],
    "countdown": 1
  },
  "timestamp": 1494469675078
}
```
