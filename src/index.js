const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors')

const app = express();

app.use(bodyParser.json({limit: '15mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '15mb', extended: true}));
app.use(cors())
app.options('http://localhost:3000', cors())

require("./app/controllers/index")(app);

app.listen(process.env.PORT || 3003);
