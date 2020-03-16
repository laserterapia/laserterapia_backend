const mongoose = require("mongoose");
const { user, password } = require("../config/mongo.json");

const uri = `mongodb+srv://${user}:${password}@clusterlaserterapia-uastv.gcp.mongodb.net/test?retryWrites=true&w=majority`;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("connected to database"))
  .catch(error => console.log(error));

mongoose.Promise = global.Promise;

module.exports = mongoose;

// const mongoose = require("mongoose");

// mongoose.connect("mongodb://localhost/noderest", { useNewUrlParser: true });
// mongoose.Promise = global.Promise;

// module.exports = mongoose;
