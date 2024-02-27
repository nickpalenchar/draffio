const { handler } = require('./getCode');

handler({ body: '{"path": "@draffio/hello-world" }'}).then(result => (console.log(result)))