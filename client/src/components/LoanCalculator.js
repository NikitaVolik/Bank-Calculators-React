// client/src/components/LoanCalculator.js

import { useEffect, useState } from "react";
import { calculateLoan, fetchLoanTypes } from "../server-api";
import LoanForm from "./LoanForm";
import LoanResults from "./LoanResults";
import { handleClickGA } from "./GA";
import { Helmet } from "react-helmet-async";

const LoanCalculator = () => {
    const [calculators, setCalculators] = useState([])
    const [selectedType, setSelectedType] = useState("")
    const [loanData, setLoanData] = useState({amount: 0, termYears: 0})
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Загрузка типов кредитов
    useEffect(() => {
        fetchLoanTypes()
            .then((data) => {
                setCalculators(data);
                if (data.length > 0) {
                    setSelectedType(data[0].loanType)
                }
            })
            .catch((error) => console.error(error))
    }, []);

    // Выбор типа кредита
    const handleTypeChange = (event) => {
        setSelectedType(event.target.value)
    }

    // Обработка ввода данных
    const handleDataChange = (data) => {
        setLoanData(data)
    }

    // Расчёты посредством API
    const handleCalculate = () => {
        setLoading(true)
        setError(null)

        handleClickGA({
            category: 'LoanCalculator',
            action: 'CalculateLoan Click',
            label: 'CalculateLoan Button'
        })

        calculateLoan(selectedType, loanData.amount, loanData.termYears)
            .then((data) => {
                setResults(data)
                setLoading(false)
            })
            .catch((error) => {
                setResults(null)
                setError(error.message)
                setLoading(false)
            })
    }

    return (
        <div>
            <Helmet>
                <title>Кредитный калькулятор - расчёт кредита онлайн</title>
                <meta name='description' content='Узнайте примерный платёж, ставку и другие предварительные условия по кредитам'/>
                <meta property="og:title" content='Кредитный калькулятор онлайн' />
                <meta property='og:description' content='Быстрый расчёт платежей и ставок по кредитам в вашем браузере.' />
            </Helmet>
            <div className="gray-bg">
                <div className="container">
                    <h1>Кредитный калькулятор</h1>
                    <h3>Узнайте примерный платёж, ставку и другие предварительные условия по кредитам</h3>
                </div>
            </div>            
            <div className="container">
                <div className="bordered">
                    <h2>Рассчитайте свой кредит</h2>
                    <div className="calculator">
                        <div className="input-line">
                            <label>Выберите тип кредита</label>
                            <select className="input-width" value={selectedType} onChange={handleTypeChange}>
                                {calculators.map((calc) => (
                                    <option key={calc.loanType} value={calc.loanType}>{calc.name}</option>
                                ))}
                            </select>
                        </div>

                        <LoanForm onChange={handleDataChange} />
                    
                        {error && <p className="error-text">{error}</p>}
                        
                        <button className="green-button" onClick={handleCalculate} disabled={loading}>
                            {loading ? "Расчёт..." : "Рассчитать"}
                        </button>
                    </div>

                    {results && <LoanResults results={results} />}
                </div>
            </div>
        </div>
    )
}

export default LoanCalculator