"use strict";
const fs = require("fs");
//const path = require("path");
//const global = {};

class MoonlightDB {
    #COLLECTIONS_PATH;
    #DB_PATH;
    /*#CACHED_DATA = {
        COLLECTIONS: []
    };*/
    constructor({ dbpath }){
        this.#DB_PATH = dbpath;
        this.#COLLECTIONS_PATH = `${dbpath}/moonlight_db/collections`;
        this.#InitDB();
    };
    
    collection(collection_name){
        if(fs.existsSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`) === false) return new Error(`collection "${collection_name}" not found`);
        return {
            /**
                * Creates a cursor for a filter that can be used to iterate over results
                * @param {object} query — The filter predicate. If unspecified, then all items in the collection will match the predicate
                * @returns {Promise<Array>}
                * @example
                * db.collection("<collection_name>").find({id: "1234567890"}).then(data => {
                *   console.log(data);//success
                * }).catch(error => {
                *   console.log(error);//output => undefined
                * });
            */
            find: (query = {}) => {
                return new Promise((resolve, reject) => {
                    const entries = Object.entries(query);

                    const str = fs.readFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, "utf-8");
                    const data = JSON.parse(str);

                    if(data.length === 0) return resolve([]);
                    
                    const NewData = data.filter(object => {
                        if(entries.every(([key, value]) => object[key] === value)) return object;
                    });

                    if(NewData.length > 0){
                        return resolve(NewData);
                    }else if(NewData.length === 0){
                        return reject(undefined);
                    };
                });
            },
            /**
                * Fetches the first item that matches the filter
                * @param {object} query - Query for find Operation
                * @returns {Promise<object>}
                * @example
                * db.collection("<collection_name>").findOne({
                *   id: "1234567890",
                *   xp: "99999"
                * }).then(data => {
                *   console.log(data);//success
                * }).catch(error => {
                *   console.log(error);//output => undefined
                * });
            */
            findOne: (query = {}) => {
                return new Promise((resolve, reject) => {
                    const entries = Object.entries(query);

                    const str = fs.readFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, "utf-8");
                    const data = JSON.parse(str);

                    const findOneItem = data.findIndex(object => entries.every(([key, value]) => object[key] === value));

                    if(findOneItem === -1){
                        reject(undefined)
                    }else if(findOneItem >= 0){
                        resolve(data[findOneItem]);
                    };
                });
            },
            /**
                * Update multiple items in a collection
                * @param {object} query - The filter used to select the items to update
                * @param {object} options - The update operations to be applied to the items
                * @returns {Promise<string>}
                * @example
                * db.collection("<collection_name>").update({
                *   id: "1234567890",
                *   xp: "99999"
                * }, {"$set": {xp: "0"}})
            */
            update: (query = {}, options = {}) => {
                /* ------- COMPLETO (MÉTODO $SET) ------- */
                return new Promise((resolve, reject) => {
                    const entries = Object.entries(query);
                    const optionsMethod = Object.keys(options)[0];

                    const str = fs.readFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, "utf-8");
                    const data = JSON.parse(str);

                    if(optionsMethod === "$set"){
                        const NewData = data.filter(object => {
                            if(entries.every(([key, value]) => object[key] === value)) Object.assign(object, options[optionsMethod]);
                            return object;
                        });
                        
                        fs.writeFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, JSON.stringify(NewData, null, "\t"));
                        resolve();
                    }else{
                        reject("unknow method");
                    }
                });
            },
            /**
                * Update a single item in a collection
                * @param {object} query - The filter used to select the item to update
                * @param {object} options - The update operations to be applied to the item
                * @returns {Promise<string>}
                * @example
                * db.collection("<collection_name>").updateOne({
                *   id: "1234567890",
                *   xp: "99999"
                * }, {"$set": {xp: "0"}})
            */
            updateOne: (query = {}, options = {}) => {
                /* ------- COMPLETO (MÉTODO $SET) ------- */
                return new Promise((resolve, reject) => {
                    const entries = Object.entries(query);
                    const optionsMethod = Object.keys(options)[0];

                    const str = fs.readFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, "utf-8");
                    const data = JSON.parse(str);
                    
                    const searchIndex = data.findIndex(object => entries.every(([key, value]) => object[key] === value));
                    
                    if(searchIndex === -1){
                        return reject("not found");
                    }else if(searchIndex >= 0 && optionsMethod === "$set"){
                        data.splice(searchIndex, 1, Object.assign(data[searchIndex], options[optionsMethod]));
                        
                        fs.writeFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, JSON.stringify(data, null, "\t"));
                        resolve();
                    };
                });
            },
            /**
                * Inserts a single item into Database. If item passed in do not contain the **_id** field,
                * one will be added to each of the items missing it
                * @param {object} object - The item to insert
                * @example
                * db.collection("<collection_name>").insertOne({
                *   name: "user_123",
                *   xp: "99999"
                * })
            */
            insertOne: (object = {}) => {
                return new Promise((resolve, reject) => {
                    if(Object.keys(object).length === 0) return reject("cannot add an empty item");

                    const str = fs.readFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, "utf-8");
                    const data = JSON.parse(str);

                    const NewObjectToInsert = Object.assign({_id: _ObjectId()}, object);
                    //console.log(NewObjectToInsert);
                    data.push(NewObjectToInsert);
                    
                    fs.writeFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, JSON.stringify(data, null, "\t"));
                    resolve();
                });
            },
            /**
                * Inserts an array of items into database. If items passed in do not contain the **_id** field,
                * one will be added to each of the items missing it
                * @param {array} arrayObject - The items to insert
                * @example
                * db.collection("<collection_name>").insertMany([
                *   {a: "123"},
                *   {b: "456"},
                *   {c: "789"}
                * ])
            */
            insertMany: (arrayObject = []) => {
                return new Promise((resolve, reject) => {
                    if(arrayObject.length === 0) return reject("cannot add an empty list");

                    const str = fs.readFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, "utf-8");
                    const data = JSON.parse(str);

                    const FILTER_ARRAY = arrayObject.map(object => Object.assign({_id: _ObjectId()}, object));
                    FILTER_ARRAY.forEach(object => data.push(object));
                    
                    fs.writeFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, JSON.stringify(data, null, "\t"));
                    resolve();
                });
            },
            /**
                * Delete multiple items from a collection
                * @param {object} query - The filter used to select the items to remove
                * @returns {Promise<string>}
                * @example
                * db.collection("<collection_name>").delete({
                *   id: "1234567890",
                *   xp: "99999"
                * })
            */
            delete: (query = {}) => {
                return new Promise((resolve, reject) => {
                    const entries = Object.entries(query);

                    const str = fs.readFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, "utf-8");
                    const data = JSON.parse(str);

                    const NewData = data.filter(object => {
                        if(entries.every(([key, value]) => object[key] === value)){
                            return false;
                        }else{
                            return true;
                        };
                    });
                    
                    fs.writeFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, JSON.stringify(NewData, null, "\t"));
                    resolve();
                });
            },
            /**
                * Delete a item from a collection
                * @param {object} query - The filter used to select the item to remove
                * @returns {Promise<string>}
                * @example
                * db.collection("<collection_name>").deleteOne({
                *   id: "1234567890",
                *   xp: "99999"
                * })
            */
            deleteOne: (query = {}) => {
                return new Promise((resolve, reject) => {
                    const entries = Object.entries(query);

                    const str = fs.readFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, "utf-8");
                    const data = JSON.parse(str);
                    
                    const searchIndex = data.findIndex(object => entries.every(([key, value]) => object[key] === value));
        
                    if(searchIndex === -1){
                        return reject("not found");
                    }else if(searchIndex >= 0){
                        data.splice(searchIndex, 1);
                        
                        fs.writeFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, JSON.stringify(data, null, "\t"));
                        resolve();
                    };
                });
            },
            length: JSON.parse(fs.readFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, "utf-8")).length
        };
    };

    /* ------- COLLECTIONS (db.collections) ------- */

    get collections(){
        if(fs.existsSync(this.#COLLECTIONS_PATH) === false) return [];
        const result_of_read = fs.readdirSync(this.#COLLECTIONS_PATH);
        return result_of_read.filter(file => {
            if(file.endsWith(".dat") === true){
                return file;
            };
        }).map(filename => filename.replace(/.dat/g, ""));
    };

    /**
        * creates a new collection where data will be stored
        * @param {string} collection_name
        * @returns {Promise<void>}
        * @example
        * db.createCollection("users").then(() => {
        *   console.log("ok");
        * }).catch((error) => {
        *   console.log("error:", error);
        * });
    */
    createCollection(collection_name){
        return new Promise((resolve, reject) => {
            if(fs.existsSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`) === true) return reject("collection already exists");
            
            fs.writeFileSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`, "[]");
            resolve();
        });
    };

    /**
        * deletes a collection, including all items and indexes
        * @param {string} collection_name
        * @returns {Promise<void>}
        * @example
        * db.deleteCollection("users").then(() => {
        *   console.log("ok");
        * }).catch((error) => {
        *   console.log("error:", error);
        * });
    */
    deleteCollection(collection_name){
        return new Promise((resolve, reject) => {
            if(fs.existsSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`) === false) return reject("this collection does not exist");
            
            fs.unlinkSync(`${this.#COLLECTIONS_PATH}/${collection_name}.dat`);
            resolve();
        });
    };

    /* ------- INITIALIZATION ------- */

    #InitDB(){
        if(fs.existsSync(this.#DB_PATH) === false){
            fs.mkdirSync(`${this.#DB_PATH}/moonlight_db/collections`, {recursive: true});
            fs.mkdirSync(`${this.#DB_PATH}/moonlight_db/settings`, {recursive: true});
        };
    };
};

module.exports = {
    MoonlightDB: MoonlightDB
};


function _ObjectId(){
    const length = 32;
    const ID = [];
    const generator = {
        RandomInt: function({ min=0, max=9 } = {}){
            this.min = Math.ceil(min);
            this.max = Math.floor(max);
            return Math.floor((Math.floor(Math.random() * (this.max - this.min + 1)) + this.min));
        }
    };
    const dictionary = [
        "a", "b", "c",
        "d", "e", "f",
        "g", "h", "i",
        "j", "k", "l",
        "m", "n", "o",
        "p", "q", "r",
        "s", "t", "u",
        "v", "w", "x",
        "y", "z",
    ];
    
    for(let index=0; index < length; index++){
        const operator = generator.RandomInt({ min: 0, max: 1 });
        if(operator === 0){
            //letra;
            ID.push(dictionary[generator.RandomInt({ min: 0, max: 25 })]);
        }else if(operator === 1){
            //número;
            ID.push(generator.RandomInt({ min: 0, max: 9 }));
        };
    };
    
    return ID.join("");
};