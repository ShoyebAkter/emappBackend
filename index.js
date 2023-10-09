const express = require("express");
const axios = require('axios');
var countries = require("i18n-iso-countries");
var useragent = require('express-useragent');
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
app.use(useragent.express());
const corsOptions = {
  origin: 'https://emapp-backend.vercel.app',
  // origin: 'http://localhost:5173',
};
app.use(cors(corsOptions));

const dbName = 'emapp';
const collectionName = 'orders';
// mongoose.connect("mongodb+srv://heroreal5385:shoyebakter05@cluster0.h7vlxbw.mongodb.net/?retryWrites=true&w=majority")
const client = new MongoClient("mongodb+srv://heroreal5385:wkS31RPP6IcBxWv1@cluster0.9zekpxe.mongodb.net/?retryWrites=true&w=majority");


async function connectToMongo() {
  try {
    client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}
connectToMongo()
app.get("/", (req, res) => {
  res.send("Express on Vercel");
});
app.post("/sendemail", async (req, res) => {
  const { emails, message, subject, imageUrl, campaignType, uid, date } = req.body;
  const timestamp = Date.now().toString(36); // Convert current timestamp to base36
  const random = Math.random().toString(36).substr(2, 5);
  const uniqueTrackingId = `${timestamp}-${random}`;
  // console.log(req.body);
  const trackingUrl = `https://mp-app-eta.vercel.app/tracking?uid=${uid}&trackingId=${uniqueTrackingId}`;
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: "heroreal5385@gmail.com",
        pass: "aoizlhcmetfllfiv",
      },
    });
    const mailOptions = {
      uid: uid,
      from: "heroreal5385@gmail.com",
      to: emails.join(','),
      date: date,
      subject: subject,
      campaignType: campaignType,
      html: `<div>${message} </div>
      <div><a href=${trackingUrl}/></div>
      <img src=${imageUrl} alt="Image" />`
    }
    transporter.sendMail(mailOptions, (error) => error && console.log("error", error))
    // console.log("email send");
    const db = client.db(dbName);
    const collection = db.collection("emailCampaign");
    const result = await collection.insertOne(mailOptions);
    res.send(result);
  } catch (error) {
    console.log(error);
  }

})

app.get('/tracking', function (req, res) {
  res.send(req.useragent);
});
//whatsapp campaign api
app.post('/whatsapp', async (req, res) => {
  const { uid, campaignType, message, number } = req.body;
  const whatsAppOptions = {
    uid: uid,
    campaignType: campaignType,
    message: message,
    number: number
  }
  const db = client.db(dbName);
  const collection = db.collection("whatsAppCampaign");
  const result = await collection.insertOne(whatsAppOptions);

  res.send(result);
})

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
//emailcampaign data api
app.get('/emailcampaign/:id', async (req, res) => {
  const id = req.params.id;
  const db = client.db(dbName);
  const collection = db.collection("emailCampaign");
  const query = { uid: id };
  const cursor = collection.find(query);
  const data = await cursor.toArray();
  res.send(data)
})
//whatsapp campaign data api
app.get('/whatsappcampaign/:id', async (req, res) => {
  const id = req.params.id;
  const db = client.db(dbName);
  const collection = db.collection("whatsAppCampaign");
  const query = { uid: id };
  const cursor = collection.find(query);
  const data = await cursor.toArray();
  res.send(data)
})
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