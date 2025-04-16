import { useState } from "react";

const LoanForm = ({onChange}) => {
    const [amount, setAmount] = useState(0)
    const [termYears, setTermYears] = useState(0)

    const handleAmountChange = (event) => {
        const value = parseFloat(event.target.value)
        setAmount(value)
        onChange({amount: value, termYears})
    }

    const handleTermChange = (event) => {
        const value = parseFloat(event.target.value)
        setTermYears(value)
        onChange({amount, termYears: value})
    }

    return (
        <div className="input-lines">
            <div className="input-line">
                <label>Сумма кредита (руб.):</label>
                <input 
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    min={0}
                    className="input-width"
                />
            </div>
            <div className="input-line">
                <label>Срок кредита (лет):</label>
                <input 
                    type="number"
                    value={termYears}
                    onChange={handleTermChange}
                    min={0}
                    className="input-width"
                />
            </div>
        </div>
    )
}

export default LoanForm