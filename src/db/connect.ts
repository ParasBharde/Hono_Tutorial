import mongoose from "mongoose";
require('dotenv').config();

export default async function dbConnection() {
    await mongoose.connect(String(process.env?.MONGODB_URI))
    console.log("DB COnnect Successfully...")
}