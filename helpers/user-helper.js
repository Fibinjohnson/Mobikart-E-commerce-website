const { connectToDB } = require("../config/connection");
const collection=require("./collection")
const bcrypt=require('bcrypt');
const{ObjectId}=require("mongodb")
const RazorPay=require("razorpay")
const nodemailer=require("nodemailer");
let instance = new RazorPay({ key_id: 'rzp_test_poYQA27SDAayai', key_secret: 'YuGH1sGwxlbs1mXWQLk103hj' })
require('dotenv').config();

module.exports={
doSignup:(userSignup)=>{
     return new Promise(async(resolve,reject)=>{
      
        userSignup.password= await bcrypt.hash(userSignup.password,10);
        userSignup.passwordconfirm= await bcrypt.hash(userSignup.password,10);
        const database= await connectToDB();
       database.collection(collection.userCollection).insertOne(userSignup).then((userData)=> resolve(userData.insertedId)) 
      
   
})},

doLogin: (userLogin) => {
  return new Promise(async (resolve, reject) => {
    let response = {};
    try {
      const database = await connectToDB();
      const user = await database.collection(collection.userCollection).findOne({ email: userLogin.email });

      if (user) {
        bcrypt.compare(userLogin.password, user.password, (error, result) => {
          if (error) {
            console.log("Error occurred during password comparison:", error);
            reject(error);
          } else {
            if (result) {
              console.log("Login successful");
              response.user = user;
             
              response.status = true;
              resolve(response);
            } else {
              console.log("Incorrect password");
              response.status = false;
             
              resolve(response);
            }
          }
        });
      } else {
        console.log("User not found");
        resolve(false);
      }
    } catch (error) {
      console.log("Error occurred during login:", error);
      reject(error);
    }
  });
}

,
 addProductsCart:(userId,userProducts)=>{return new Promise(async(resolve,reject)=>{
  const prodObj={
    prodid:new ObjectId(userProducts),
    prodIndex:1
  }
  const cart={
     user:new ObjectId(userId),
     product:[prodObj]
  }
    
const database=await connectToDB();
const userCart = await database.collection("newCart").findOne({ user: new ObjectId(userId) });
if (userCart) {
let index=userCart.product.findIndex((product)=> {
  return  userProducts==product.prodid
})

     if(index!==-1){
       await database
      .collection("newCart")
      .updateOne(
        {user:new ObjectId(userId), "product.prodid": new ObjectId(userProducts) },
        { $inc: { "product.$.prodIndex": 1 } }
      )
      .then((res) =>console.log("res",res), resolve())
      .catch((error) => {
        console.error("Error occurred during insertion:", error);
        reject(error); // Reject the promise if an error occurs
      });
    

      }else{
         console.log('Updating existing document');
         const collect = database.collection("newCart");
         collect.updateOne(
        { user: new ObjectId(userId) },
         {
        $push: { product: prodObj }
        }
       ).then(() => resolve());}
 
} else {
  
  await database.collection("newCart").insertOne(cart).then((res) => {
    resolve(res);
  });
}  

  }
  )},




  AddToUsercart:(userId)=>
  {
    return new Promise(async(resolve,reject)=>{
      try{
      const database=await connectToDB();
      const userCartData=await database.collection("newCart").aggregate([
        {
          $match:{user: new ObjectId(userId) }
        },
        {
          $unwind:"$product"
        },
        {
          $project:{
            item:"$product.prodid",
            index:"$product.prodIndex"
          }
        },{
          $lookup:{
            from:collection.COLLECTION_NAME,
            localField:"item",
            foreignField:"_id",
            as:"products"
          }
        },{
          $project:{
            item:1,index:1,product:{$arrayElemAt:['$products',0]}
          }
        }
      //  {
      //    $lookup:{
      //     from:collection.COLLECTION_NAME,
      //     let:{prodList:"$product"},
      //     pipeline:[
      //       {
      //         $match:{
      //           $expr:{
      //             $in:["$_id","$$prodList"]
      //           }
      //         }
      //       }
      //     ],as:"CartItem"
      //   }
      // }
      ]).toArray()
      console.log(userCartData,"this")
      resolve(userCartData)
     } catch (error) {
        reject(error);
      }              

  }
    )
  },
   getCartCount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      const database= await connectToDB();
      let Count=0;
      const cartCount=await database.collection("newCart").findOne({user:new ObjectId(userId)});
      console.log(cartCount,"cartCount")
      if(cartCount!=null){
        Count=cartCount.product.length;
        resolve(Count)
      }else{
        Count=0,
        resolve(Count)
      }

    })
   },
  changeQuantity:(object)=>{
    
   const  count=parseInt(object.count);
    quantity=parseInt(object.quantity)
    console.log(object,"objecthhhhhhh")
    
    return new Promise(async(resolve,reject)=>{
      const database=await connectToDB();

      if(count==-1 && quantity == 1){
        await database.collection("newCart").updateOne({_id:new ObjectId(object.cart)},
        {$pull:{product:{prodid:new ObjectId(object.product)}}}).then((response)=>resolve({removeStatus:true},console.log("wanted response",response)))
      }
      else
      {
        await database
        .collection("newCart")
        .updateOne(
          {_id:new ObjectId(object.cart), "product.prodid": new ObjectId(object.product) },
          { $inc: { "product.$.prodIndex": count } }
        ).then((response)=>{
         
          resolve({status:true})
        })
      }
    }
    )
  },
  

remove:(object)=>{

   return new Promise(async(resolve,reject)=>{
     const  database= await connectToDB();
     await database.collection("newCart").updateOne({_id:new ObjectId(object.cartId)},
    {$pull:{product:{prodid:new ObjectId(object.productId)}}}
    ).then((response)=>resolve(true))

   })
   
},
getAmount:(userId)=>{
  return new Promise(async(resolve,reject)=>{
    try{
      const database=await connectToDB();
      const totalAmount=await database.collection("newCart").aggregate([
        {
          $match:{user: new ObjectId(userId) }
        },
        {
          $unwind:"$product"
        },
        {
          $project:{
            item:"$product.prodid",
            index:"$product.prodIndex"
          }
        },{
          $lookup:{
            from:collection.COLLECTION_NAME,
            localField:"item",
            foreignField:"_id",
            as:"products"
          }
        },{
          $project:{
            item:1,index:1,product:{$arrayElemAt:['$products',0]}
          }
        },{
          $group:{_id:null,total:{$sum:{$multiply:[  "$index",
          { $toInt: { $replaceAll: { input: "$product.price", find: ",", replacement: "" } } }]}}}
        }
      ]).toArray()
      console.log(totalAmount,"this")
      let total = 0;
if (totalAmount.length > 0) {
  total = totalAmount[0].total || 0;
 
} resolve(total)
      
     } catch (error) {
        reject(error);
      } 
  })
},
getCartProducts:async(userId)=>{
  return new Promise(async(resolve,reject)=>{
    const database=await connectToDB();
    const cart= await database.collection("newCart").findOne({user:new ObjectId(userId)})
    resolve(cart.product)
  })
  
},
placeOrder:(order,product,amount)=>{
  return new Promise(async(resolve,reject)=>{
     console.log(order,product,amount)
     let status=order.paymentMethod==="COD"?"placed":"pending"
     const date = new Date();
     const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
     const formattedDate = date.toLocaleDateString('en-US', options);

      let orderObj={
        delivaryDetails:{
          name:order.name,
          address:order.address,
          mobileNo:order.mobile,
          pinCode:order.inputZip,
          formattedDate:formattedDate

        },
        userDetails:{
          user: new ObjectId(order.userId),
          paymentMethod:order.paymentMethod,
          product:product,
          status:status,
          totalAmount:amount,
        }
     }
     const database=await connectToDB();
     await database.collection("placeOrder").insertOne(orderObj).then((response)=>{
       database.collection("newCart").deleteOne({user:new ObjectId(order.userId)})
       resolve(response.insertedId)
       
      })
  })
},
listProducts:(userId)=>{return new Promise(async(resolve,reject)=>{
     const database=await connectToDB();
    const placedData=await  database.collection("placeOrder").find({"userDetails.user":new ObjectId(userId)}).toArray()
    console.log(placedData,"data")
    resolve(placedData)
})

},
getProducts:(prodID)=>{return new Promise(async(resolve,reject)=>{
  const database=await connectToDB();
  const product= database.collection("product").find({_id:new ObjectId(prodID)}).toArray()
  console.log(product)
  resolve(product)
})
 
},
razorPayIntegration:(orderId,totalAmount)=>{
 
  return new Promise(async(resolve,reject)=>{
    var options = {
      amount: totalAmount*100,  // amount in the smallest currency unit
      currency: "INR",
      receipt: ""+orderId
    };
    instance.orders.create(options, function(err, order) {
      if(err){
        console.log(err)
      }else{
        console.log(order,":order");
        resolve(order)
      }
      
    });
  })
},
verifyPayment: (details) => {
  return new Promise((resolve, reject) => {
    const crypto = require('crypto');
    let hmac = crypto.createHmac('sha256', 'YuGH1sGwxlbs1mXWQLk103hj');
    hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
    hmac = hmac.digest("hex");
    if (hmac === details['payment[razorpay_signature]']) {
      console.log("payment success")
      resolve();
     
    } else {
      console.log("error occured in payment verificaation")
      reject();
      
    }
  });



},
changePaymentStatus:(receipt)=>{
  return new Promise(async(resolve,reject)=>{
    const database = await connectToDB();
    database.collection("placeOrder").updateOne(
      { _id: new ObjectId(receipt) },
      { $set: { "userDetails.status": "placed" } }
    ).then((response) => {
      console.log(response);
      resolve();
    });
    
  })
},

sendVerification:(email,username,otp)=>{
  try{
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAILID,
        pass: process.env.PASSWORD,
      }
    });
    const mailOption = {
      from: process.env.EMAILID,
      to: email,
      subject: "for verification mail",
      html:
        "<p>Hii," +
        username +
        ",Your otp for login is <h1>" +
        otp +
        "</h1></p>",
    };
    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("email send", info.response);
        
      }
    });
  }catch(error){
     console.log(error)
  }
},
findDuplication:(Email)=>{
return new Promise(async(resolve,reject)=>{
   const db=await connectToDB();
   const findEmail=await db.collection("users").findOne({email:Email});
   resolve(findEmail)
  
})
},
searchProducts: async (product) => {
  return new Promise(async(resolve,reject)=>{
    const database = await connectToDB();
    const searchQuery = new RegExp(product.search, 'i');
   // 'i' flag for case-insensitive search
    const searchResults = await database.collection("Product").find({
      $or: [
        { name: searchQuery  },
        {category:searchQuery}
        
      ]
    }).toArray();
    resolve(searchResults) ;
  })

},
getPlacedProducts:(placedId)=>{
return new Promise(async(resolve,reject)=>{
  const database=await connectToDB();
     const placedOrderList= await database.collection('placeOrder').aggregate([
   {
     $match:{
      _id:new ObjectId(placedId)
     }
    },
    {
      $unwind:"$userDetails.product"
      
    },
    {
      $project:{
        item:"$userDetails.product.prodid",
        index:"$userDetails.product.prodIndex"
      }
    },{
      $lookup:
        {
          from: "Product",
          localField: 'item',
          foreignField: "_id",
          as: "placedProductsArray"
        }
    },
   {
    $project:{
      item:1,
      index:1,
      placedProducts:{$arrayElemAt:["$placedProductsArray",0]}
    }
   }
  ]).toArray()
  
resolve(placedOrderList)
})
}


  
  
}
