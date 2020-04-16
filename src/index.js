const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors')

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.options('http://localhost:3001', cors())

require("./app/controllers/index")(app);

app.listen(3000);
