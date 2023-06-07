const { MongoClient } = require('mongodb');

async function connectToDB() {
  const uri = 'mongodb://127.0.0.1:27017'; // Update with your MongoDB connection string
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("connection.js clear")
    const database = client.db('shopping'); // Update with your database name
    
    return database;
  } catch (error) {
    console.error('Error connecting to the database', error);
    throw error;
  }
}

module.exports = {
  connectToDB
};




