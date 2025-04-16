// client/src/components/LoanHistoryBlock.js

import React, {useEffect, useState} from "react"
import "./HistoryBlock.sass"

const API_BASE_URL = process.env.REACT_APP_API_URL + process.env.REACT_APP_API_ENDPOINT

const LoanHistory = () => {

    const [historyData, setHistoryData] = useState([])
    const [error, setError] = useState(null)

    const loanHistory = async () => {

        const token = localStorage.getItem('token')
        if (!token) {
            setError("Токен авторизации отсутствует")
            return
        }

        try {
            const response = await fetch(API_BASE_URL + '/loan-history', {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${token}`
                }
            })

            if(response.ok) {
                const data = await response.json()
                setHistoryData(data)
            } else {
                setError(`Error: ${response.status}: ${response.statusText}`)
                // console.log('Error:', response.status, response.statusText)
            }
        } catch (err) {
            // console.error('Fetch error:', err)
            setError('Ошибка при обращении к серверу')
        }
    }
    
    const clearHistory = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            setError("Токен авторизации отсутствует")
            return
        }

        try {
            const response = await fetch(API_BASE_URL + '/loan-history', {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json", 
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.ok) {
                setHistoryData([])
                setError(null)
            } else {
                setError(`Error: ${response.status}: ${response.statusText}`)
            }
        } catch (err) {
            setError('Ошибка при обращении к серверу')
        }
    }

    const exportToCSV = () => {
        if (!historyData.length) {
            setError("Нет данных для экспорта")
            return
        }
        
        const headers = ['loanType', 'loanAmount', 'termYears', 'monthlyPayment', 'totalPayment']
        const csvContent = [
            headers.join(';'),
            ...historyData.map(row => headers.map(field => row[field] ?? '').join(';'))
        ].join('\n')

        const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8'})

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const timestamp = new Date().toISOString().slice(0, 10)
        link.download = 'loan_history_export_' + timestamp + '.csv'
        document.body.appendChild(link) 
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    }

    useEffect(() => {
        loanHistory()
    }, [])

    return (
        <div className="history bordered">
            {error ? (
                <p>{error}</p>
            ) : historyData.length === 0 ? (
                <p>Загрузка данных</p>
            ) : (
                <>
                    <div className="wrapper">
                        <div className="link green-button" onClick={exportToCSV}>Экспорт</div>
                        <div className="link orange-button" onClick={clearHistory}>Очистить</div>
                    </div>
                    <ul className="history-list">
                        {historyData.map((line) => (
                            <li key={line._id}>
                                {line.loanType}, {line.loanAmount}, {line.termYears}, {line.monthlyPayment}, {line.totalPayment}
                            </li>
                        ))}
                    </ul>
                    <div className="wrapper">
                        <div className="link green-button" onClick={exportToCSV}>Экспорт</div>
                        <div className="link orange-button" onClick={clearHistory}>Очистить</div>
                    </div>
                </>
            )}
        </div>
    )
}

export default LoanHistory