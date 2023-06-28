const express = require('express');
const nodemailer = require("nodemailer");
const router = express.Router();
const products = require("../helpers/product-herpers")
const userHelper = require('../helpers/user-helper');
const verifyUser=(req,res,next)=>{
   if(req.session.userloggedIn){
     next()
   }else{
    redirect("/login")
   }
};
const generateOTP = () => {
  const OTP_LENGTH = 6;
  const charset = '0123456789';
  let otp = '';
  for (let i = 0; i < OTP_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    otp += charset[randomIndex];
  }
  return otp;
};

router.get('/', async (req, res, next) =>{
  try {
   
    const product = await products.listAdminProducts();
    let user =  req.session.user;
    if (user) {
      let count=0
       count = await  userHelper.getCartCount(user._id);
      console.log(count,"count")
      res.render('users/index', { product, user, count });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log("Error occurred:", error);
    next(error);
  }
});

router.get("/login", (req, res) => {
  console.log(req.session,"session")
  if (req.session.user) {
    res.redirect('/')
  } else
    res.render("users/login", { "error": req.session.userlogError })
    console.log("wrong")
  req.session.userlogError = false


}
)
router.get("/signup", (req, res) => {
  res.render("users/signup")
}
)
router.post('/signup', (req, res) => {
  userHelper.doSignup(req.body).then((data) =>{
      req.session.user = data;
      req.session.userloggedIn = true;
    console.log(data), 
    res.redirect("/login")
  } )


})
router.post("/login", (req, res) => {
  userHelper.doLogin(req.body).then((data)=>{
    console.log(data,"data")
    if (data.status) {
      
      req.session.user = data.user;
      req.session.userloggedIn = true;
      res.redirect("/")
    }
    else {
      req.session.userlogError = "Invalid username or Password";
      res.redirect("/login")


    }
  })
  
  
})
router.get('/logout', async(req, res) => {
   req.session.user=null;
   res.redirect("/login")
})
router.get("/cart",verifyUser, (async (req, res) => {
  const cart = await userHelper.AddToUsercart(req.session.user._id);
  console.log(cart, "cart");
  let amount=null;

  if(cart.length>0){
    amount=await userHelper.getAmount(req.session.user._id);
    console.log(amount,"amount")
  }
    
  let user =await req.session.user
  res.render('users/cart', { user, cart ,amount})
}))
router.get('/Add-Products-Cart/:id', async (req, res) => {
  console.log("call came")
  await userHelper.addProductsCart(req.session.user._id, req.params.id).then(() => {
     res.json({status:true})
  })
}),
router.post("/change-quantity",async(req,res)=>{
  console.log("req body",req.body)
  
  await userHelper.changeQuantity((req.body)).then(async(response)=>{
      response.total = await userHelper.getAmount(req.body.user);
       res.json(response);
       console.log(response)
     
  })
})
router.post("/remove",async(req,res)=>{
  console.log("remove call invoked")
  await userHelper.remove(req.body).then((response)=>{res.json(response)})
}),
router.get("/placeOrderMsg",(async(req,res)=>{
   res.render("users/orderPlaced");
}))
router.get("/placeOrder",async(req,res)=>{
  await userHelper.getAmount(req.session.user._id).then((total)=>res.render("users/place-Order",{total,user:req.session.user}))
   
})
router.post("/placeOrder", async (req, res) => {
  try {
    const product = await userHelper.getCartProducts(req.body.userId);
    const totalAmount = await userHelper.getAmount(req.body.userId);
   
    await userHelper.placeOrder(req.body, product, totalAmount).then((orderID)=>{
    
      if(req.body.paymentMethod==="cashOnDelivary"){
        res.json({codSuccess:true})
      }else{
        userHelper.razorPayIntegration(orderID,totalAmount).then((response)=>{
          res.json({response})
        })
      }
    
    });
   
  } catch (error) {
    // Handle any errors that occur during the order placement process
    console.error(error);
    res.status(500).send("Error placing the order.");
  }
  
});
router.get("/orders",async(req,res)=>{
 const UserId=req.session.user._id
 const product=await userHelper.listProducts(UserId);
 
 console.log(product,"product")
  res.render("users/orderList",{user:req.session.user,product})
 
 
}),
router.get("/orders/:prod_id",async(req,res)=>{
  const prodId=req.params.prod_id
  console.log(prodId) 
  
 }),
 router.post("/verify-payment",(async(req,res)=>{
  console.log(req.body['order[receipt]'],":.....j")
  userHelper.verifyPayment(req.body).then(()=>{
    userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    res.json({status:false})
  })
 }))
module.exports = router;
 