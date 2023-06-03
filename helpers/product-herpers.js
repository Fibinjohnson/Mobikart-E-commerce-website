const { connectToDB } = require("../config/connection");

module.exports = {
  addProducts: async (product, callBack) => {
    console.log(product);

    try {
      const database = await connectToDB();

      // Wait until the connection is ready
      await database.command({ ping: 1 });

      const collection = database.collection('Product'); // Specify the collection name here
      const result = await collection.insertOne(product);
        callBack( result.insertedId.toString());
    } catch (error) {
      console.error('Error adding product:', error);
    }
  }
};




