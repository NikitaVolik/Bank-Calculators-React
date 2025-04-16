// server/models/History.js

import mongoose from "mongoose"

const depositHistorySchema = new mongoose.Schema({
    depositType: String,
    depositAmount: Number,
    termYears: Number,
    totalAmount: Number,
    interest: Number,
    fixedTermMonths: Number
}, { timestamps: true })

const DepositHistory = mongoose.model('deposit-histories', depositHistorySchema)

export default DepositHistory