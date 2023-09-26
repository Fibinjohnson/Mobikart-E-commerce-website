const { MongoClient } = require('mongodb');

async function connectToDB() {
  const uri = 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('shopping');
    
    return database;
  } catch (error) {
    console.error('Error connecting to the database', error);
    throw error;
  }
}

module.exports = {
  connectToDB
};




