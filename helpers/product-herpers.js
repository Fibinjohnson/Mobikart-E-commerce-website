const { connectToDB } = require("../config/connection");
const collection = require("./collection");

const { ObjectId } = require('mongodb');


module.exports = {
  addProducts: async (product, callBack) => {
    console.log(product);

    try {
      const database = await connectToDB();

      // Wait until the connection is ready
      await database.command({ ping: 1 });

      const collection = database.collection('Product'); 
      const result = await collection.insertOne(product);
        callBack( result.insertedId.toString());
    } catch (error) {
      console.error('Error adding product:', error);
    }
  },
  listAdminProducts:()=>{ 
    return new Promise(async(resolve,reject)=>{
   const database=await connectToDB()
   let adminProducts=  await database.collection(collection.COLLECTION_NAME).find().toArray()
   resolve(adminProducts)
   console.log(adminProducts);
  })
    
  },
  deleteProducts: (prodId) => {
    return new Promise(async (resolve, reject) => {
      console.log(prodId);
      try {
        const database = await connectToDB();
        const collect = database.collection(collection.COLLECTION_NAME);
        await collect
          .deleteOne({ _id: new ObjectId(prodId) })
          .then((response) => resolve(response));
      } catch (error) {
        reject(error);
      }
    });
  },
  editProducts:(prodId)=>{
    return new Promise(async(resolve,reject)=>{
      const database=await connectToDB();
      database.collection(collection.COLLECTION_NAME).findOne({_id:new ObjectId(prodId)}).then((product)=>{resolve(product)})
    })
  },
  updateProducts:(prodId,products)=>{
    return new Promise(async(resolve,reject)=>{
      const database=await connectToDB();
      database.collection(collection.COLLECTION_NAME).updateOne({_id:new ObjectId(prodId)},{$set:{
        name:products.name,
        description:products.description,
        category:products.category,
        price:products.price
      }
    }).then((product)=>resolve(product))
    })
  },
  doLogin:(data)=>{
    return new Promise(async(resolve,reject)=>{
      const database=await connectToDB();
      await database.collection("AdminData").findOne({email:data.email}).then((res)=>{
        console.log(data.password)
        if(res.password===data.password){
          response={}
          response=res;
          response.status=true;
          response.admin='Admin'
          resolve(response)
        }else{
          response.status=false;
          resolve(response)
        }
        
      })
    })
  },
  getUsers:()=>{
    return new Promise(async(resolve,reject)=>{
       const database=await connectToDB();
       await database.collection('users').find().toArray().then((response)=>{
        resolve(response)
        console.log(response,"response")
       })
    })
  },
  getOrders:()=>{
    return new Promise(async(resolve,reject)=>{
      const database=await connectToDB();
      const orderData = await database.collection('placeOrder').aggregate([
        {
          $lookup: {
            from: "users",
            let: { userId: "$userDetails.user" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$userId"] }
                }
              },
              {
                $project: { name: 1 }
              }
            ],
            as: "userData"
          }
        },
        {
          $unwind: "$userDetails"
        },
        {
          $unwind: "$userDetails.product"
        },
        {
          $lookup: {
            from: "Product",
            localField: "userDetails.product.prodid",
            foreignField: "_id",
            as: "products"
          }
        },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$userData.name" },
            totalAmount: { $first: "$userDetails.totalAmount" },
            status: { $first: "$userDetails.status" },
            MobileNo: { $first: "$delivaryDetails.mobileNo" },
            products: { $push: "$products" }
          }
        },
        {
          $project: {
            _id: 0,
            name: 1,
            totalAmount: 1,
            status: 1,
            MobileNo: 1,
            products: { $reduce: { input: "$products", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } }
          }
        }
      ]).toArray();
      
      console.log(orderData,"orderData")
      resolve(orderData)
      
    })
  }
  
};




