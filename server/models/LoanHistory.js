// server/models/History.js

import mongoose from "mongoose"

const loanHistorySchema = new mongoose.Schema({
    loanType: String,
    loanAmount: Number,
    termYears: Number,
    monthlyPayment: Number,
    totalPayment: Number
}, { timestamps: true })

const LoanHistory = mongoose.model('loan-histories', loanHistorySchema)

export default LoanHistory