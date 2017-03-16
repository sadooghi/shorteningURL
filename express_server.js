const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(cookieParser());

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let userDatabase = {};

function generateRandomString() {
  let random = [];
  let choice = { 1: "num" , 2: "alphabet"};
  let alohbt = ["a","s","d","f","g","h","j","k","l","z","x","c","v","b","n","m","q","w","e","r","t","y","u","i","o","p"];
  for (let i =0; i < 6; i++){
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
    let templateVars = { urls: urlDatabase , username: req.cookies["username"]};
    res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {

  let templateVars = {username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id , urls : urlDatabase, username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  console.log(shortURL, req.body.longURL);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete",(req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})

app.post("/urls/:id",(req, res) => {
  console.log(req.params.id, req.body.longURL)
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
})

app.get("/u/:shortURL", (req, res) => {
  console.log(urlDatabase)
  let longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/login", (req, res) =>{
  res.render("login", {username: null});
})

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls/new");
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls/new");
})

app.get("/register", (req, res) =>{
  res.render("register")
})
function checkemail (email){
  console.log('userDatabase', userDatabase);
  for(idnum in userDatabase){
    console.log('idnum', idnum)
    if(userDatabase[idnum].email === email){
      return true;
    }
  }
  return false;
}
app.post("/register", (req, res) =>{
  if (req.body.email == "" || req.body.password == ""){
    res.status(400).send('Eror 400: Please fill both Email address and Password sections!');
    return;
  } else if(checkemail(req.body.email)){
    res.status(400).send('Error 400: this email address has been used before. If you have an account go to login page');
    return;
  }else{
    let newid = generateRandomString();
    userDatabase[newid] = {};
    userDatabase[newid].id = newid;
    userDatabase[newid].email = req.body.email;
    userDatabase[newid].password = req.body.password;
    console.log(userDatabase);
    res.cookie("user_id", newid);
  }
  res.redirect("/login");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





