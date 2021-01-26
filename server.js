const express = require("express");
const app = express();
const db = require("./config/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Database Connection
db.connect((err) => {
  if (err) throw err;
  console.log("Database Connected");
});

// MiddleWare
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

//Routes
app.post("/signup", async (req, res) => {
  let emailFound = await db
    .get()
    .collection("user")
    .find({ email: req.body.email })
    .toArray();
  let token;
  if (emailFound.length <= 0) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    db.get()
      .collection("user")
      .insertOne(req.body)
      .then((response) => {
        delete response.ops[0].password;
        token = jwt.sign(response.ops[0], process.env.JWT_SECRET, {
          expiresIn: "30d",
        });
        res.cookie("userToken", token, {
          httpOnly: true,
          expires: new Date(Date.now() + 5184000000),
        });
        res.json({ login: true, user: response.ops[0] });
      });
  } else {
    res.json({ login: false, err: "Email Id Already Registerd" });
  }
});

app.post("/login", async (req, res) => {
  let emailFound = await db
    .get()
    .collection("user")
    .findOne({ email: req.body.email });
  if (emailFound) {
    bcrypt.compare(req.body.password, emailFound.password, (err, status) => {
      if (err) return res.sendStatus(500);
      if (status) {
        delete emailFound.password;
        token = jwt.sign(emailFound, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });
        res.cookie("userToken", token, {
          httpOnly: true,
          expires: new Date(Date.now() + 5184000000),
        });
        res.json({ login: true, user: emailFound });
      } else {
        res.json({ login: false, err: "Invalid Email or Password" });
      }
    });
  } else {
    res.json({ login: false, err: "Invalid Email or Password" });
  }
});

// Server setup
const PORT = process.env.PORT || 3001;
app.listen(PORT);
