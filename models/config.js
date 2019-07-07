'use strict';

module.exports = function(Config) {

  Config.deleteWhere = function( where, cb ) {
    if ( where.where ) where = where.where;
    Config.destroyAll( where, function() {
      return cb();
    });
  }

  Config.remoteMethod('deleteWhere', {
    isStatic: true,
    description: 'Delete all matching records',
    accessType: 'WRITE',
    accepts: {arg: 'where', type: 'object', description: '{"where": ...}'},
  });

};
