// server/models/DepositCollection.js

import mongoose from "mongoose";

const depositSchema = new mongoose.Schema({
    deposits: {
        type: Map,
        of: new mongoose.Schema({
            name: { type: String, required: true },
            description: { type: String, required: true },
            annualRate: { type: Number, required: true },
            fixedTermMonths: { type: Number, required: true, min: 0, default: 0 }
        })
    }
}, { timestamps: true })

const DepositCollection = mongoose.model("deposits", depositSchema)

export default DepositCollection