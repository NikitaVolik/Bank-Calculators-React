// server/models/LoanCollection.js

import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
    loans: {
        type: Map, // Используем динамическое хранилище (словарь)
        of: new mongoose.Schema({
            name: { type: String, required: true },
            description: { type: String, required: true },
            annualRate: { type: Number, required: true }
        })
    }
}, { timestamps: true });

const LoanCollection = mongoose.model("loans", loanSchema);

export default LoanCollection;