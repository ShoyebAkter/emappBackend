const express = require("express");
const axios = require('axios');
var countries = require("i18n-iso-countries");
const fs = require('fs');
const cors = require('cors');
const natural = require('natural');
const app = express();
const multer = require('multer');
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
const User = require("./routeHandler/user")
app.use(express.json());
app.use(cors());

const dbName = 'emapp';
const collectionName = 'orders';
// mongoose.connect("mongodb+srv://heroreal5385:shoyebakter05@cluster0.h7vlxbw.mongodb.net/?retryWrites=true&w=majority")
const client = new MongoClient("mongodb+srv://heroreal5385:wkS31RPP6IcBxWv1@cluster0.9zekpxe.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });
  

async function connectToMongo() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}
connectToMongo()
function readJsonFile(jsonFile) {
    try {
        const data = fs.readFileSync(jsonFile, 'utf8');
        const jsonData = JSON.parse(data);
        // return jsonData.orders;
        return jsonData;
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return null;
    }
}
const orderJson='./order.json';
const customerJson='./customer.json';
const salesJson='./sales.json';
const usersJson='./user.json';
const orderData = readJsonFile(orderJson)
const customerData=readJsonFile(customerJson);
const salesData=readJsonFile(salesJson);
const usersData=readJsonFile(usersJson);
// Function to check if a property name is similar to any of the target property names
function findSimilarProperties(array, targetProperties) {
    const resultArray = [];
    const similarityThreshold = 0.8; 
    for (const obj of array) {
        const matchingProperties = {};

        for (const key in obj) {
            for (const target of targetProperties) {
                const similarity = natural.JaroWinklerDistance(key, target);
                if (similarity >= similarityThreshold) {
                    matchingProperties[target] = obj[key];
                    break;
                }
            }
        }

        if (Object.keys(matchingProperties).length > 0) {
            resultArray.push(matchingProperties);
        }
    }

    return resultArray;
}
const main = (targetProperties,data) => {
    const matchingObjects = findSimilarProperties(data, targetProperties);
    return matchingObjects;
}

const ordertargetProperties = ['order', 'total','date','price','name','product','item'];
const customerTargetProperties=["birthdate","tier","details","role"]
const salesTargetProperties=["items","product","sale","date","price"]
const usersTargetProperties=["country"]
const newOrderArray=main(ordertargetProperties,orderData.orders);
const newCustomerArray=main(customerTargetProperties,customerData.customer);
const newSalesArray=main(salesTargetProperties,salesData.sales)
const newUsersArray=main(usersTargetProperties,usersData.users)

const newUsersArrayWithCountry = newUsersArray.map((user) => ({
  ...user,
  id: countries.alpha2ToAlpha3(user.country),
}));
app.post("/sendemail", (req,res)=>{
  const {emails,message,subject,imageUrl}=req.body;
  // console.log(req.body);
  
  try{
    const transporter=nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: "heroreal5385@gmail.com",
        pass: "aoizlhcmetfllfiv",
      },
    });
    const mailOptions={
      from:"heroreal5385@gmail.com",
      to:emails.join(','),
      subject:subject,
      html: `<div>${message} </div><img src="http://localhost:5000/tracking-pixel?user_token=userid1" width="1" height="1" alt="" style="display: none;"/>
      <img src=${imageUrl} alt="Image" />`
    }
    transporter.sendMail(mailOptions,(error)=>error && console.log("error",error))
    console.log("email send");
  }catch(error){
console.log(error);
  }
  
})
// app.get('/tracking-pixel', (req, res) => {
//   const userToken = req.query.user_token;

//   // Log or store the open event and associate it with the user identified by userToken
//   console.log(`Email opened by user with token: ${userToken}`);

//   // Respond with the tracking pixel (a transparent 1x1 pixel)
//   // res.sendFile('tracking-pixel.png', { root: __dirname });
// });

// async function insertData(myCollection,data) {
//     try {
       
  
//       // Select the database and collection
//       const db = client.db(dbName);
//       const collection = db.collection(myCollection);
  
//       // Insert the array of objects
//       const result = await collection.insertMany(data);
//       console.log(`${result.insertedCount} documents inserted`);
  
//       // Close the MongoDB connection
//       client.close();
//     } catch (error) {
//       console.error('Error inserting data:', error);
//     }
//   }
//   const usersCollection="users"
// insertData(usersCollection,newUsersArrayWithCountry)
  //API
  app.get('/api/data', async (req, res) => {
    try {
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
  
      // Retrieve data from MongoDB
      const data = await collection.find().toArray();
  
      res.json(data);
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  //customers data api
  app.get('/api/customerdata', async (req, res) => {
    try {
      const db = client.db(dbName);
      const collection = db.collection("customer");
  
      // Retrieve data from MongoDB
      const data = await collection.find().toArray();
  
      res.json(data);
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  //sales data api
  app.get('/sales', async (req, res) => {
    try {
      const db = client.db(dbName);
      const collection = db.collection("sales");
  
      // Retrieve data from MongoDB
      const data = await collection.find().toArray();
  
      res.json(data);
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  //users data api
  app.get('/users', async (req, res) => {
    try {
      const db = client.db(dbName);
      const collection = db.collection("users");
  
      // Retrieve data from MongoDB
      const data = await collection.find().toArray();
  
      res.json(data);
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


    



app.listen(5000, () => {
    console.log("app running at 5000");
    // console.log(newUsersArrayWithCountry);
})