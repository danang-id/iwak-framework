# iwak-framework
A node micro-framework based on express.js


## Installation

Since this framework is published to npm, you can install this with the following command:

```shell
$ npm install --save iwak-framework
```

## Getting Started

> This is minimal configuration tutorial to make your project running.

First of all, you need to make a project structure like this:

```
.
├── app
│   ├── controllers
│   │   └── // your controller files lay down here
│   ├── libraries
│   ├── middleware
│   │   └── // your middleware files lay down here
│   ├── models
│   │   ├── // your data model files
│   ├── routes.js <-- this is file where you can define HTTP routes
│   └── views
│       └──  // your html files
├── config
│   ├── app.js 
│   ├── database.js
│   └── http.js
├── knexfile.js
├── npm_modules // you should learn node js first if you don't know this
├── migrations
│   └── // your migration files
├── package.json // you should learn node js first if you don't know this
├── public <-- directory for public and static files
├── server.js <-- main file
└── .env
```

Now, let check `config/app.js` file, it must contain an express configuration, i.e setting `Access-Control-Allow-Origin`. As expected, it only contains express middleware like this:

```diff
+ 'use strict';
+
+ module.exports = function (app) {
+  app.use(function(req, res, next) {
+    res.header("Access-Control-Allow-Origin", "*");
+    res.header("Access-Control-Allow-Headers", "X-Requested-With");
+    next();
+  });
+ };
```

Then, we'll focus on the file `config/database.js`. This file will be loaded by `iwak-framework` with `bookshelf` object, so you must write it as follows:

```diff
+ 'use strict';
+ module.exports = function (bookshelf) {
+
+ };
```

And, since it will retrieve `bookshelf` object, you can add plugins to it:

```diff
+ 'use strict';
+ module.exports = function (bookshelf) {
+   bookshelf.plugin('visibility');
+   bookshelf.plugin('pagination');
+ };
```

Now, for the file `config/http.js`. It contain a http server and will be loaded by `iwak-framework` with `express` object:

```diff
+ 'use strict';
+ const http   = require('http');
+ 
+ module.exports = function (app) {
+   const server = http.Server(app);
+ 
+   server.listen(env('APP_PORT', 3000), function () {
+     console.info('Listening on post 3000');
+   });
+ };
```

Ok, then in the file `server.js` where located in project root, we'll put this code to make the app running:

```diff
+ 'use strict';
+
+ const app = require('iwak-framework');
+
+ require('./app/routes');
+ require('./config/http')(app);
+ require('./config/boot');
```

> Wait, what is app/routes?

Sorry, I didn't forget, but now I will explain to you what is it.

`app/routes.js` will contain the http route code. For example, you can write:

```diff
+ 'use strict';
+
+ const Route = use('Route');
+
+ Route.group({namespace: 'api', prefix: '/api'}, (Route) => {
+
+   Route.get('/', 'ExampleController.index');
+
+ }).error('json');

```

> Then make another directory inside the `controller` with name `api` and create `ExampleController.js` inside it.

In the `ExampleController.js` write as follows:

```diff
+ 'use strict';
+
+ const Validator = use('Validator');
+ const Response  = use('Response');

+ class UserController {
+   constructor() {
+  }
+
+  index(req, res, next) {
+    let data = {
+       status: true,
+       data: {
+         foo: "bar"
+      }
+    }
+
+    return Response.success(res, data);
+   }
+ }
```

Finally, set the environment variable in the `.env` file:

```diff
+ NODE_ENV=development
+ 
+ APP_NAME=
+ APP_PORT=3000
+ APP_HOST=127.0.0.1
+ APP_DEBUG=true
+ APP_KEY=
+ 
+ DB_CLIENT=postgresql
+ DB_HOST=127.0.0.1
+ DB_PORT=
+ DB_DATABASE=
+ DB_USERNAME=
+ DB_PASSWORD=
+ DB_MIN_CONNECTION=1
+ DB_MAX_CONNECTION=
+ 
+ TOKEN_SECRET=secret
```

### Running server

```shell
$ node server.js
```

Done! Now you can access it via [http://localhost:3000/api/example](http://localhost:3000/api/example), it should return the following json:

```json
{
  "status": true,
  "data": {
    "foo": "bar"
  }
}
```

