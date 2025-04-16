// server/models/Users.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    login: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    role: {type: String, required: true}
}, {timestamps: true})

const User = mongoose.model("users", userSchema)

export default User