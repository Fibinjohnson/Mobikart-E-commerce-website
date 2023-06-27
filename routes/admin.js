var express = require('express');
var router = express.Router();
var productHelpers=require("../helpers/product-herpers");


/* GET users listing. */
router.get('/', function(req, res, next) {
productHelpers.listAdminProducts().then((product)=>{
  res.render('Admin/add-products', {admin:true ,product});
})
});
router.get('/add-products',(req,res)=>{
  res.render('Admin/add-product-form'
  )
});
router.post("/add-products",(req,res)=>{
   
  productHelpers.addProducts(req.body,((image)=>{
    console.log(image);
   if(req.files && req.files.customFile){
    req.files.customFile.mv("./public/images/"+image+".jpg",(err=>{
      if(!err){res.redirect('/Admin')
      }
      else console.log(err)
    }))}
    
    }));
})
router.get("/delete-Product/:id", (req, res) => {
  const prodId = req.params.id;
  console.log('Received prodId:', prodId);
  productHelpers.deleteProducts(prodId)
     .then(() => res.redirect("/Admin"))
     .catch((error) => {
        console.error(error);
        res.redirect("/error-page"); 
     });
});
router.get('/edit-Product/:id',(req,res)=>{
  const prodId=req.params.id;
  productHelpers.editProducts(prodId).then((product)=>res.render("Admin/edit-product",{product,prodId}))

})
router.post('/edit-products/:id',(req,res)=>{
  productHelpers.updateProducts(req.params.id,req.body).then(()=>{
    // res.redirect("/Admin")
    if(req.files && req.files.customFile){
      req.files.customFile.mv("./public/images/"+req.params.id+".jpg")
    }else{
      res.redirect("/Admin")
    }
  })
});
router.get("/login", (req, res) => {
  console.log(req.session,"session")
  if (req.session.user) {
    res.redirect('/')
  } else
    res.render("Admin/adminLogin",{ "error": req.session.userlogError })
    console.log("wrong")
    req.session.userlogError = false


});
router.post("/login",(async(req,res)=>{
  console.log(req.body);
  productHelpers.doLogin(req.body).then(()=>{})
}))


module.exports = router;
// , 