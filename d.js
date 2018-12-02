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

const db = require('./index');

db( connector ).then((models) => {
  models.Config.findOne({
    where: { deviceId: "sm01" },
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

