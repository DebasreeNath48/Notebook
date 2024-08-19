const mongoose = require("mongoose");
const mongoURI = "mongodb://localhost:27017/inotebook";

async function connectToMongo(){
    await mongoose.connect(mongoURI).then(()=>console.log("yay connected")).catch(err=>console.log(err));
}

module.exports = connectToMongo;