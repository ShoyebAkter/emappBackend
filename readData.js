// function readJsonFile(jsonFile) {
//     try {
//         const data = fs.readFileSync(jsonFile, 'utf8');
//         const jsonData = JSON.parse(data);
//         // return jsonData.orders;
//         return jsonData;
//     } catch (error) {
//         console.error('Error reading JSON file:', error);
//         return null;
//     }
// }

// const main = (targetProperties,data) => {
//     const matchingObjects = findSimilarProperties(data, targetProperties);
//     return matchingObjects;
// }




// const usersTargetProperties=["country"]







// const orderJson='./order.json';
// const customerJson='./customer.json';
// const salesJson='./sales.json';
// const usersJson='./user.json';
// const orderData = readJsonFile(orderJson)
// const customerData=readJsonFile(customerJson);
// const salesData=readJsonFile(salesJson);
// const usersData=readJsonFile(usersJson);
// // Function to check if a property name is similar to any of the target property names
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