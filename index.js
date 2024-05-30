const dotenv = require('dotenv');
dotenv.config()
const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require('cookie-parser');
const request = require("request");
const bodyParser = require("body-parser");
const {google} = require('googleapis');
const axios = require("axios");
const nodemailer = require("nodemailer");
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");

app.use(cookieParser());
app.use(express.json());
// const corsOptions = {
//   origin: ['http://localhost:5173/','https://www.eulermail.app/' ],
// };
app.use(cors());
app.use(bodyParser.json());
const dbName = "emapp";
const collectionName = "orders";
const oauth2Client = new google.auth.OAuth2(
  '535762139600-md4roh1eu4pe5de6u2pjfruvji1rpiqt.apps.googleusercontent.com',
  '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',
  'http://localhost:5173/settings'
);
const scopes = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtubepartner',
  'https://www.googleapis.com/auth/youtubepartner-channel-audit',
  'https://www.googleapis.com/auth/youtube.upload',
];
const url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',

  // If you only need one scope you can pass it as a string
  scope: scopes
});
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
        pass: "uimb tbwh deom ibyy",
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
      from: "eulermaildev@gmail.com",
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
// app.get("/exchangeToken/:tokenId", async (req, res) => {
//   const shortLivedToken = req.params.tokenId;
//   const response = await axios.get(
//     "https://graph.facebook.com/v18.0/oauth/access_token",
//     {
//       params: {
//         grant_type: "fb_exchange_token",
//         client_id: 231991286544485,
//         client_secret: "12e2ba24cd779e8e1ed537556f4433cf",
//         fb_exchange_token: shortLivedToken,
//       },
//     }
//   );
//   // const longLivedToken = response.data.access_token;
//   res.status(200).json({ longLivedToken });
// });
//subscription email
app.post("/sendsubscriptionemail", async (req, res) => {
  const { email, password, firstName, lastName, gender, title, address, date } =
    req.body;
  // console.log(req.body);
  try {
    await nodemailer
      .createTransport({
        service: "gmail",
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
          user: "heroreal5385@gmail.com",
          pass: "uimb tbwh deom ibyy",
        },
      })
      .sendMail({
        from: "heroreal5385@gmail.com",
        to: "eulermaildev@gmail.com",
        subject: "Subscription Email",
        html: `<div>
      <div>${email} This user want to get subscription</div>
      <p>FirstName: ${firstName}</p>
      <p>LastName: ${lastName}</p>
      <p>Date: ${date}</p>
      </div>`,
      });

    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.log(error);
  }
});
//login credential send mail
app.post("/subscriptionemail", async (req, res) => {
  const { email, password, firstName, lastName, gender, title, address, date } =
    req.body;
  // console.log(req.body);
  try {
    await nodemailer
      .createTransport({
        service: "gmail",
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
          user: "eulermaildev@gmail.com",
          pass: "bnmx jncs ecmb afjm",
        },
      })
      .sendMail({
        from: "eulermaildev@gmail.com",
        to: email,
        subject: "“Welcome to EulerMail: Start Your Success Journey Today”",
        html: `<div style= "margin-inline: 350px">
      <div>Dear ${firstName},</div>
      <div>
        We're thrilled to welcome you to the
        <span style=" color: #649445; font-weight: 700">
          EulerMail
        </span>
        family! Your journey towards transforming your business narrative has
        just begun, and we're here to guide you every step of the way.
      </div>
      <br />
      <div
        style=
          "background-color: #ebebeb;margin-inline:auto;width:400px;padding: 10px"
      >
        <div style="color:#649445;font-weight: bold">
          Your account details
        </div>
        <div>
          <span style="color: #2a4e40">Email:</span> ${email}
        </div>
        <div>
          <span style="color: #2a4e40">Password:</span> ${password}
        </div>
      </div>
      <br />
      <div>
        Should you ever forget your login credentials, don't worry! Our password
        recovery tools are designed for quick and easy access to reset your
        information. You can find this option directly on the login page.
      </div>
      <br />
      <div style="background-color: white;width:600px;box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.5);padding:20px;border-radius: 30px;margin-inline: auto">
        <div style="color: #2a4e40;margin-bottom: 10px;font-weight: 700;font-size: 30px">
          Embark on Your Journey:
        </div>
        <div>
          EulerMail is built on the belief that the future of your business is
          malleable, crafted by understanding and engaging with your customers
          behavior. Our platform offers a suite of analytics tools designed to
          turn data into actionable insights, propelling your business to new
          heights.
        </div>
      </div>
      <br />
      <div
        style=
          "background-color:#649445;
          height:2px;
          margin-block:10px"
      ></div>
      <div
        style=
          "background-color: #f4f4f4;
          width: 600px;
          margin-inline:auto;
          padding: 10px"
      >
        <div
          style="color:#2a4e40;font-weight:700;marginInline:auto;width: 200px"
        >
          Get Started:
        </div>
        <ul>
          <li>Log in to your EulerMail account with your new credentials.</li>
          <li>
            Take a moment to explore the dashboard and familiarize yourself with
            the array of features at your disposal.
          </li>
          <li>
            Begin by setting up your first campaign or dive into our analytics
            to understand your current standing.
          </li>
        </ul>
      </div>
      <br />
      <div
        style="color: #649445;font-weight:700;width:200px;margin-inline: auto"
      >
        Need Assistance?
      </div>
      <div>
        Our dedicated support team is eager to assist you with any questions or
        guidance you may need. Feel free to reach out at any time.
      </div>
      <div style="color: #649445; width: 200px; marginInline: auto">
        support@eulermail.app
      </div>
      <br />
      <div 
      style="background-color: white;width: 600px;box-shadow:  4px 4px 10px rgba(0, 0, 0, 0.5);padding: 20px;border-radius: 30px;margin-inline: auto"
      >
        <div style="color: #2a4e40; font-weight: 700; width: 300px; margin-inline: auto">
          Unleash the Full Potential:
        </div>
        <div>
          We encourage you to explore EulerMails full capabilities. Every tool
          and feature is designed to empower you to make informed decisions,
          foster growth, and rewrite the story of your business with chapters of
          unprecedented success.
        </div>
      </div>
      <br />
      <div>
        Welcome to the <span style="color: #649445">EulerMail</span> community, where your businesss potential is
        limitless. Lets start turning insights into action.
      </div>
      <br />
      <div style=" color: #649445; font-weight: bold">
        Best Wishes,
      </div>
      <div>EulerMail Team</div>
    </div>`,
      });

    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.log(error);
  }
  // const subscriptionData={
  //   email:email,
  //   firstName:firstName,
  //   lastName:lastName,
  //   gender:gender,
  //   title:title,
  //   address:address,
  //   date:date
  // }
  // const collection = db.collection("subscription");
  // await collection.insertOne(subscriptionData);
});
//subscriptionInfo database api
app.post("/subscription/database", async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    connection,
    gender,
    title,
    address,
    date,
  } = req.body;

  const subscriptionData = {
    email: email,
    firstName: firstName,
    lastName: lastName,
    gender: gender,
    title: title,
    connection: connection,
    address: address,
    date: date,
    password: password,
    photoUrl: "",
  };
  const collection = db.collection("subscription");
  await collection.insertOne(subscriptionData);
});
app.get("/subscription/database", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("subscription");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.put("/subscription/database/:id", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("subscription");
    const id = req.params.id;
    const newData = req.body; // Assuming request body contains the new data to be updated

    // Update the document in the collection based on the provided ID
    const result = await collection.updateOne(
      { _id: new ObjectId(id) }, // Assuming _id is the unique identifier of the document
      { $set: newData } // Set the new data
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating data in MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//post linkedin api to get access token
app.post("/getAccessToken", async (req, res) => {
  const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
  const { authorization_code } = req.body; // Assuming you're passing authorization code in the request body
  const client_id = process.env.client_id;
  const client_secret = process.env.client_secret;
  const redirect_uri = "http://localhost:5173/settings";

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', authorization_code);
    params.append('client_id', client_id);
    params.append('client_secret', client_secret);
    params.append('redirect_uri', redirect_uri);

    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token} = response.data;
    // console.log("Access token retrieved:",access_token);
    
    res.json(access_token);
  } catch (error) {
    console.error("Error while fetching access token:", error.response ? error.response.data : error.message);
    // res.status(500).send("Error while fetching access token");
  }
});

//get linnkedin data
app.post('/getLinkedInProfile', async (req, res) => {
  const {  accessToken } = req.body;
  console.log("Access token retrieved:",accessToken)
  try {
    const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    console.log(response.data)
    // res.json(response.data);
  } catch (error) {
    console.error('Error fetching profile:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching profile');
  }
});


//tiktok data access login
// app.get('/oauth', (req, res) => {
//   const csrfState = Math.random().toString(36).substring(2);
//   res.cookie('csrfState', csrfState, { maxAge: 60000 });

//   const clientKey = process.env.clientKey; // Ensure this is set correctly
//   const redirectUri = encodeURIComponent("https://www.eulermail.app/settings"); // Ensure this matches the registered redirect URI exactly

//   let url = 'https://www.tiktok.com/v2/auth/authorize/';
//   url += `?client_key=${clientKey}`;
//   url += '&scope=user.info.basic';
//   url += '&response_type=code';
//   url += `&redirect_uri=${redirectUri}`;
//   url += `&state=${encodeURIComponent(csrfState)}`;

//   res.json({ url: url });
// });

// google access token api
app.get('/auth', (req, res) => {
  res.redirect(url);
});
app.post('/oauthcallback', async (req, res) => {
  const code = req.body.code;
  // console.log(code)
  try {
    // Exchange the authorization code for an access token
    const { tokens } = await  oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // console.log('Access tokens:', tokens);

    // Respond to the client
    // res.send('Authentication successful! You can now close this window.');
    res.json(tokens);
    // Now you can use oauth2Client to make authorized API calls
    // Example: const blogger = google.blogger({ version: 'v3', auth: oauth2Client });
  } catch (error) {
    console.error('Error retrieving access token', error);
    res.status(500).send('Authentication failed');
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
  const { uid, email, date } = req.body;
  const userInfo = {
    id: uid,
    email: email,
    date: date,
  };
  const db = client.db(dbName);
  const collection = db.collection("eulermailUser");
  const result = await collection.insertOne(userInfo);
});
//post shopify data
app.post("/shopify/info", async (req, res) => {
  const { url, adminApi, apiKey, companyName, email } = req.body;
  const shopifyInfo = {
    url: url,
    adminApi: adminApi,
    apiKey: apiKey,
    companyName: companyName,
    email: email,
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
app.get("/shopify/customersData", async (req, res) => {
  try {
    const { adminApi, apikey, storeUrl } = req.query;

    // Access query parameters using req.query
    let option = {
      method: "GET",
      url: `https://${apikey}:${adminApi}@${storeUrl}/admin/api/2024-01/customers.json`,
      headers: {
        "Content-Type": "application/json",
      },
    };
    await request(option, function (error, response) {
      if (error) throw new Error(error);
      // console.log(response.body)
      res.send(response.body);
    });
  } catch (error) {
    console.error("Error fetching data from Shopify:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//get shopify clone store Data
app.get("/customersData", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection("customers");
    // Retrieve data from MongoDB
    const data = await collection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
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
