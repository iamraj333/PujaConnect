const mongoose=require('mongoose');

const MongoDBConnect=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("PujaConnection MongoDB connected successfully")
    }
    catch(e){
        console.log("MongoDB connection failed:  ",e)
        process.exit(1)
    }
}

module.exports=MongoDBConnect