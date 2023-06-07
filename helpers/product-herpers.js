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
  listAdminProducts:()=>{ return new Promise(async(resolve,reject)=>{
   const database=await connectToDB()
   let adminProducts=  database.collection(collection.COLLECTION_NAME).find().toArray()
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
  }
  
};




