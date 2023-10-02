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
// function findSimilarProperties(array, targetProperties) {
//     const resultArray = [];
//     const similarityThreshold = 0.8; 
//     for (const obj of array) {
//         const matchingProperties = {};

//         for (const key in obj) {
//             for (const target of targetProperties) {
//                 const similarity = natural.JaroWinklerDistance(key, target);
//                 if (similarity >= similarityThreshold) {
//                     matchingProperties[target] = obj[key];
//                     break;
//                 }
//             }
//         }

//         if (Object.keys(matchingProperties).length > 0) {
//             resultArray.push(matchingProperties);
//         }
//     }

//     return resultArray;
// }
// const main = (targetProperties,data) => {
//     const matchingObjects = findSimilarProperties(data, targetProperties);
//     return matchingObjects;
// }

// const ordertargetProperties = ['order', 'total','date','price','name','product','item'];
// const customerTargetProperties=["birthdate","tier","details","role"]
// const salesTargetProperties=["items","product","sale","date","price"]
// const usersTargetProperties=["country"]
// const newOrderArray=main(ordertargetProperties,orderData.orders);
// const newCustomerArray=main(customerTargetProperties,customerData.customer);
// const newSalesArray=main(salesTargetProperties,salesData.sales)
// const newUsersArray=main(usersTargetProperties,usersData.users)

// const newUsersArrayWithCountry = newUsersArray.map((user) => ({
//   ...user,
//   id: countries.alpha2ToAlpha3(user.country),
// }));

// const orderJson='./order.json';
// const customerJson='./customer.json';
// const salesJson='./sales.json';
// const usersJson='./user.json';
// const orderData = readJsonFile(orderJson)
// const customerData=readJsonFile(customerJson);
// const salesData=readJsonFile(salesJson);
// const usersData=readJsonFile(usersJson);
// // Function to check if a property name is similar to any of the target property names
