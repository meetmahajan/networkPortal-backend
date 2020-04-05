const express = require('express');
const app = express();
let App = require('./app');
let Router = require('./router');
new App(app).setupMiddlewares();
new Router(app);
app.listen(3000, () => console.log(`App is listening on port 3000!`));