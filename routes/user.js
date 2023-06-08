var express = require('express');
var router = express.Router();
var products = require("../helpers/product-herpers")
var userSignup = require('../helpers/user-helper');

const userHelper = require('../helpers/user-helper');

/* GET home page. */
router.get('/', async function (req, res, next) {
  await products.listAdminProducts().then(async (product) => {
    let user = req.session.user
    if (user) {
      count = await userHelper.getCartCount(user._id)
    }
    res.render('users/index', { product, user, count })
  })
});
router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else
    res.render("users/login", { "error": req.session.logError })
  req.session.logError = false


}
)
router.get("/signup", (req, res) => {
  res.render("users/signup")
}
)
router.post('/signup', (req, res) => {
  userSignup.doSignup(req.body).then((data) => console.log(data), res.redirect("/login"))


})
router.post("/login", (req, res) => {
  userSignup.doLogin(req.body).then((data) => {
    if (data.status) {
      console.log('Setting req.session.loggedIn');
      req.session.loggedIn = true;
      console.log('Setting req.session.user');
      req.session.user = data.user;
      console.log('req.session.user:', req.session.user);
      console.log(data.user);
      res.redirect("/")
    }
    else {
      req.session.logError = "Invalid username or Password";
      res.redirect("/login")


    }
  })
})
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect("/login")
})
router.get("/cart", (async (req, res) => {
  const cart = await userHelper.AddToUsercart(req.session.user._id);
  console.log(cart, "oomb")
  let user = req.session.user
  res.render('users/cart', { user, cart })
}))
router.get('/Add-Products-Cart/:id', async (req, res) => {

  await userHelper.addProductsCart(req.session.user._id, req.params.id).then(() => {
    console.log(req.session.user._id, req.params.id);
    res.redirect("/")
  })
})
module.exports = router;
