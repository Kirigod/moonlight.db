<div align="center">
  <br>
  <h1>moonlight.db</h1>
  <p>
    <a href="https://www.npmjs.com/package/moonlight.db"><img src="https://nodei.co/npm/moonlight.db.png?mini=true" alt="npm installnfo"/></a>
  </p>
</div>

## Table of contents

- [About](#about)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Links](#links)
- [Help](#help)

## About

Moonlight.DB is a lightweight local database with no dependencies and easy to use.

## Installation

**[Node.js](https://nodejs.org) v14.0.0 or newer is recommended.**  

Install: `npm install moonlight.db`

## Getting Started

Setting up the Moonlight.DB instance

***database.js***
```js
const DatabaseManager = require("moonlight.db");

module.exports = {
    connection: new DatabaseManager.MoonlightDB({
        dbpath: __dirname + "/database"
    })
};
```

Example Usage

***test.js***
```js
const database = require("./database.js");
const db = database.connection;

if(db.collections.includes("users") === false) db.createCollection("users");

/* ------- insert item into db ------- */
db.collection("users").insertOne({
    name: "TestUser",
    age: 26,
    banned: false
}).then(() => {
    //ok user created;
}).catch(error => {
    //error;
    console.log(error);
});

/* ------- find item ------- */
db.collection("users").findOne({name: "TestUser"}).then(item => {
    //ok found the user;
    console.log(item);
    /*
        console output => {
          _id: "3bgfvx99l1t99j0pxouv3u8y00fy6n49",
          name: "TestUser",
          age: 26,
          banned: false
        }
    */
}).catch(() => {
    //error not found;
});

/* ------- update item ------- */
db.collection("users").updateOne({_id: "3bgfvx99l1t99j0pxouv3u8y00fy6n49"}, {
    "$set": {
        banned: true
    }
}).then(() => {
    //ok user updated;
}).catch(error => {
    //error not found;
    console.log(error);
});

/* ------- delete item ------- */
db.collection("users").deleteOne({name: "TestUser", banned: true}).then(() => {
    //ok user removed from db;
}).catch(error => {
    console.log(error);
});
```

## Links

- [GitHub](https://github.com/Kirigod/moonlight.db)
- [NPM](https://www.npmjs.com/package/moonlight.db)

## Help

If you are experiencing problems, or you just need a nudge in the right direction, please do not hesitate to create a New Issue on [Github](https://github.com/Kirigod/moonlight.db) repository.
