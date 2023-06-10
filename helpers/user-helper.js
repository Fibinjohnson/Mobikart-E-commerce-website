const { connectToDB } = require("../config/connection");
const collection=require("./collection")
const bcrypt=require('bcrypt')
const{ObjectId}=require("mongodb")
module.exports={
doSignup:(userSignup)=>{
     return new Promise(async(resolve,reject)=>{
    userSignup.password= await bcrypt.hash(userSignup.password,10);
    userSignup.passwordconfirm= await bcrypt.hash(userSignup.password,10);
    const database= await connectToDB();
   database.collection(collection.userCollection).insertOne(userSignup).then((userData)=> resolve(userData.insertedId)
    )    
})},

doLogin: (userLogin) => {
    return new Promise(async (resolve, reject) => {
        let response={};
      try {
        const database = await connectToDB();
        const user = await database.collection(collection.userCollection).findOne({ email: userLogin.email });
        
        if (user) {
          bcrypt.compare(userLogin.password, user.password, (error, result) => {
            if (error) {
              console.log("Error occurred during password comparison:", error);
              resolve(false);
            } else {
              if (result) {
                console.log("Login successful");
                response.user=user;
                response.status=true;
                resolve(response);
              } else {
                console.log("Incorrect password");
                
                response.status=false;
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
        resolve(false);
      }
    });
  },
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
// console.log('Before find toArray');
// database.collection("newCart").find().toArray().then((res) => console.log(res));
// console.log('After find toArray');

if (userCart) {
let index=userCart.product.findIndex((product)=> { console.log("consoling indexof",product.prodid,new ObjectId(userProducts));return  userProducts==product.prodid} )
console.log(index)
     if(index!==-1){
      console.log("call invoked");
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
      if(cartCount){
        Count=cartCount.product.length;
        resolve(Count)
      }

    })
   },
  changeQuantity:(object)=>{
    // console.log("object",object)
    count=parseInt(object.count);
    
    return new Promise(async(resolve,reject)=>{
      const database=await connectToDB();
      await database
      .collection("newCart")
      .updateOne(
        {_id:new ObjectId(object.cart), "product.prodid": new ObjectId(object.product) },
        { $inc: { "product.$.prodIndex": count } }
      ).then(()=>{
       
        resolve(database.collection("newCart").findOne( {_id:new ObjectId(object.cart), "product.prodid": new ObjectId(object.product) }))
      })
    }
    )
  }
  


  
  
}