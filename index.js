const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const request = require("request");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const axios = require("axios");
const nodemailer = require("nodemailer");
const multer = require("multer");
const { MongoClient,GridFSBucket } = require("mongodb");
const { ObjectId } = require("mongodb");
const mjml2html = require("mjml");
const { Readable } = require('stream');
app.use(cookieParser());
app.use(express.json());
// const corsOptions = {
//   origin: ['http://localhost:5173/','https://www.eulermail.app/' ],
// };
app.use(cors());
app.use(bodyParser.json());
const dbName = "emapp";
const collectionName = "orders";
let bucket;
const oauth2Client = new google.auth.OAuth2(
  "535762139600-md4roh1eu4pe5de6u2pjfruvji1rpiqt.apps.googleusercontent.com",
  "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",
  "https://www.eulermail.app/settings"
);
const scopes = [
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtubepartner",
  "https://www.googleapis.com/auth/youtubepartner-channel-audit",
  "https://www.googleapis.com/auth/youtube.upload",
];
const url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: "offline",

  // If you only need one scope you can pass it as a string
  scope: scopes,
});
const client = new MongoClient(
  "mongodb+srv://heroreal5385:wkS31RPP6IcBxWv1@cluster0.9zekpxe.mongodb.net/?retryWrites=true&w=majority"
);

// mjml functions
const jsonToMjml = (json) => {
  const { content } = json;

  const processAttributes = (attributes) => {
    if (!attributes) return "";
    return Object.entries(attributes)
      .filter(([key, value]) => {
        // Filter out illegal attributes
        const illegalAttributes = [
          "border-radius",
          "inner-padding",
          "target",
          "border",
          "text-align",
          "href",
          "font-size",
          "line-height",
          "headAttributes",
          "fonts",
          "responsive",
          "font-family",
          "text-color",
          "content-background-color",
          "breakpoint",
          "headStyles",
        ];
        return !illegalAttributes.includes(key);
      })
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");
  };

  const processChildren = (children) => {
    if (!children || !Array.isArray(children)) return "";
    return children.map(processElement).join("\n");
  };

  const processElement = (element) => {
    if (!element) {
      console.warn("Encountered undefined element");
      return "";
    }

    const { type, attributes = {}, data = {}, children = [] } = element;
    const content = data.value?.content || "";
    const attributeString = processAttributes(attributes);

    switch (type) {
      case "wrapper":
        return `<mj-wrapper ${attributeString}>${processChildren(
          children
        )}</mj-wrapper>`;
      case "section":
        return `<mj-section ${attributeString}>${processChildren(
          children
        )}</mj-section>`;
      case "group":
        // console.log(data)
        return `<mj-group ${attributeString}>${processChildren(
          children
        )}</mj-group>`;
      case "column":
        return `<mj-column ${attributeString}>${processChildren(
          children
        )}</mj-column>`;
      case "text":
        // Ensure font-size has a valid px value
        if (
          attributes["font-size"] &&
          !attributes["font-size"].endsWith("px")
        ) {
          attributes["font-size"] = "15px"; // default value if not provided or incorrect
        }
        return `<mj-text ${processAttributes(attributes)}>${processChildren(
          children
        )}</mj-text>`;
      case "divider":
        return `<mj-divider ${attributeString} />`;
      case "navbar":
        const links = data.value.links
          .map(
            (link) =>
              `<mj-navbar-link href="${link.href}" color="${link.color}" font-size="${link["font-size"]}" padding="${link.padding}" target="${link.target}">${link.content}</mj-navbar-link>`
          )
          .join("\n");
        return `<mj-navbar ${attributeString}>${links}</mj-navbar>`;
      case "hero":
        return `<mj-hero ${attributeString}>${processChildren(
          children
        )}</mj-hero>`;
      case "button":
        return `<mj-button ${attributeString}>${content}</mj-button>`;
      case "image":
        return `<mj-image ${attributeString} />`;
      case "advanced_social":
        // console.log(data.value)
        const socialLinks = data.value.elements
        .map(
          (link) =>
          `<mj-social-element 
          href="${link.href || '#'}" 
          target="${link.target || '_self'}" 
          padding="${link.padding || '0px'}" 
          src="${link.src}">
          ${link.content || ''}
        </mj-social-element>`
        )
        .join('\n');
        return `<mjml>
        <mj-body>
          <mj-section>
            <mj-column>
              <mj-social>
                ${socialLinks}
              </mj-social>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>`;
      default:
        console.warn("Unknown element type:", type);
        return "";
    }
  };

  if (!content || !content.data || !content.attributes) {
    console.error("Invalid content structure:", content);
    throw new Error("Invalid content structure");
  }

  const mjmlTemplate = `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-text font-size="15px" line-height="1.8" font-family="'Lato', sans-serif" color="#000000"/>
      <mj-section background-color="#efeeea"/>
      <mj-wrapper padding="20px 0px 20px 0px" border="none" text-align="center" direction="ltr"/>
      <mj-column padding="0px 0px 0px 0px" border="none" vertical-align="top"/>
      <mj-hero background-color="#ffffff" background-position="center center" mode="fluid-height" padding="100px 0px 100px 0px" vertical-align="top" background-url="https://assets.maocanhua.cn/92a8e4ce-499a-4b7e-a0c6-38265f9589f2-image.png"/>
      <mj-button background-color="#feb062" color="#ffffff" font-size="13px" font-weight="normal" padding="10px 25px 10px 25px" line-height="120%" text-align="center" />
    </mj-attributes>
  </mj-head>
  <mj-body>
    ${processChildren(content.children)}
  </mj-body>
</mjml>`;

  return mjmlTemplate;
};

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
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);

    // Initialize GridFS Bucket
    bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
connectToMongo();

const storage = multer.memoryStorage();
const upload = multer({ storage });
app.get("/", (req, res) => {
  res.send("Express on Vercel");
});
app.post("/sendemail", async (req, res) => {
  const { emails, subject, html } = req.body;
  // console.log(req.body);
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: "eulermaildev@gmail.com",
        pass: "bnmx jncs ecmb afjm",
        // user: "support@eulermail.app",
        // pass: "gVHwVQ1TFHNf",
      },
    });
    const mailOptions = {
      from: "eulermaildev@gmail.com",
      to: emails.join(","),
      subject: subject,
      html: `<div>${html} </div>`,
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
      to: emails,
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

//image upload

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const { originalname, mimetype, buffer } = req.file;

    // Convert buffer into a readable stream
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(originalname, {
      contentType: mimetype,
    });

    readableStream.pipe(uploadStream);

    uploadStream.on('finish', (file) => {
      res.status(200).json({
        message: 'File uploaded successfully',
        fileId: file._id,
        imageUrl: `${req.protocol}://${req.get('host')}/files/${file._id}`,
        success:true
      });
    });

    uploadStream.on('error', (err) => {
      console.error('Upload error:', err);
      res.status(500).send('Error uploading file');
    });
  } catch (error) {
    console.error('Error in upload:', error);
    res.status(500).send('Server error');
  }
});


// Route to serve the image from GridFS
app.get('/files/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;

    const file = await bucket.find({ _id: new ObjectId(fileId) }).toArray();

    if (!file || file.length === 0) {
      return res.status(404).send('File not found');
    }

    // Set content type and pipe the file stream to the response
    res.set('Content-Type', file[0].contentType);

    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
    downloadStream.pipe(res);

    downloadStream.on('error', (err) => {
      console.error('Download error:', err);
      res.status(500).send('Error retrieving file');
    });
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).send('Server error');
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
        host: "smtp.zoho.com",
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
          user: "support@eulermail.app",
          pass: "gVHwVQ1TFHNf",
        },
      })
      .sendMail({
        from: "support@eulermail.app",
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
  const { email, password } = req.body;
  // console.log(req.body);
  try {
    await nodemailer
      .createTransport({
        host: "smtp.zoho.com",
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
          user: "support@eulermail.app",
          pass: "gVHwVQ1TFHNf",
        },
      })
      .sendMail({
        from: "support@eulermail.app",
        to: email,
        subject: "“Welcome to EulerMail: Start Your Success Journey Today”",
        html: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
        <!--[if gte mso 9]>
        <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="x-apple-disable-message-reformatting">
          <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
          <title></title>
          
            <style type="text/css">
              @media only screen and (min-width: 520px) {
          .u-row {
            width: 500px !important;
          }
          .u-row .u-col {
            vertical-align: top;
          }
        
          .u-row .u-col-100 {
            width: 500px !important;
          }
        
        }
        
        @media (max-width: 520px) {
          .u-row-container {
            max-width: 100% !important;
            padding-left: 0px !important;
            padding-right: 0px !important;
          }
          .u-row .u-col {
            min-width: 320px !important;
            max-width: 100% !important;
            display: block !important;
          }
          .u-row {
            width: 100% !important;
          }
          .u-col {
            width: 100% !important;
          }
          .u-col > div {
            margin: 0 auto;
          }
        }
        body {
          margin: 0;
          padding: 0;
        }
        
        table,
        tr,
        td {
          vertical-align: top;
          border-collapse: collapse;
        }
        
        p {
          margin: 0;
        }
        
        .ie-container table,
        .mso-container table {
          table-layout: fixed;
        }
        
        * {
          line-height: inherit;
        }
        
        a[x-apple-data-detectors='true'] {
          color: inherit !important;
          text-decoration: none !important;
        }
        
        table, td { color: #000000; } #u_body a { color: #0000ee; text-decoration: underline; }
            </style>
          
          
        
        </head>
        
        <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #E7E7E7;color: #000000">
          <!--[if IE]><div class="ie-container"><![endif]-->
          <!--[if mso]><div class="mso-container"><![endif]-->
          <table id="u_body" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #e7e7e7;width:100%" cellpadding="0" cellspacing="0">
          <tbody>
          <tr style="vertical-align: top">
            <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #e7e7e7;"><![endif]-->
            
          
          
        <div class="u-row-container" style="padding: 0px;background-color: transparent">
          <div class="u-row" style="margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
            <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
              <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px;"><tr style="background-color: transparent;"><![endif]-->
              
        <!--[if (mso)|(IE)]><td align="center" width="500" style="width: 500px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
        <div class="u-col u-col-100" style="max-width: 320px;min-width: 500px;display: table-cell;vertical-align: top;">
          <div style="height: 100%;width: 100% !important;">
          <!--[if (!mso)&(!IE)]><!--><div style="box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
          
        <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                
          <div style="font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;">
            <p style="font-size: 14px; line-height: 140%; text-align: center;"><span style="font-size: 40px; line-height: 56px;"><strong><span style="line-height: 56px; font-size: 40px;">Welcome to EulerMail</span></strong></span></p>
          </div>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                
          <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
            <tbody>
              <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                  <span>&#160;</span>
                </td>
              </tr>
            </tbody>
          </table>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-right: 0px;padding-left: 0px;" align="center">
              
              <img align="center" border="0" src="https://i.ibb.co/h87pTtF/Logo-Vertical-Green.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 200px;" width="200"/>
              
            </td>
          </tr>
        </table>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                
          <div style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
            <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0">We're thrilled to welcome you to the </span><span style="line-height: 19.6px;" class="fontstyle2"><span style="color: #2dc26b; line-height: 19.6px;">EulerMail</span> </span><span style="line-height: 19.6px;" class="fontstyle0">family! Your journey towards transforming your business narrative has just begun, and we're here to guide you every step of the way,</span></p>
          </div>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                
          <div style="font-size: 14px; padding:20px;background-color:white; line-height: 140%; text-align: center; word-wrap: break-word;">
            <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0">Your account details</span></p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0">      Email : ${email}</span></p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0">     Pass: ${password}</span></p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0">Should you ever forget your login credentials, don’t worry! Our password recovery tools are designed for quick and easy access to reset your information. You can find this option directly on the login page.</span></p>
          </div>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                
          <div style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
            <p style="line-height: 140%;"><strong><span style="line-height: 19.6px;" class="fontstyle0"><span style="color: #169179; line-height: 19.6px;"><span style="line-height: 19.6px;">Embark on your journey</span></span></span></strong></p>
        <p style="line-height: 140%;"> </p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0"></span><span style="line-height: 19.6px;" class="fontstyle2">EulerMail is built on the belief that the future of your business is malleable, crafted by understanding and engaging with your customers' behavior. Our platform offers a suite of analytics tools designed to turn data into actionable insights, propelling your business to new heights. directly on the login page.</span></p>
          </div>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                
          <div style="font-size: 14px; line-height: 140%; padding:20px;background-color:white; text-align: center; word-wrap: break-word;">
            <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0">     <strong><span style="color: #169179; line-height: 19.6px;"> Get started:</span></strong></span></p>
        <p style="line-height: 140%;"> </p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0"></span><span style="line-height: 19.6px;" class="fontstyle2">1.Log in to your EulerMail account with your new credentials.</span></p>
        <p style="line-height: 140%;"> </p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle2">2.Take a moment to explore the dashboard and familiarize yourself with the array of features at your disposal.</span></p>
        <p style="line-height: 140%;"> </p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle2">3.Begin by setting up your first campaign or dive into our analytics to understand your current standing.</span></p>
          </div>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                
          <div style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
            <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0">     <strong><span style="color: #169179; line-height: 19.6px;"> </span></strong></span></p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0">      Need <span style="color: #479243; line-height: 19.6px;" class="fontstyle0"><strong>assistance</strong>?</span></span></p>
        <p style="line-height: 140%;"> </p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0"><span style="color: #479243; line-height: 19.6px;" class="fontstyle0"></span><span style="line-height: 19.6px;" class="fontstyle2">Our dedicated support team is eager to assist you with any questions or guidance you may need. Feel free to reach out at any time.</span></span></p>
        <p style="line-height: 140%;"> </p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0"><span style="line-height: 19.6px;" class="fontstyle2"></span><strong><span style="line-height: 19.6px; color: #2dc26b;" class="fontstyle3">support@eulermail.app</span></strong> <br style="line-height: normal; text-align: -webkit-auto; white-space: normal;" /></span></p>
        <p style="line-height: 140%;"> </p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0"><strong><span style="color: #169179; line-height: 19.6px;">Unleash your full potential</span></strong></span></p>
        <p style="line-height: 140%;"> </p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0"></span><span style="line-height: 19.6px;" class="fontstyle2">We encourage you to explore EulerMail's full capabilities. Every tool and feature is designed to empower you to make informed decisions, foster growth, and rewrite the story of your business with chapters of unprecedented success</span> <br style="line-height: normal; text-align: -webkit-auto; white-space: normal;" /><br /></p>
        <p style="line-height: 140%;"> </p>
          </div>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                
          <div style="font-size: 14px; line-height: 140%; text-align: center; word-wrap: break-word;">
            <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0">     <strong><span style="color: #169179; line-height: 19.6px;"> </span></strong></span></p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0">     </span></p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0">Welcome to the </span><span style="line-height: 19.6px;" class="fontstyle2"><strong><span style="color: #2dc26b; line-height: 19.6px;">EulerMail</span></strong> </span><span style="line-height: 19.6px;" class="fontstyle0">community, where your business's potential is limitless. Let's start turning insights into action.</span></p>
        <p style="line-height: 140%;"> </p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0"></span><span style="line-height: 19.6px;" class="fontstyle3">Best wishes,</span></p>
        <p style="line-height: 140%;"> </p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle3"></span><strong><span style="line-height: 19.6px; color: #2dc26b;" class="fontstyle2">EulerMail Team</span></strong></p>
        <p style="line-height: 140%;"> </p>
        <p style="line-height: 140%;"> </p>
          </div>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                
          <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
            <tbody>
              <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                  <span>&#160;</span>
                </td>
              </tr>
            </tbody>
          </table>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:arial,helvetica,sans-serif;" align="left">
                
          <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid black;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
            <tbody>
              <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                  <span>&#160;</span>
                </td>
              </tr>
            </tbody>
          </table>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:arial,helvetica,sans-serif;" align="left">
                
          <div style="font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;">
            <div style="display: flex; gap: 8px; background-color: #2aaa8a;">
        <div style="margin: 10px;"><img style="width: 20px; height: 20px;" src="https://i.ibb.co/HgWrw1m/blackfb.jpg" alt="" /></div>
        <div style="margin: 10px;"><img style="width: 20px; height: 20px;" src="https://i.ibb.co/JpzzBbh/blackinsta.png" alt="" /></div>
        <div style="margin: 10px;"><img style="width: 20px; height: 20px;" src="https://i.ibb.co/XVCk7Cc/blacklinkedin.png" alt="" /></div>
        </div>
          </div>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:arial,helvetica,sans-serif;" align="left">
                
          <div style="font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;">
            <div style="display: flex; gap: 8px; background-color: #2aaa8a;">
        <div style="margin-left: 10px;">
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0">Copyright (C) 2024 Holismus LLC. All Rights Reserved</span></p>
        <p style="line-height: 140%;"> </p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0">Our mailing list address is:</span></p>
        <p style="line-height: 140%;"> </p>
        <p style="line-height: 140%;"><span style="line-height: 19.6px;" class="fontstyle0">Want to change how you receive these emails? You can update your preferences or unsubscribe</span></p>
        </div>
        </div>
          </div>
        
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tbody>
            <tr>
              <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:arial,helvetica,sans-serif;" align="left">
                
          
        
              </td>
            </tr>
          </tbody>
        </table>
        
          <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
          </div>
        </div>
        <!--[if (mso)|(IE)]></td><![endif]-->
              <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
            </div>
          </div>
          </div>
          
        
        
            <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
            </td>
          </tr>
          </tbody>
          </table>
          <!--[if mso]></div><![endif]-->
          <!--[if IE]></div><![endif]-->
        </body>
        
        </html>
        `,
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
    params.append("grant_type", "authorization_code");
    params.append("code", authorization_code);
    params.append("client_id", client_id);
    params.append("client_secret", client_secret);
    params.append("redirect_uri", redirect_uri);

    const response = await axios.post(tokenUrl, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { access_token } = response.data;
    // console.log("Access token retrieved:",access_token);

    res.json(access_token);
  } catch (error) {
    console.error(
      "Error while fetching access token:",
      error.response ? error.response.data : error.message
    );
    // res.status(500).send("Error while fetching access token");
  }
});

//get linnkedin data
app.post("/getLinkedInProfile", async (req, res) => {
  const { accessToken } = req.body;
  console.log("Access token retrieved:", accessToken);
  try {
    const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(response.data);
    // res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching profile:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Error fetching profile");
  }
});
app.post("/convertToMjml", async (req, res) => {
  const { templateData } = req.body;
  const mjmlOutput = jsonToMjml(templateData);
  res.send(mjmlOutput);
});
//convert mjml to html
app.post("/convertHtml", async (req, res) => {
  const { template } = req.body;

  try {
    // Convert MJML to HTML
    const { html, errors } = mjml2html(template);

    if (errors && errors.length > 0) {
      throw new Error(`MJML Conversion Errors: ${JSON.stringify(errors)}`);
    }
    res.send(html);
  } catch (error) {
    console.error("Error converting MJML to HTML:", error);
    res.status(500).send("Error converting MJML to HTML");
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
app.get("/auth", (req, res) => {
  res.redirect(url);
});
app.post("/oauthcallback", async (req, res) => {
  const code = req.body.code;
  // console.log(code)
  try {
    // Exchange the authorization code for an access token
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // console.log('Access tokens:', tokens);

    // Respond to the client
    // res.send('Authentication successful! You can now close this window.');
    res.json(tokens);
    // Now you can use oauth2Client to make authorized API calls
    // Example: const blogger = google.blogger({ version: 'v3', auth: oauth2Client });
  } catch (error) {
    console.error("Error retrieving access token", error);
    res.status(500).send("Authentication failed");
  }
});

//post template data
app.post("/templateData", async (req, res) => {
  const { imageUrl, template, userId, date } = req.body;
  const templateData = {
    userId: userId,
    image: imageUrl,
    template: template,
    date: date,
  };
  const db = client.db(dbName);
  const collection = db.collection("templateData");
  const result = await collection.insertOne(templateData);
});

//update template
app.post("/updateTemplateData", async (req, res) => {
  try {
    // Extract the update fields and filter criteria from the request body
    const { id, template } = req.body;
    // Connect to the database
    const db = client.db(dbName);
    const collection = db.collection("templateData");

    // Define the filter criteria and the update operation
    const filter = { _id: new ObjectId(id) };
    const update = { $set: { template } };

    // Perform the update operation
    const result = await collection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "No matching document found." });
    }

    res.status(200).json({ message: "Document updated successfully.", result });
  } catch (error) {
    console.error("Error updating template data:", error);
    res.status(500).json({ error: "An error occurred while updating the document." });
  }
});


//get template data
app.get("/templateData", async (req, res) => {
  try {
    const { userId } = req.query; // Extract userId from query parameters
    const db = client.db(dbName);
    const collection = db.collection("templateData");

    // Retrieve data from MongoDB based on userId
    const query = userId ? { userId: userId } : { userId: { $exists: false } }; // If userId is provided, filter by it
    const data = await collection.find(query).toArray();

    res.json(data);
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
  const { uid, email, date, password } = req.body;
  const userInfo = {
    id: uid,
    email: email,
    date: date,
    password: password,
  };
  const db = client.db(dbName);
  const collection = db.collection("eulermailUser");
  const result = await collection.insertOne(userInfo);
});
app.put("/eulermailUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { password, date } = req.body;
    const db = client.db(dbName);
    const collection = db.collection("eulermailUser");

    const updateDoc = {
      $set: {
        password: password,
        date: date,
      },
    };

    const result = await collection.updateOne({ id: id }, updateDoc);

    if (result.matchedCount === 0) {
      res.status(404).send("User not found");
    } else {
      res.send(result);
    }
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).send("Internal Server Error");
  }
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
