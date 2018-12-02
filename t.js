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
const pathToModels = "/Users/peebles/smart-monitor/backend/db-server/common/models";

const models = require('./index')( connector, pathToModels );
models.config.findOne({
  where: { deviceId: "sm01" },
  include: ["state", "gadget"]
}).then((m) => {
  console.log( JSON.stringify( m, null, 2 ) );
  process.exit(0);
}).catch((err) => {
  console.log(err);
  process.exit(1);
});
