const
  fs = require('fs'),
  Koa = require('koa'),
  app = new Koa(),
  router = require('koa-router')(),
  bodyMW = require('koa-body')(),
  lusca = require('koa-lusca'),
  enforceHttps = require('koa-sslify'),
  serveStatic = require('koa-static'),
  indexLocation = __dirname + '/dist/index.html',
  port = process.env.PORT || 3000,
  isProduction = process.env.NODE_ENV === 'production';

const
  email1 = 'a@b.com',
  email2 = 'c@d.com',
  password1 = '1234',
  password2 = '12345'

// Variable that caches contents of index.html
// Saves some disk IO
// Restart server to bust the cache

if(isProduction) {
  app.use(enforceHttps({ trustProtoHeader: true }));

  app.use(lusca({
    hsts: { maxAge: 31536000, includeSubDomains: true },
    xframe: 'DENY',
    csp: {
      policy: 'block-all-mixed-content'
    }
  }));
}

router
  .post('/auth', function *(next){
    const email = this.request.body.email;
    const password = this.request.body.password;

    if(
      (email == email1 || email == email2) &&
      (password == password1 || password == password2)
    ) {
      this.status = 200;
      this.body = JSON.stringify({});
    }
    else {
      this.status = 422;
      this.body = JSON.stringify({});
    }
  });

app
  .use(bodyMW)
  .use(router.routes())
  .use(router.allowedMethods())
  .use(serveStatic(__dirname + '/dist'));

function getIndexBody() {
  return new Promise(function (resolve, reject) {
    fs.readFile(indexLocation, {'encoding': 'utf8'}, function (err, data) {
      if(err) return reject(err);
      resolve(data);
    });
  });
}

app.use(async ctx => {
  const body = await getIndexBody();
  ctx.body = body;
})

app.listen(port);

console.log('App listening on: ' + port);
