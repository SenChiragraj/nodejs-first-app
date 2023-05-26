import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose.connect("mongodb://127.0.0.1:27017",{
  dbName : "backend",
}).then((c) => console.log("DataBase Connected"))
  .catch((e) => console.log(e));

  const UserSchema = mongoose.Schema({
    name : String,
    email: String,
    password : String,

  })

var mainName;
const User = mongoose.model("Message",UserSchema);

const app = express();
// const users = [];

app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended : true}))
app.use(cookieParser());
//Setting up View Engine
app.set("view engine","ejs");

const isAunthenticated = async(req,res,next)=>{
  const {token} = req.cookies;
  if(token){
    const decoded = jwt.verify(token,"djfgjevfsf");
    // console.log(decoded);
    req.user = await User.findById(decoded._id);
    next();
  }
  else
    res.render("llogin")
}
app.get("/",isAunthenticated,(req,res)=> {
  // res.send("Hi");
  // res.sendStatus(500);
  // console.log(req.user);
  res.render("logout",{name : req.user.name});
})

app.post("/login", async(req,res) => {
  const {email,password} = req.body;
  let user = await User.findOne({email});

  if(!user) return res.redirect('/register');
  const isMatch = bcrypt.compare(password,user.password);

  if(!isMatch) return res.render('llogin',{email,message : "Incorrect Password"});
  const token = jwt.sign({_id:user._id},"djfgjevfsf");
  // console.log(token);
  res.cookie("token",token,{
    httpOnly: true,
    expires : new Date(Date.now()+60*1000),
  });
  res.redirect("/");
});


app.get("/register",(req,res)=> {
  res.render("register");
})

app.post("/register",async(req,res) => {

  // console.log(req.body);
  const {name , email,password} = req.body;
  mainName = name;
  let user = await User.findOne({email})
  if(user){
    return res.redirect("/login")
  }
  const hashedPassword = await bcrypt.hash(password,10);

  user = await User.create({name,email,password:hashedPassword});
  // .then(() => {console.log("Success")}).catch((e)=> console.log(e));
  const token = jwt.sign({_id:user._id},"djfgjevfsf");
  // console.log(token);
  res.cookie("token",token,{
    httpOnly: true,
    expires : new Date(Date.now()+60*1000),
  });
  res.redirect("/");
})
app.post("/logout",(req,res)=> {
  res.cookie('token',null,{
    expires: new Date(Date.now()),
  })
  res.redirect("/")
})

app.get('/login',(req,res) => {
  res.render('llogin');
})

app.listen(5000,() => {
  console.log("Server Running");
});