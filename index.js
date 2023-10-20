const express = require("express");
const cors = require('cors');
const app = express();
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
app.use(express.json());
// const corsOptions = {
//   origin: [ 'http://localhost:5173','https://mp-app-eta.vercel.app'],
// };
app.use(cors());

const dbName = 'emapp';
const collectionName = 'orders';
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
  const { emails, message, subject,imageUrl,  uid, date, campaignType } = req.body;
  // console.log(req.body);
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
      from: "heroreal5385@gmail.com",
      to: emails.join(','),
      subject: subject,
      html: `<div>${message} </div>
      <img src=${imageUrl} alt="Image" />`
    }
    transporter.sendMail(mailOptions, (error) => error && console.log("error", error))
     res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.log(error);
  }

})
app.post("/sendserveremail", async (req, res) => {
  const { emails, message, subject,  uid, date, campaignType } = req.body;
  // console.log(req.body);
  try {
    
    const emailOptions = {
      uid: uid,
      from: "heroreal5385@gmail.com",
      to: emails.join(','),
      date: date,
      subject: subject,
      campaignType: campaignType,
      message:message
    }
    const db = client.db(dbName);
    const collection = db.collection("emailCampaign");
     collection.insertOne(emailOptions);
  } catch (error) {
    console.log(error);
  }

})

//subscription send mail
app.post("/subscriptionemail", async (req, res) => {
  const { email} = req.body;
  // console.log(req.body);
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
      from: "heroreal5385@gmail.com",
      to: "shoyebmohammad660@gmail.com",
      subject: "Subscription",
      html: `<div>${email} want Subscription.</div>`
    }
    transporter.sendMail(mailOptions, (error) => error && console.log("error", error))
     res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.log(error);
  }

})

app.post("/fbpost",async(req,res)=>{
  const { id, imageUrl, message, date } = req.body;
  const fbInfo = {
    id: id,
    url: imageUrl,
    message: message,
    date: date
  }
  const db = client.db(dbName);
  const collection = db.collection("fbPostsData");
  const result = await collection.insertOne(fbInfo);
})

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