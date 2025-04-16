// client/src/components/DepositCalculator.js

import { useEffect, useState } from "react"
import { calculateDeposit, fetchDepositTypes } from "../server-api"
import DepositForm from "./DepositForm"
import DepositResults from "./DepositResults"

const DepositCalculator = () => {
    const [calculators, setCalculators] = useState([])
    const [selectedType, setSelectedType] = useState("")
    const [depositData, setDepositData] = useState({ amount: 0, termYears: 0 })
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchDepositTypes()
            .then((data) => {
                setCalculators(data)
                if (data.length > 0) {
                    setSelectedType(data[0].depositType)
                    setDepositData((prev) => ({
                        ...prev,
                        termYears: data[0].fixedTermMonths > 0 ? data[0].fixedTermMonths / 12 : prev.termYears
                    }))
                }
            })
            .catch((error) => console.error(error))
    }, [])

    const handleTypeChange = (event) => {
        const newType = event.target.value
        setSelectedType(newType)
        const selectedDeposit = calculators.find((calc) => calc.depositType === newType)
        if (selectedDeposit && selectedDeposit.fixedTermMonths > 0) {
            setDepositData((prev) => ({
                ...prev,
                termYears: selectedDeposit.fixedTermMonths / 12
            }))
        }
    }

    const handleDataChange = (field, value) => {
        setDepositData((prev) => ({
            ...prev,
            [field]: value
        }))
    }

    const handleCalculate = () => {
        setLoading(true)
        setError(null)

        console.log(typeof(depositData.amount), depositData.amount)

        calculateDeposit(selectedType, depositData.amount, depositData.termYears)
            .then((data) => {
                setResults(data)
            })
            .catch((error) => {
                setResults(null)
                setError(error.message)
            })
            .finally(() => setLoading(false))
    }

    const selectedDeposit = calculators.find((calc) => calc.depositType === selectedType)
    const isFixedTerm = selectedDeposit && selectedDeposit.fixedTermMonths > 0

    return (
        <div>
            <div className="gray-bg">
                <div className="container">
                    <h1>Калькулятор вкладов</h1>
                    <h3>Узнайте доходность и итоговую сумму вашего вклада</h3>
                </div>
            </div>
            <div className="container">
                <div className="bordered">
                    <h2>Рассчитайте свой вклад</h2>
                    <div className="calculator">
                        <div className="input-line">
                            <label>Выберите тип вклада</label>
                            <select className="input-width" value={selectedType} onChange={handleTypeChange}>
                                {calculators.map((calc) => (
                                    <option key={calc.depositType} value={calc.depositType}>
                                        {calc.name} {calc.fixedTermMonths > 0 ? `(${calc.fixedTermMonths} мес.)` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <DepositForm 
                            onChange={handleDataChange} 
                            termDisabled={isFixedTerm} 
                            fixedTermYears={isFixedTerm ? selectedDeposit.fixedTermMonths / 12 : null}
                            initialTermYears={depositData.termYears}
                        />

                        {error && <p className="error-text">{error}</p>}

                        <button className="green-button" onClick={handleCalculate} disabled={loading}>
                            {loading ? "Расчёт..." : "Рассчитать"}
                        </button>
                    </div>

                    {results && <DepositResults results={results} />}
                </div>
            </div>
        </div>
    )
}

export default DepositCalculator