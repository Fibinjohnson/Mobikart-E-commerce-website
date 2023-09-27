var express = require('express');
var router = express.Router();
var productHelpers=require("../helpers/product-herpers");


/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.admin){
    const Details=req.session.admin;
    productHelpers.listAdminProducts().then((product)=>{
      res.render('Admin/add-products', {admin:true ,product ,Details});
    })
  }else{
    res.redirect('/Admin/login')
  }

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
    if(req.files && req.files.customFile){
      req.files.customFile.mv("./public/images/"+req.params.id+".jpg")
    }else{
      res.redirect("/Admin")
    }
  })
});
router.get("/login", (req, res) => {
 
  if (req.session.admin) {
    res.redirect('/Admin')
  } else
    res.render("Admin/adminLogin",{ "error": req.session.adminlogError })
    req.session.adminlogError = false


});
router.post("/login",(async(req,res)=>{
  console.log(req.body);
  productHelpers.doLogin(req.body).then((data)=>{
    
    if(data.status){
      req.session.admin=data;
      res.redirect("/Admin")
    }else{
      req.session.adminlogError="invalid password";
      res.redirect('/Admin/login')
    }
  })
}));
router.get("/logout",((req,res)=>{
  req.session.admin=null;
  res.redirect('/Admin/login')
  
}))
router.get("/users",(async(req,res)=>{
  productHelpers.getUsers().then((users)=>{
   
    const processedUsers = users.map(user => {
    const nameParts = user.name.trim().split(' ');
  return {
    ...user,
    firstName: nameParts.shift(),
    lastName: nameParts.join(' ')
  };
});
   const Details=req.session.admin;
   res.render('Admin/usersList',{ admin:true ,processedUsers,Details})
  })
})),
router.get("/orders",(async(req,res)=>{
  productHelpers.getOrders().then((orders)=>{
    const Details=req.session.admin;

    res.render('Admin/orderList',{ admin:true ,Details,orders})
  })
}))
module.exports = router;