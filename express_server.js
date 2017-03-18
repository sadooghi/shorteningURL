const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["ghazaleh"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const bcrypt = require('bcrypt');

let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    coutn: 0
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    count: 0
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
  let user_id = req.session.user_id;
  if(user_id){
     res.redirect("/urls");
   }else{
    res.redirect("/login");
   }
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
    res.status(401).send("please log in or register first. <a href=\"/login\">login here</a> ")
  }else {
    res.status(200);
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
    res.status(200);
     res.render("urls_new", templateVars);
   }else{
    res.status(401).send("please log in or register first. <a href=\"/login\">login here</a>")
   }

});

app.get("/urls/:id", (req, res) => {
  let user_id = req.session.user_id;
  let templateVars = { shortURL: req.params.id , urls : urlDatabase, user: userDatabase[user_id]};
  // if any one logged in
  if(user_id) {
      //if the short URL exists
      if(urlDatabase[req.params.id]) {
        //user is owner fo URL
        if(user_id == urlDatabase[req.params.id].userID) {
          res.render("urls_show", templateVars);
        }
        // not the owner
        else {
          res.status(403).send("you are not the owner of this short URL!")
        }
      }
      //if the short URL doesnt exist
      else {
        res.status(404).send("this is not a correct short URL.")
      }

  }
//if the user doesnt logged in
  else{
    res.status(401).send("please log in");
  }


});

app.post("/urls", (req, res) => {
  //if the user is logged in
  if(req.session.user_id){
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.session.user_id;
  urlDatabase[shortURL].count = 0;
  res.redirect(`/urls/${shortURL}`);


  }
  //if user is not logged in
  else{
    res.status(401).send("please login first")
  }

});

app.delete("/urls/:id",(req, res) => {
    if(urlDatabase[req.params.id].userID ){
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
    } else {
        res.status(401).send("only the owner (creator) of the URL can edit the link.")
    }
});

app.put("/urls/:id",(req, res) => {
  let check = false;
  //if the short URL exists
  if(urlDatabase[req.params.id]) {
    //if the user is logged in
    if(req.session.user_id){
      //if the user is the URL owner
      for(idnum in userDatabase){
        if(urlDatabase[req.params.id].userID === idnum){
          urlDatabase[req.params.id] = {longURL: req.body.longURL, userID: req.session.user_id};
          res.redirect(`/urls/${req.params.id}`);
          check = true;
        }
      }
      if(!check){
        //if the user isnt URL owner
        res.status(403).send("only the owner (creator) of the URL can edit the link.")
      }
    }
    // if the user isnt logged in
    else{
      res.status(401).send("please login first!")
    }

  }
  // if there is no such url
  else{
    res.status(404).send("the URL is not valid.")
    }
});


app.get("/u/:shortURL", (req, res) => {
  let record = urlDatabase[req.params.shortURL];
  //if the URL exists
  if(record){
    record.count +=1;
    res.redirect(record.longURL);
  }
  //if there is no such URL
  else{
    res.status(404).send("there URL does not exist")
  }
});

app.get("/login", (req, res) =>{
    if(userDatabase[req.session.user_id] ){
      res.redirect("/")
    } else {
      res.status(200);
      res.render("login");

    }
});

app.post("/login", (req, res) => {
  for (idnum in userDatabase) {
  let pass= "";
  if(req.body.username === userDatabase[idnum].email){
    pass = userDatabase[idnum].password
    if (bcrypt.compareSync(req.body.password, pass)) {
      req.session.user_id = idnum;
      res.redirect("/");
    }
  }
}
res.status(401).send("Email/Password is not valid.");
res.redirect("/");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.get("/register", (req, res) =>{
  if(userDatabase[req.session.user_id] ){
    res.redirect("/")
  } else {
    res.status(200);
    res.render("register");
  }
});

app.post("/register", (req, res) =>{
  if (req.body.email == "" || req.body.password == ""){
    res.status(400).send('Please fill both Email address and Password sections!');
    return;
  } else if(checkemail(req.body.email)) {
    res.status(400).send('this email address has been used before. If you have an account go to login page');
    return;
  } else {
    let newid = generateRandomString();
    let hashed_password = bcrypt.hashSync(req.body.password, 10);
    userDatabase[newid] = {};
    userDatabase[newid].id = newid;
    userDatabase[newid].email = req.body.email;
    userDatabase[newid].password = hashed_password;
    req.session.user_id = newid;
  }
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});






