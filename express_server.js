const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let random = [];
  let choice = { 1: "num" , 2: "alphabet"};
  let alohbt = ["a","s","d","f","g","h","j","k","l","z","x","c","v","b","n","m","q","w","e","r","t","y","u","i","o","p"];
  for (let i =0; i < 7; i++){
    if (choice[(Math.round(Math.random()) + 1).toString()] == "num"){
      random.push((Math.round(Math.random() * 10)));
    } else {
        random.push(alohbt[Math.round(Math.random() * 26)]);
    }
  }
  let result = random.join("");
  return result;
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // console.log("urls/new");
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id , urls : urlDatabase};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  // res.send("Ok");
  let shortURL = generateRandomString();
  console.log(shortURL, req.body.longURL);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete",(req, res) => {
  // console.log('clicked');
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
  // console.log("deleted");
})

app.post("/urls/:id",(req, res) => {
  res.redirect("/urls");
  console.log(req.params.id, req.body.longURL)
  urlDatabase[req.params.id] = req.body.longURL;
})

app.get("/u/:shortURL", (req, res) => {
  console.log(urlDatabase)
  let longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


