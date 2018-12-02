# Use Loopback/StrongLoop Database Connector Standalone

[Loopback](https://loopback.io/doc/en/lb3/index.html) is great.  But sometimes all you want is the database abstraction part of it,
not the entire application framework.  The use case that modivated me to write this little module is the following; I have a full
blown web application server written in Loopback with a database, but I also have small satellite application "services" that I
want to run serverless (as in AWS Lambda) that capture small messages from IoT devices and write those into the database.  I have no
need for the entire Loopback application framework in these small services, but I still want to use the Loopback ORM to write
the data.  These services do not need to update or migrate the database, they do not need swagger interfaces, they do not need
ACLs or any of that stuff ... the web application server takes care of all that.

## Usage

```sh
npm install loopback-data-juggler-standalone
```

```js
const connector = {
  name: "postgres",
  connector: "postgresql",
  host: "192.168.99.100",
  port: 5432,
  url: "",
  database: "be",
  password: "secret",
  user: "admin",
};

const pathToModels = "/home/ubuntu/loopback-app/common/models";

const models = require('loopback-data-juggler-standalone')( connector, pathToModels );

models.MyModel.findOne({
  where: { id: 55 },
  fields: { type: true, timestamp: true },
  include: [ "relation1", "relation2" ]
}).then((res) => {
  console.log( JSON.stringify( res, null, 2 ) );
});
```

The `connector` specification is as described [here](https://loopback.io/doc/en/lb3/Defining-data-sources.html).  The `pathToModels` can
be a path in the file system to the models directory created in a loopback app, typically "common/models", or it can be an array of loopback model
definitions as described [here](https://loopback.io/doc/en/lb3/Customizing-models.html).

Discovery is also supported, and is triggered if you do not supply a second argument to this module.  In this case, an attempt is made to
discover the models from just inspecting the database.  This is somewhat limited however in regards to relations.  It handles `belongsTo`
relations so long as you explicity describe your foreign keys and what they point to when you design the database schema.  In addition, this module
cannot inflate and deflate "object" columns, since those are done only if a schema is known.
 
Also in this mode, the call is asynchronious and returns a promise, so the usage is a little different:

```js
const db = require('loopback-data-juggler-standalone');
db(connector).then((models) => {
  models.MyModel.findOne({
    where: { id: 55 },
    fields: { type: true, timestamp: true },
  }).then((res) => {
    console.log( JSON.stringify( res, null, 2 ) );
  });
});
```

You can make the relations situation better in discovery mode by passing in a third argument, a partial schema where each model has "relations" 
but no "properties".  Like so:

```js
const db = require('loopback-data-juggler-standalone');

const relations = [
  {
    "name": "Config",
    "relations": {
      "State": {
        "type": "hasOne",
        "model": "State",
        "foreignKey": "configId"
      }
    }
  }
];

db( connector, null, relations ).then((models) => {
  models.Config.findOne({
    where: { id: 55 },
    include: "State"
  }).then((m) => {
    console.log( JSON.stringify( m, null, 2 ) );
    process.exit(0);
  }).catch((err) => {
    console.log(err);
    process.exit(1);
  });
}).catch((err) => {
  console.log(err);
  process.exit(1);
});
```

See the Loopback documentation for how to describe relations.
