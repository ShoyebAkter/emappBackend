const express = require("express");
const cors = require("cors");
const app = express();
const request=require("request")
const bodyParser = require("body-parser");
const axios = require("axios");
const nodemailer = require("nodemailer");
const { MongoClient } = require("mongodb");

const admin = require('firebase-admin');
var serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(express.json());
const corsOptions = {
  origin: ['http://localhost:5173/','https://www.eulermail.app/' ],
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
const dbName = "emapp";
const collectionName = "orders";
const client = new MongoClient(
  "mongodb+srv://heroreal5385:wkS31RPP6IcBxWv1@cluster0.9zekpxe.mongodb.net/?retryWrites=true&w=majority"
);

// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send({ message: 'UnAuthorized access' });
//   }
//   const token = authHeader.split(' ')[1];
//   jwt.verify(token, "GlKENSfqinxZHkbBYDxEWOLBRtdFmYOFCSNIEKlevZUxyHsuJEStpiYrlLHOcELHCIzxDEjoAaRWStVmnuoSTHsQdkzvgVeCDqgN", function (err, decoded) {
//     if (err) {
//       return res.status(403).send({ message: 'Forbidden access' })
//     }
//     req.decoded = decoded;
//     next();
//   });
// }
async function connectToMongo() {
  try {
    client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
connectToMongo();
app.get("/", (req, res) => {
  res.send("Express on Vercel");
});
app.post("/sendemail", async (req, res) => {
  const { emails, message, subject, imageUrl, uid, date, campaignType } =
    req.body;
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
      to: emails.join(","),
      subject: subject,
      html: `<div>${message} </div>
      <img src=${imageUrl} alt="Image" />`,
    };
    transporter.sendMail(
      mailOptions,
      (error) => error && console.log("error", error)
    );
    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.log(error);
  }
});
app.post("/sendserveremail", async (req, res) => {
  const { emails, message, subject, uid, date, campaignType } = req.body;
  // console.log(req.body);
  try {
    const emailOptions = {
      uid: uid,
      from: "heroreal5385@gmail.com",
      to: emails.join(","),
      date: date,
      subject: subject,
      campaignType: campaignType,
      message: message,
    };
    const db = client.db(dbName);
    const collection = db.collection("emailCampaign");
    collection.insertOne(emailOptions);
  } catch (error) {
    console.log(error);
  }
});
//exchange tokens
app.get("/exchangeToken/:tokenId", async (req, res) => {
  const shortLivedToken = req.params.tokenId;
  const response = await axios.get(
    "https://graph.facebook.com/v18.0/oauth/access_token",
    {
      params: {
        grant_type: "fb_exchange_token",
        client_id: 231991286544485,
        client_secret: "12e2ba24cd779e8e1ed537556f4433cf",
        fb_exchange_token: shortLivedToken,
      },
    }
  );
  // const longLivedToken = response.data.access_token;
  res.status(200).json({ longLivedToken });
});
//subscription send mail
app.post("/subscriptionemail", async (req, res) => {
  const { email, firstName, lastName, gender, title, address, date } = req.body;
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
      html: `<div>
      <div>${email} want Subscription.</div>
      <p>FirstName:${firstName} LastName:${lastName}</p>
      <p>Address:${address} Title:${title} Gender:${gender}</p>
      </div>`,
    };
    transporter.sendMail(
      mailOptions,
      (error) => error && console.log("error", error)
    );
    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.log(error);
  }
});
app.post("/signUpEmail", async (req, res) => {
  const { email, password } = req.body;
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
      to: email,
      subject: "Login Credential",
      html: `<div>
      <p>This is your email : ${email}</p>
      <p>This is your password for eulerMail: ${password}</p>
      </div>`,
    };
    transporter.sendMail(
      mailOptions,
      (error) => error && console.log("error", error)
    );
    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.log(error);
  }
});
app.post("/passwordReset", async(req, res) => {
  const {email}=req.body;
  try{
    const link=await admin.auth().generatePasswordResetLink(email);

    res.json({link:link}) 
  }catch(error){
    console.log(error)
  }
  
});
//post tracking data
app.post("/collect", async (req, res) => {
  const trackingData = req.body;
  const db = client.db(dbName);
  const collection = db.collection("trackingData");
  const result = await collection.insertOne(trackingData);
  res.sendStatus(200);
});
//post website user data
app.post("/eulermailUser", async (req, res) => {
  const { uid, email } = req.body;
  const userInfo = {
    id: uid,
    email: email,
  };
  const db = client.db(dbName);
  const collection = db.collection("eulermailUser");
  const result = await collection.insertOne(userInfo);
});
//post shopify data
app.post("/shopify/info", async (req, res) => {
  const { url,adminApi, apiKey,companyName,email } = req.body;
  const shopifyInfo = {
    url:url,
    adminApi:adminApi,
    apiKey:apiKey,
    companyName:companyName,
    email:email
  };
  const db = client.db(dbName);
  const collection = db.collection("shopifyInfo");
  await collection.insertOne(shopifyInfo);
});
//get shopify data
app.get("/shopify/data", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("shopifyInfo");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//get shopify store data
app.get("/shopify/storeData", async (req, res) => {
  try {
    const {adminApi, apikey,   storeUrl} = req.query; // Access query parameters using req.query
    let option = {
      method: "GET",
      url: `https://${apikey}:${adminApi}@${storeUrl}admin/api/2022-10/products.json`,
      headers: {
        "Content-Type": "application/json",
      },
    };
    request(option, function (error, response) {
      if (error) throw new Error(error);
      res.send(response.body);
    });
  } catch (error) {
    console.error("Error fetching data from Shopify:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/eulermailUser", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("eulermailUser");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//get company data date and price only
// app.get('/salesAnalysis', async (req, res) => {
//   try {
//     const db = client.db(dbName);
//     const collection = db.collection("companyData");
//     // Retrieve data from MongoDB
//     const data = await collection.find().limit(500).toArray();
//     res.json(data);
//   } catch (error) {
//     console.error('Error fetching data from MongoDB:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
//warehousepro sales api
app.get("/warehousepro/sales", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproSales");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//warehousepro order api
app.get("/warehousepro/orders", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproOrder");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//warehousepro longevity api
app.get("/warehousepro/longevity", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproLongevity");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//warehousepro engaagement
app.get("/warehousepro/engagement", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproEngagement");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//warehousepro product sales api
app.get("/warehousepro/productSales", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproProductSales");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//warehousepro above 75percent api
app.get("/warehousepro/percentSales", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproPercentageSale");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//warehousepro small clients api
app.get("/warehousepro/smallClient", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproSmallClient");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//warehousepro client category
app.get("/warehousepro/clientCategory", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproClientCategory");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//warehousepro client country
app.get("/warehousepro/clientCountry", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproClientCountry");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//warehousepro prediction
app.get("/warehousepro/prediction", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproPredict");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//warehousepro heatmap
app.get("/warehousepro/heatmap", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproHeatMap");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//warehousepro cohort graph api
app.get("/warehousepro/cohort", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproCohortData");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//active cohort 2
app.get("/warehousepro/cohortwithNegative", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseActiveCohort");

    // Retrieve data from MongoDB
    const data = await collection.find().toArray();

    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//active cohort
app.get("/warehousepro/activeCohort", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproActiveCohort");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//warehousepro main data
app.get("/warehousepro/mainData", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproMainData");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/warehousepro/jsonData", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproJsonData");

    // Retrieve data from MongoDB
    const data = await collection.find().toArray();

    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//warehousepro state data
app.get("/warehousepro/stateData", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("warehouseproStateData");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//post facebook post data
app.post("/fbpost", async (req, res) => {
  const { id, uid, imageUrl, message, date } = req.body;
  const fbInfo = {
    id: id,
    url: imageUrl,
    message: message,
    date: date,
    uid: uid,
  };
  const db = client.db(dbName);
  const collection = db.collection("fbPostsData");
  const result = await collection.insertOne(fbInfo);
});
//whatsapp campaign api
app.post("/whatsapp", async (req, res) => {
  const { uid, campaignType, message, number } = req.body;
  const whatsAppOptions = {
    uid: uid,
    campaignType: campaignType,
    message: message,
    number: number,
  };
  const db = client.db(dbName);
  const collection = db.collection("whatsAppCampaign");
  const result = await collection.insertOne(whatsAppOptions);
  res.send(result);
});
app.post("/images", async (req, res) => {
  const { formData } = req.body;
  const db = client.db(dbName);
  const collection = db.collection("images");
  const result = await collection.insertOne(formData);
  res.send(result);
});
//API
app.get("/api/data", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//get facebook data
app.get("/fbpost/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const db = client.db(dbName);
    const collection = db.collection("fbPostsData");
    const query = { uid: id };
    const cursor = collection.find(query);
    const data = await cursor.toArray();
    res.send(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//customers data api
app.get("/api/customerdata", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("customer");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//emailcampaign data api
app.get("/emailcampaign/:id", async (req, res) => {
  const id = req.params.id;
  const db = client.db(dbName);
  const collection = db.collection("emailCampaign");
  const query = { uid: id };
  const cursor = collection.find(query);
  const data = await cursor.toArray();
  res.send(data);
});
//whatsapp campaign data api
app.get("/whatsappcampaign/:id", async (req, res) => {
  const id = req.params.id;
  const db = client.db(dbName);
  const collection = db.collection("whatsAppCampaign");
  const query = { uid: id };
  const cursor = collection.find(query);
  const data = await cursor.toArray();
  res.send(data);
});
//sales data api
app.get("/sales", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("sales");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//users data api
app.get("/users", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("users");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.listen(5000, () => {
  console.log("app running at 5000");
  // console.log(newUsersArrayWithCountry);
});