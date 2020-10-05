//
// Usage:
//
// const models = require( 'loopback-datasource-juggler-standalone' )( connector, pathToModels_Or_ArrayOfModels )
//
// models.mymodel.findOne({ where: {id: 5} }).then((inst) => {
//   console.log(JSON.stringify(inst,null,2));
// });
//
const DataSource = require( 'loopback-datasource-juggler' ).DataSource;
const ModelBuilder = require( 'loopback-datasource-juggler' ).ModelBuilder;
const _find = require( 'lodash.find' );
const fs = require( 'fs' );
const path = require( 'path' );

module.exports = function(connector, modelsPath, relations) {

  const dbSync = (models) => {
    const dataSource = models[Object.keys(models)[0]].getDataSource();
    return new Promise((resolve, reject) => {
      dataSource.isActual((err, actual) => {
        if (err) return reject(err);
        if (actual) return resolve('datasource is up to date');
        dataSource.autoupdate((err) => {
          if (err) return reject(err);
          return resolve('datasource updated');
        });
      });
    });
  }

  function haveModels() {
    // Create the schemas array by reading all of the .json files in the given path
    function loadSchemas( dirPath ) {
      let schemas = [];
      let files = fs.readdirSync( dirPath );
      files.forEach((f) => {
        if ( f.match(/\.json$/ ) ) {
          let s = require( path.join( dirPath, f ) );
          schemas.push( s );
        }
      });
      return schemas;
    }

    const modelBuilder = new ModelBuilder();
    let schemas;
    if ( modelsPath instanceof Array ) {
      schemas = modelsPath;
      modelsPath = relations;
    }
    else
      schemas = loadSchemas( modelsPath );
    const models = modelBuilder.buildModels( schemas );

    const dataSource = new DataSource( connector.name, connector );
    
    Object.keys( models ).forEach((modelName) => {
      dataSource.attach( models[modelName] );
    });
    Object.keys( models ).forEach((modelName) => {
      dataSource.defineRelations( models[modelName], _find( schemas, { name: modelName } ).relations || {} );
    });
    Object.keys( models ).forEach((modelName) => {
      let mn = modelName;
      console.log('modelName:', mn);
      mn = mn.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`).replace(/^-/, ''); // from internal camelcase back to fs
      let filename = `${path.join(modelsPath,mn)}.js`;
      if ( fs.existsSync(filename) ) {
        // have to noop stuff that does not exist outside of loopback
        models[modelName].remoteMethod = function(){};
        models[modelName].beforeRemote = function(){};
        require( path.join(modelsPath,mn) )(models[modelName]);
      }
    });

    return models;
  }

  if ( modelsPath && connector.sync !== undefined && connector.sync === true ) {
    let models = haveModels();
    let keys = Object.keys(models);
    if ( ! keys.length ) return Promise.reject(new Error('There are no model definitions to sync!'));
    return dbSync(models).then((status) => {
      return {status, models};
    });
  }
  else if ( modelsPath ) return haveModels();
  else {
    // discovery mode
    const dataSource = new DataSource( connector.name, connector );
    return Promise.resolve().then(() => {
      return dataSource.discoverModelDefinitions();
    }).then((tables) => {
      let dbmodels = [];
      let promises = tables.map((table) => {
        return new Promise((resolve, reject) => {
          dataSource.discoverAndBuildModels( table.name, { relations: true }, (err, models) => {
            if ( err ) return reject( err );
            for (const modelName in models) {
              dbmodels[modelName] = models[modelName];
            }
            resolve();
          });
        });
      });
      return Promise.all(promises).then(() => {
        return dbmodels;
      }).then((models) => {
        if ( ! relations ) return models;
        Object.keys( models ).forEach((modelName) => {
          let model = _find( relations, { name: modelName } ) || {};
          dataSource.defineRelations( models[modelName], model.relations || {} );
        });
        return models;
      });
    });
  }
}
