const express = require('express');
const { generateOTP } = require("../helpers/otp-generator")
const router = express.Router();
const products = require("../helpers/product-herpers")
const userHelper = require('../helpers/user-helper');
const verifyUser = (req, res, next) => {
  if (req.session.userloggedIn) {
    next()
  } else {
    redirect("/login")
  }
};


router.get('/', async (req, res, next) => {
  try {

    const product = await products.listAdminProducts();
    let user = req.session.user;
    console.log(user, "user")
    if (user) {
      let count = 0
      count = await userHelper.getCartCount(user._id);
      req.session.user.count=count;
      console.log(count, "count")
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
  console.log(req.session, "session")
  if (req.session.user) {
    res.redirect('/')
  } else
    res.render("users/login", { "error": req.session.userlogError, notHome: true })
  console.log("wrong")
  req.session.userlogError = false
})

router.get("/signup", (req, res) => {
  res.render("users/signup", { notHome: true })
})

router.post('/signup', async (req, res) => {
  const Email = req.body.email;
  const findEmail = await userHelper.findDuplication(Email)
  if (findEmail) {
    let messageEmail = "The Email address has already taken"
    res.render("users/signup", { messageEmail, notHome: true })
  } else {
    const Username = req.body.name;
    const otp = generateOTP()
    req.session.user = req.body;
    req.session.user.otp = otp;
    userHelper.sendVerification(Email, Username, otp)
    res.redirect("/otppage")
  }
}),

  router.get("/otppage", (async (req, res) => {
    res.render('users/otp', { notHome: true })
  })),

  router.post('/otpsubmit', (async (req, res) => {

    if (req.body.otp === req.session.user.otp) {
      userHelper.doSignup(req.session.user).then(async (data) => {
        req.session.user = data;
        req.session.userloggedIn = true;
        console.log(req.session.user, "want"),
          res.redirect("/")
      })
    }
    else {
      const message = "invalid otp";
      setTimeout(() => { res.redirect('/signup') }, 3000)
      res.render('users/otp', { message })
    }


  })),
  router.get('/resendOtp', ((req, res) => {
    res.redirect('/signup')
  })),
  router.post("/login", (req, res) => {
    userHelper.doLogin(req.body).then((data) => {
      console.log(data, "data")
      if (data.status) {

        req.session.user = data.user;
        req.session.userloggedIn = true;
        res.redirect("/")
      }
      else {
        req.session.userlogError = "Invalid username or Password";
        res.redirect("/login")}
    })
  })

router.get('/logout', async (req, res) => {
  req.session.user = null;
  res.redirect("/login")
})

router.get("/cart", verifyUser, async (req, res) => {
  try{
    
    if(req.session.user){
      const cart = await userHelper.AddToUsercart(req.session.user._id);
      console.log(cart, "cart");
      let amount = null;
      
      if (cart.length > 0) {
        amount = await userHelper.getAmount(req.session.user._id);
        console.log(amount, "amount");
        let user = await req.session.user;
        res.render('users/cart', { user, cart, amount });
      } else {
        res.render("users/emptyCart");
      }
    }else{
      res.redirect('/login')
    }
   
  }catch(error){
      console.log("cartEroor",error)
  }
  
  // console.log(user, "cartTime user");
  
  // if (user) {
  
  
});


router.get('/Add-Products-Cart/:id', async (req, res) => {
  try{
    if(req.session.user){
      console.log("call came")
      const userID=req.session.user._id;
      await userHelper.addProductsCart(userID, req.params.id).then(() => {
        res.json({ status: true })
      })
    }else{
      res.redirect('/')
    }
    
  }catch(error){
    console.log("add product error:",error)
  }

}),

  router.post("/change-quantity", async (req, res) => {
    console.log("req body", req.body)

    await userHelper.changeQuantity((req.body)).then(async (response) => {
      response.total = await userHelper.getAmount(req.body.user);
      res.json(response);
      console.log(response)

    })
  })

router.post("/remove", async (req, res) => {
  console.log("remove call invoked")
  await userHelper.remove(req.body).then((response) => { res.json(response) })
}),

  router.get("/placeOrderMsg", (async (req, res) => {
    res.render("users/orderPlaced");
  }))

router.get("/placeOrder", async (req, res) => {
  try{
    await userHelper.getAmount(req.session.user._id).then((total) => res.render("users/place-Order", { total, user: req.session.user }))
  }catch(error){
    console.log('error',error)
  }
  

})

router.post("/placeOrder", async (req, res) => {
  try {
    const product = await userHelper.getCartProducts(req.body.userId);
    const totalAmount = await userHelper.getAmount(req.body.userId);

    await userHelper.placeOrder(req.body, product, totalAmount).then((orderID) => {

      if (req.body.paymentMethod === "COD") {
        res.json({ codSuccess: true })
      } else {
        userHelper.razorPayIntegration(orderID, totalAmount).then((response) => {
          res.json({ response })
        })
      }

    });

  } catch (error) {
    
    console.error(error);
    res.status(500).send("Error placing the order.");
  }

});
router.get("/orders", async (req, res) => {
  try{
    if(req.session.user){
      const UserId = req.session.user._id
      const product = await userHelper.listProducts(UserId);
    
      console.log(product, "product")
      res.render("users/orderList", { user: req.session.user, product })
    }else{
      res.redirect('/login')
    }
   
  }catch(error)
  {
    console.log("get orders error:",error)
  }
}),

  router.get("/orders/:prod_id", async (req, res) => {
    const prodId = req.params.prod_id
    let user = req.session.user;
    console.log(prodId)
   await userHelper.getPlacedProducts(prodId).then((placedOrderList)=>{
    console.log(placedOrderList[0])
    res.render("users/orderedProductList",{placedOrderList,user})
   })
   

  }),
  router.post("/verify-payment", (async (req, res) => {
    userHelper.verifyPayment(req.body).then(() => {
      userHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {
        res.json({ status: true })
      })
    }).catch((err) => {
      res.json({ status: false })
    })
  }))

  router.post("/search",(async(req,res)=>{
    const user=req.session.user;
    console.log(req.body)
   const SearchList= await userHelper.searchProducts(req.body)
   console.log(SearchList,"SearchList")
   let count =req.session.user.count;
   res.render("users/searchResults",{SearchList,user,count})
  }))


module.exports = router;
