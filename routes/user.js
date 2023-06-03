var express = require('express');
var router = express.Router();

/* GET home page. */
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
  
  res.render('index', { products })
});

module.exports = router;
