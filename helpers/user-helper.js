const { connectToDB } = require("../config/connection");
const collection=require("./collection")
const bcrypt=require('bcrypt')
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
  }
  
  
}