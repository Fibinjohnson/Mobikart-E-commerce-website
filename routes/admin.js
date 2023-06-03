var express = require('express');
var router = express.Router();
var productHelpers=require("../helpers/product-herpers");
const fileUpload=require("express-fileupload");

/* GET users listing. */
router.get('/', function(req, res, next) {
  let products=[
    {
      name:"IPHONE 11 PRO",
      Category:"Mobile",
      description:"This is a good phone",
      image:"https://img2.gadgetsnow.com/gd/images/products/additional/large/G390830_View_1/mobiles/smartphones/apple-iphone-14-pro-256-gb-deep-purple-6-gb-ram-.jpg"
    },
    {
      name:"samsung s22 ultra",
      Category:"Mobile",
      description:"This is a good phone",
      image:"https://images.samsung.com/in/smartphones/galaxy-s23-ultra/buy/product_color_green.png?imwidth=480"
    },
    {
      name:"vivo  v5 PRO",
      Category:"Mobile",
      description:"This is a good phone",
      image:"https://img1.gadgetsnow.com/gd/images/products/additional/large/G313386_View_1/mobiles/refurbished-mobiles/refurbished-vivo-v5-space-grey-32gb-4gb-ram-.jpg"
    },
    {
      name:"Redmi Note 9  PRO",
      Category:"Mobile",
      description:"This is a good phone",
      image:"https://img1.gadgetsnow.com/gd/images/products/additional/large/G226361_View_1/mobiles/smartphones/xiaomi-redmi-note-10-pro-128-gb-vintage-bronze-8-gb-ram-.jpg"
    }
  ]

  res.render('Admin/add-products', {admin:true ,products});
});
router.get('/add-products',(req,res)=>{
  res.render('Admin/add-product-form'
  )
});
router.post("/add-products",(req,res)=>{
   console.log(req.body)
  productHelpers.addProducts(req.body,((image)=>{
    console.log(image);
    imageInPath=req.files.customFile;
    console.log(imageInPath);
    console.log(image);
    imageInPath.mv("./public/images/"+image+".jpg",(err=>{
      if(!err){res.render('Admin/add-products')
      }
      else console.log(err)
    }))
    
    }));
})

module.exports = router;
