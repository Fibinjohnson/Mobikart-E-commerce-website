var express = require('express');
var router = express.Router();
var products=require("../helpers/product-herpers")
var userSignup=require('../helpers/user-helper');
const session = require('express-session');

/* GET home page. */
router.get('/', function(req, res, next) {
 products.listAdminProducts().then((product)=>{
  let user=req.session.user
  res.render('users/index', { product ,user})
  
 })
  
 
});
router.get("/login",(req,res)=>{
  if(req.session.loggedIn) {
    res.redirect('/')
  }else
  res.render("users/login",{"error":req.session.logError})
  req.session.logError=false
  

}
)
router.get("/signup",(req,res)=>{
  res.render("users/signup")
}
)
router.post('/signup',(req,res)=>{
  userSignup.doSignup(req.body).then((data)=>console.log(data))
  

})
router.post("/login",(req,res)=>{
  userSignup.doLogin(req.body).then((data)=>{
    if(data.status){
      req.session.loggedIn=true;
      req.session.user=data.user;
     
      
      res.redirect("/")
  }
   else{
    req.session.logError="Invalid username or Password";
    res.redirect("/login")
   
    
   }})
})
router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect("/login")
})

module.exports = router;
