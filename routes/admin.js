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
    imageInPath=req.files.customFile;
    console.log(imageInPath);
   
    imageInPath.mv("./public/images/"+image+".jpg",(err=>{
      if(!err){res.redirect('/Admin')
      }
      else console.log(err)
    }))
    
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
  productHelpers.updateProducts(req.params.id,req.body).then((response)=>{console.log(response)})
}).id


module.exports = router;
