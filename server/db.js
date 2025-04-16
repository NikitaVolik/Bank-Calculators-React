// server/db.js

import mongoose from "mongoose";

const MONGO_URI = "mongodb://localhost:27017/bank"

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
        console.log("MongoDB подключена")

        const collections = await mongoose.connection.db.listCollections().toArray()
        console.log(collections.map(c => c.name))
    } catch (error) {
        console.log("Ошибка подключения к MongoDB", error)
        process.exit(1)
    }
}

export default connectDB