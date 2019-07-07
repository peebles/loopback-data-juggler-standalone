'use strict';

module.exports = function(Gadget) {

  Gadget.deleteWhere = function( where, cb ) {
    if ( where.where ) where = where.where;
    Gadget.destroyAll( where, function() {
      return cb();
    });
  }

  Gadget.remoteMethod('deleteWhere', {
    isStatic: true,
    description: 'Delete all matching records',
    accessType: 'WRITE',
    accepts: {arg: 'where', type: 'object', description: '{"where": ...}'},
  });

};
