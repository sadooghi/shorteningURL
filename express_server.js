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
  let user_id = req.cookies.user_id;
    let templateVars = { urls: urlDatabase , user: userDatabase[user_id]};
    res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  let user_id = req.cookies.user_id;
  let templateVars = {user: userDatabase[user_id]}
  if(user_id){
     res.render("urls_new", templateVars);
   }else{
    res.redirect("/login");
   }

});

app.get("/urls/:id", (req, res) => {
  let user_id = req.cookies.user_id;
  let templateVars = { shortURL: req.params.id , urls : urlDatabase, user: userDatabase[user_id]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req);
  let shortURL = generateRandomString();
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
  let user = null;
  for(idnum in userDatabase){
    if(req.cookies.user_id === idnum){
      user = userDatabase[idnum];
    }
  }
  res.render("login", {user: user});
})

app.post("/login", (req, res) => {
  let checking = false;
  for(idnum in userDatabase){
    if(req.body.username === userDatabase[idnum].email && req.body.password === userDatabase[idnum].password) {
      res.cookie("user_id" , idnum);
      checking = true;
      res.redirect("/urls/new");
    }
  }
  if(!checking) {
    res.status(403);
    res.redirect("/");
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls/new");
})

app.get("/register", (req, res) =>{
  res.render("register")
})
function checkemail (email){
  for(idnum in userDatabase){
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
    res.cookie("user_id", newid);
  }
  res.redirect("/login");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





