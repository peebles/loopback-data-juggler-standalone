// Test booting a database, and syncing changes
const connector = {
  sync: true,
  name: "postgres",
  connector: "postgresql",
  host: "192.168.99.100",
  port: 5432,
  url: "",
  database: "be",
  password: "secret",
  user: "admin",
};
const pathToModels = require('path').resolve('./models');
console.log( 'Models in:', pathToModels );

const p = require('./index');
p(connector, pathToModels).then((res) => {
  console.log( res.status );
  const models = res.models;
  Object.keys(models).forEach((modelName) => {
    console.log( `=> ${modelName}` );
  });
  process.exit();
}).catch((err) => {
  console.log( 'Error:', err.message );
});

