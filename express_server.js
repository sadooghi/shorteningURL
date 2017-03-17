const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["ghazaleh"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
const bcrypt = require('bcrypt');

let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca"
  },

  "9sm5xK": {
    longURL: "http://www.google.com"
  }
};

let userDatabase = {
  "dfs34d": {
    id: "dfs34d",
    email: "test@test.com",
    password: "test1user"
  },
  "rtg34d": {
    id: "rtg34d",
    email: "test2@test.com",
    password: "user2test"
  }
};


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

function checkemail (email){
  for(idnum in userDatabase){
    if(userDatabase[idnum].email === email){
      return true;
    }
  }
  return false;
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
  let user_id = req.session.user_id;
  let userurls = {};
  let templateVars = { urls: userurls , user: userDatabase[user_id]};

  if (templateVars.user === undefined){
    res.status(403).send("please log in or register first.")
  }else {
    for(shortURL in urlDatabase){
      if(urlDatabase[shortURL].userID === user_id){
        userurls[shortURL] = urlDatabase[shortURL];
      }
    }
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;
  let templateVars = {user: userDatabase[user_id]}
  if(user_id){
     res.render("urls_new", templateVars);
   }else{
    res.redirect("/login");
   }

});

app.get("/urls/:id", (req, res) => {
  let user_id = req.session.user_id;
  let templateVars = { shortURL: req.params.id , urls : urlDatabase, user: userDatabase[user_id]};
  for(idnum in userDatabase){
    if(urlDatabase[req.params.id].userID === idnum){
      res.render("urls_show", templateVars);
    }
  }
    res.status(401).send("only the owner (creator) of the URL can edit the link.")
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.session.user_id;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete",(req, res) => {
  for(idnum in userDatabase){
    if(urlDatabase[req.params.id].userID === idnum){
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
    }
  }
    res.status(401).send("only the owner (creator) of the URL can edit the link.")

})

app.post("/urls/:id",(req, res) => {
  urlDatabase[req.params.id] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect("/urls");
})

app.get("/u/:shortURL", (req, res) => {
  let record = urlDatabase[req.params.shortURL];
  res.redirect(record.longURL);
});

app.get("/login", (req, res) =>{
  let user = null;
  for(idnum in userDatabase){
    if(req.session.user_id === idnum){
      user = userDatabase[idnum];
    }
  }
  res.render("login", {user: user});
})

app.post("/login", (req, res) => {
  console.log("req.body",req.body);
  console.log(userDatabase);
  for(idnum in userDatabase){
  let pass= "";
  if(req.body.username === userDatabase[idnum].email){
    pass = userDatabase[idnum].password
    if(bcrypt.compareSync(req.body.password, pass)){
      req.session.user_id = idnum;
      res.redirect("/urls/new");
    }
  }
}
res.status(403);
res.redirect("/");
})

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls/new");
})

app.get("/register", (req, res) =>{
  res.render("register")
})

app.post("/register", (req, res) =>{
  if (req.body.email == "" || req.body.password == ""){
    res.status(400).send('Eror 400: Please fill both Email address and Password sections!');
    return;
  } else if(checkemail(req.body.email)){
    res.status(400).send('Error 400: this email address has been used before. If you have an account go to login page');
    return;
  }else{
    let newid = generateRandomString();
    let hashed_password = bcrypt.hashSync(req.body.password, 10);
    userDatabase[newid] = {};
    userDatabase[newid].id = newid;
    userDatabase[newid].email = req.body.email;
    userDatabase[newid].password = hashed_password;
    req.session.user_id = newid;
  }

  res.redirect("/login");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});






