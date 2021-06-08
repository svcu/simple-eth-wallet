const mongoose = require("mongoose")
require("dotenv").config({path: "./.env"})


async function connection(){
    try{
        await mongoose.connect(process.env.DB.toString(), {useNewUrlParser: true})
        
        console.log("Succesfull connection")
    }catch (e){
        
        console.log("Error on DB connection")
        
        process.exit(1)
    }
}

connection();

module.exports = {
    connection
}

