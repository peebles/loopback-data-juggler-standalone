const connector = {
  "host": "192.168.99.100",
  "port": 5432,
  "url": "",
  "database": "be",
  "password": "secret",
  "name": "postgres",
  "user": "admin",
  "connector": "postgresql"
};

const relations = [
  {
    "name": "Config",
    "relations": {
      "gadget": {
        "type": "belongsTo",
        "model": "Gadget",
        "foreignKey": "gadgetId"
      },
      "state": {
        "type": "hasOne",
        "model": "State",
        "foreignKey": "deviceId"
      }
    }
  }
];

const db = require('./index');

db( connector, null, relations ).then((models) => {
  models.Config.findOne({
    where: { deviceId: "sm01" },
    include: ["gadget", "state"]
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

