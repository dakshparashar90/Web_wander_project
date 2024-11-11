const mongoose = require('mongoose');
const initData=require('./data.js');
const Listing =require('../models/listing.js');

const MongooUrl='mongodb://localhost:27017/wanderlust';
main().then(()=>{
    console.log("connected to db");
}).catch((err) =>{
    console.log(err);
})

async function main() {
    await mongoose.connect(MongooUrl);
}


const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data= initData.data.map((obj)=>(
        {...obj,owner:"672b1a3dd35f961ef4471fbb"}))
    await Listing.insertMany(initData.data);
    console.log('data was instialised');

}

initDB();