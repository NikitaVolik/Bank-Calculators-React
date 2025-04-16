// client/src/components/AdminPanel.js

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import EditLoanModal from "./EditLoanModal.js"
import EditDepositModal from "./EditDepositModal.js"
import LoanHistory from "./LoanHistoryBlock.js"
import DepositHistory from "./DepositHistoryBlock.js"
import {
    fetchLoanTypes, 
    addLoanType, 
    deleteLoanType, 
    updateLoanType, 
    fetchDepositTypes, 
    addDepositType, 
    deleteDepositType, 
    updateDepositType
} from "../server-api.js"
import "./AdminPanel.sass"

// const API_BASE_URL = process.env.REACT_APP_API_URL + process.env.REACT_APP_API_ENDPOINT

const AdminPanel = () => {
    const [mode, setMode] = useState('loans')
    const [loanTypes, setLoanTypes] = useState([])
    const [depositTypes, setDepositTypes] = useState([])
    const [newLoan, setNewLoan] = useState({
        loanType: '',
        name: '',
        description: '',
        annualRate: ''
    })
    const [newDeposit, setNewDeposit] = useState({
        depositType: '',
        name: '',
        description: '',
        annualRate: '',
        fixedTermMonths: 0
    })

    const [editLoan, setEditLoan] = useState(null)
    const [editDeposit, setEditDeposit] = useState(null)
    const [showHistory, setShowHistory] = useState(null)
    const [error, setError] = useState('')
    const [addError, setAddError] = useState('')

    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const navigate = useNavigate()

    useEffect(() => {
        if (role !== 'admin') return
        fetchLoanTypes().then(setLoanTypes).catch((err) => console.error(err))
        fetchDepositTypes().then(setDepositTypes).catch((err) => console.error(err))
    }, [role])

    /*
    const fetchLoanTypes = async () => {
        try {
            const response = await fetch(API_BASE_URL + 'types')
            const data = await response.json()
            setLoanTypes(data)
        } catch (err) {console.error('Ошибка загрузки типов кредитов', err)}
    }
    console.log('Loan Types', loanTypes)
    */
    
    const handleAddLoan = async () => {
        if (!newLoan.loanType || !newLoan.name || !newLoan.description || !newLoan.annualRate) {
            setAddError("Заполните все поля")
            return
        } 
        // console.log(newLoan)
        try {
            const loanToSend = {...newLoan, annualRate: Number(newLoan.annualRate)}
            await addLoanType(loanToSend, token)
            setNewLoan({loanType: '', name: '', description: '', annualRate: ''})
            setAddError('')
            
            const updatedLoans = await fetchLoanTypes()
            setLoanTypes(updatedLoans)
        } catch (err) {
            setAddError(err.message)
        }
    }

    const handleAddDeposit = async () => {
        if (!newDeposit.depositType || !newDeposit.name || !newDeposit.description || !newDeposit.annualRate || 
            newDeposit.fixedTermMonths === undefined || newDeposit.fixedTermMonths === null) {
            setAddError("Заполните все поля")
            return
        }
        // console.log(newLoan)
        try {
            const depositToSend = {...newDeposit, annualRate: Number(newDeposit.annualRate), fixedTermMonths: Number(newDeposit.fixedTermMonths) || 0}
            await addDepositType(depositToSend, token)
            setNewDeposit({depositType: '', name: '', description: '', annualRate: '', fixedTermMonths: 0})
            setAddError('')
            
            const updatedDeposits = await fetchDepositTypes()
            setDepositTypes(updatedDeposits)
        } catch (err) {
            setAddError(err.message)
        }
    }

    const handleDeleteLoan = async (loanType) => {
        try {
            await deleteLoanType(loanType, token)
            setLoanTypes(loanTypes.filter((loan) => loan.loanType !== loanType))
        } catch (err) {
            setAddError('Ошибка при удалении кредита')
        }
    }

    const handleDeleteDeposit = async (depositType) => {
        try {
            await deleteDepositType(depositType, token)
            setDepositTypes(depositTypes.filter((deposit) => deposit.depositType !== depositType))
        } catch (err) {
            setAddError('Ошибка при удалении депозита')
        }
    }

    const handleUpdateLoan = async (updatedLoan) => {
        try {
            await updateLoanType(updatedLoan, token)
            const updatedLoans = await fetchLoanTypes()
            setLoanTypes(updatedLoans)
            setEditLoan(null)
        } catch (err) {
            setAddError("Ошибка обновления кредита")
        }
    }

    const handleUpdateDeposit = async (updatedDeposit) => {
        try {
            console.log('handleUpdateDeposit +')
            await updateDepositType(updatedDeposit, token)
            console.log('handleUpdateDeposit -')
            const updatedDeposits = await fetchDepositTypes()
            setDepositTypes(updatedDeposits)
            setEditDeposit(null)
        } catch (err) {
            console.error("Ошибка в handleUpdateDeposit", err)
            setAddError("Ошибка обновления депозита")
        }
    }

    if (role !== 'admin') {
        return (
            <div className="container denied">
                <h2>Отказано в доступе</h2>
                <p>У Вас нет прав для просмотра этой страницы</p>
                <button className="green-button" onClick={() => navigate('/')}>На главную</button>
            </div>
        )
    }

    const handleCloseModal = () => {
        setEditLoan(null)
        setEditDeposit(null)
    }

    return (
        <div className="container admin-panel">
            <h2>Панель администратора</h2>
            {error && <p className="error-text">{error}</p>}

            <div className="mode-switcher">
                <button className={mode === 'loans' ? 'active green-button' : 'orange-button'} onClick={() => setMode('loans')}>Кредиты</button>
                <button className={mode === 'deposits' ? 'active green-button' : 'orange-button'} onClick={() => setMode('deposits')}>Депозиты</button>
            </div>

            <div className="history-block">
                <button
                    className={showHistory? 'orange-button' : 'green-button'} 
                    onClick={() => setShowHistory(!showHistory)}>
                    {!showHistory? 'Показать' : 'Скрыть'} историю запросов
                </button>
                {showHistory && mode === 'loans' && <LoanHistory />}
                {showHistory && mode === 'deposits' && <DepositHistory />}
            </div>

            <div className="bordered admin-list">
                <h3>Добавить новый {mode === 'loans' ? 'кредит' : 'депозит'}</h3>
                { mode === 'loans' ? (
                    <>
                        <div className="input-line">
                            <label>Код типа кредита</label>
                            <input 
                                type="text" 
                                placeholder="mortgage" 
                                value={newLoan.loanType} 
                                onChange={(e) => setNewLoan({...newLoan, loanType: e.target.value})}
                            />
                        </div>
                        <div className="input-line">
                            <label>Название</label>
                            <input 
                                type="text"
                                placeholder="Ипотечный кредит"
                                value={newLoan.name}
                                onChange={(e) => setNewLoan({...newLoan, name: e.target.value})}
                            />
                        </div>
                        <div className="input-line">
                            <label>Описание</label>
                            <input 
                                type="text"
                                placeholder="Рассчитайте ежемесячный платёж по ипотеке с учётом процентной ставки"
                                value={newLoan.description}
                                onChange={(e) => setNewLoan({...newLoan, description: e.target.value})}
                            />
                        </div>
                        <div className="input-line">
                            <label>Процентная ставка</label>
                            <input 
                                type="number"
                                placeholder="9.6"
                                value={newLoan.annualRate}
                                onChange={(e) => setNewLoan({...newLoan, annualRate: Number(e.target.value)})}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="input-line">
                            <label>Код типа депозита</label>
                            <input 
                                type="text" 
                                placeholder="fixed-deposit" 
                                value={newDeposit.depositType} 
                                onChange={(e) => setNewDeposit({...newDeposit, depositType: e.target.value})}
                            />
                        </div>
                        <div className="input-line">
                            <label>Название</label>
                            <input 
                                type="text"
                                placeholder="Срочный вклад"
                                value={newDeposit.name}
                                onChange={(e) => setNewDeposit({...newDeposit, name: e.target.value})}
                            />
                        </div>
                        <div className="input-line">
                            <label>Описание</label>
                            <input 
                                type="text"
                                placeholder="Вклад с фиксированной ставкой"
                                value={newDeposit.description}
                                onChange={(e) => setNewDeposit({...newDeposit, description: e.target.value})}
                            />
                        </div>
                        <div className="input-line">
                            <label>Процентная ставка</label>
                            <input 
                                type="number"
                                placeholder="5.5"
                                value={newDeposit.annualRate}
                                onChange={(e) => setNewDeposit({...newDeposit, annualRate: Number(e.target.value)})}
                            />
                        </div>
                        <div className="input-line">
                            <label>Фиксированный срок (в месяцах, 0 - без ограничений)</label>
                            <input 
                                type="number"
                                placeholder="12"
                                value={newDeposit.fixedTermMonths}
                                onChange={(e) => setNewDeposit({...newDeposit, fixedTermMonths: Number(e.target.value)})}
                            />
                        </div>
                    </>
                )}
                { addError && <p className="error-text">{addError}</p>}
                { mode === 'loans' ? ( 
                    <>
                        <button className="green-button" onClick={handleAddLoan}>Добавить</button>
                    </>
                ) : (
                    <>
                        <button className="green-button" onClick={handleAddDeposit}>Добавить</button>
                    </>
                )}
            </div>

            <div className="bordered admin-list">
                <h3>Существующие {mode === 'loans' ? 'кредиты' : 'депозиты'}</h3>
                {mode === 'loans' ? (
                    <>
                        {loanTypes.length === 0 ? (
                            <p className="info-text">Пока ничего нет</p>
                        ):(
                            <ul className="loans-list">
                                {loanTypes.map((loan) => (
                                    <li key={loan.loanType}>
                                        <div><strong>{loan.loanType}:</strong> {loan.name} - <em>{loan.annualRate}%</em></div>
                                        <div className="manipulate-buttons">
                                            <button className="button" onClick={() => {setEditLoan(loan)}}>Изменить</button>
                                            <button className="button red" onClick={() => handleDeleteLoan(loan.loanType)}>Удалить</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                ) : (
                    <>
                        {depositTypes.length === 0 ? (
                            <p className="info-text">Пока ничего нет</p>
                        ):(
                            <ul className="loans-list">
                                {depositTypes.map((deposit) => (
                                    <li key={deposit.depositType}>
                                        <div><strong>{deposit.depositType}:</strong> {deposit.name} - <em>{deposit.annualRate}%</em></div>
                                        <div className="manipulate-buttons">
                                            <button className="button" onClick={() => {setEditDeposit(deposit)}}>Изменить</button>
                                            <button className="button red" onClick={() => handleDeleteDeposit(deposit.depositType)}>Удалить</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>
            { editLoan && <EditLoanModal loan={editLoan} onClose={handleCloseModal} onUpdate={handleUpdateLoan} /> }
            { editDeposit && <EditDepositModal deposit={editDeposit} onClose={handleCloseModal} onUpdate={handleUpdateDeposit} /> }
        </div>
    )
}

export default AdminPanel