
ShowRoutes = {};

ShowRoutes.log = function () {
  var routes = [];
  Router.routes.forEach( function (r) {
    routes.push({name: r.getName(), path: r._path})
  });
  console.table(routes)
}
