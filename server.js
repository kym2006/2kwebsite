let login = true;
console.log(__dirname);
const bcrypt = require('bcrypt')
let fs = require("fs");
const express = require("express");
const cors = require("cors");
const router = express.Router();
var app = express()
let bodyParser = require("body-parser");
const zeroPad = (num, places) => String(num).padStart(places, "0");
app.use(bodyParser());

router.get("/", (request, response) => {
  response.render(__dirname + "/views/index.ejs");
});

router.get("/homework", (request, response) => {
  if (!login) response.render(__dirname + "/views/login.ejs");
  response.render(__dirname + "/views/homework.ejs");
});

router.get("/login", (request, response) => {
  response.render(__dirname + "/views/login.ejs");
});


router.post('/register', async (request, response) => {
  let email = request.body.email
  let password = request.body.password
  const hashpw = await bcrypt.hash(request.body.password, 10)
  let jsonString;
  fs.readFile(__dirname + "/db.json", "utf8", (err, tmp) => {
    if(err) {
      return;
    }
    jsonString = tmp
  })
  const data = JSON.parse(jsonString)
  if(email in data) {
    console.log("Already inside")
  }
  data[email] = hashpw
  fs.writeFile(__dirname + "/db.json", "utf8", (err, tmp) => {
    if(err){
      return;
    }
    
  })
})

router.post("/login", async (request, response) => {
  let email = request.body.email; // wait are you doing quick.db
  const hashpw = await bcrypt.hash(request.body.password,10)
  fs.readFile(__dirname + "/db.json", "utf8", (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    console.log("File data:", jsonString);
    try {
      const data = JSON.parse(jsonString);
      console.log(data)
      console.log("User pw is:", data[email]); 
    } catch (err) {
      console.log("Error parsing JSON string:", err);
    }
  });
});

router.get("/logs", (request, response) => {
  if (!login) response.render(__dirname + "/views/login.ejs");
  let content = fs.readFileSync(__dirname + "/logs.txt").toString();
  let msgs = content.split("\n");
  content = "<div>";
  for (let i = 0; i < msgs.length - 1; i++) {
    msgs[i] = msgs[i].toString();
    content += '<div class="container">';
    let idx = msgs[i].length - 20;
    content += "<p>" + msgs[i].slice(0, idx) + "<p>";
    let ti = msgs[i].slice(idx, msgs[i].length);
    content += '<span class="time-right">' + ti + "</span>";
    content += "</div>";
  }
  content += "</div>";
  response.render(__dirname + "/views/logs.ejs", { stuff: content });
});

router.post("/message", function(req, res, next) {
  let content = req.body.message;
  console.log(content);
  if (content == "") {
    return;
  }
  content = content.toString();
  content = content.split("<").join(">");
  console.log(content);
  var d = new Date();
  content +=
    zeroPad(d.getDate().toString(), 2) +
    "/" +
    zeroPad(d.getMonth().toString(), 2) +
    "/" +
    d.getFullYear().toString() +
    "  " +
    zeroPad((d.getHours() + 8) % 24, 2) +
    ":" +
    zeroPad(d.getMinutes(), 2) +
    ":" +
    zeroPad(d.getSeconds(), 2);
  content += "\n";
  console.log(content);
  fs.appendFile(__dirname + "/logs.txt", content, function(err) {
    if (err) throw err;
    console.log("Saved!");
  });
  res.redirect("/logs");
});

app.use("/", router);

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
