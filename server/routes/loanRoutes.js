// server/routes/loanRoutes.js

import express from "express"
import { authenticate, isAdmin } from "./auth.js"
import LoanCollection from "../models/LoanCollection.js"
import LoanHistory from "../models/LoanHistory.js"
import DepositHistory from "../models/DepositHistory.js"
import nodemailer from "nodemailer"
import dotenv from 'dotenv'
import DepositCollection from "../models/DepositCollection.js"

dotenv.config()

const router = express.Router()


// настройка почтового транспорта для отправки email
const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

/************************* 
Публичная часть
*************************/

// Блок работы с кредитами 

// Функция расчёта калькулятора кредита
function calculateLoan({loanAmount, annualRate, termYears}) {
    const monthlyRate = annualRate / 12 / 100 // Ежемесячная ставка
    const totalMonths = termYears * 12 // Количество месяцев
    const overallRate = Math.pow(1 + monthlyRate, totalMonths) // Общая ставка
    const monthlyPayment = (loanAmount * monthlyRate * overallRate) / (overallRate - 1) // Ежемесячный платёж
    const totalPayment = monthlyPayment * totalMonths // Общая сумма выплат

    return {
        monthlyPayment: Math.round(monthlyPayment),
        totalPayment: Math.round(totalPayment)
    }
}

// Расчёт кредита
router.post("/calculate", async (req, res) => {
    const { loanType, loanAmount, termYears } = req.body // Получение параметров запроса

    if (!loanType || typeof loanType !== 'string') {
        return res.status(400).json({ error: 'Тип кредита должен быть строкой' })
    }

    if (!loanAmount || typeof loanAmount !== 'number' || loanAmount <= 0) {
        return res.status(400).json({ error: 'Сумма кредита должна быть положительным целым числом' })
    }

    if (!termYears || typeof termYears !== 'number' || termYears <= 0) {
        return res.status(400).json({ error: 'Годы срока должны быть положительным целым числом' })
    }

    try {
        const loanData = await LoanCollection.findOne()

        if (!loanData || !loanData.loans.has(loanType)) {
            return res.status(400).json({ error: "Invalid loan type" })
        }

        const { annualRate, name } = loanData.loans.get(loanType)
        const result = calculateLoan({ loanAmount, annualRate, termYears })

        const historyEntry = new LoanHistory({
            loanType,
            loanAmount,
            termYears,
            monthlyPayment: result.monthlyPayment,
            totalPayment: result.totalPayment
        })

        await historyEntry.save()

        res.json({
            loanType,
            name,
            ...result
        })
    } catch (error) {
        res.status(500).json({ error: "Ошибка базы данных:", details: error.message })
    }
})

// Получение списка и описания кредитов
router.get("/types", async (req, res) => {
    try {
        const loanData = await LoanCollection.findOne()
        if (!loanData) return res.json([])

        const availableCalculators = Array.from(loanData.loans.entries()).map(([key, value]) => ({
            loanType: key,
            name: value.name,
            description: value.description,
            annualRate: value.annualRate
        }))

        res.json(availableCalculators)
    } catch (error) {
        res.status(500).json({ error: "Ошибка базы данных:", details: error.message })
    }
})

/*****************************
Блок работы с депозитами 
*****************************/

// Функция расчёта калькулятора депозита
function calculateDeposit({depositAmount, annualRate, termYears, fixedTermMonths}) {
    let effectiveTermYears = termYears
    if (fixedTermMonths > 0) {
        effectiveTermYears = fixedTermMonths / 12
    }

    const totalAmount = depositAmount * Math.pow(1 + annualRate / 100, effectiveTermYears)
    const interest = totalAmount - depositAmount

    return {
        totalAmount: Math.round(totalAmount),
        interest: Math.round(interest),
        termYears: effectiveTermYears
    }
}

// Расчёт депозита
router.post("/calculate-deposit", async (req, res) => {
    const { depositType, depositAmount, termYears } = req.body

    if (!depositType || typeof depositType !== "string") {
        return res.status(400).json({error: "Тип депозита должен быть строкой"})
    }

    if (!depositAmount || typeof depositAmount !== "number" || depositAmount <= 0) {
        console.log(depositAmount)
        return res.status(400).json({error: "Сумма депозита должна быть положительным целым числом"})
    }

    if (!termYears || typeof termYears !== "number" || termYears <= 0) {
        return res.status(400).json({error: "Годы срока должны быть положительным целым числом"})
    }

    try {
        const depositData = await DepositCollection.findOne()
        if (!depositData || !depositData.deposits.has(depositType)) {
            return res.status(400).json({error: "Invalid deposit type"})
        }

        const { annualRate, name, fixedTermMonths } = depositData.deposits.get(depositType)
        if (fixedTermMonths > 0 && termYears !== fixedTermMonths / 12) {
            return res.status(400).json({error: "This deposit has a fixed term of " + fixedTermMonths + " months"})
        }

        const result = calculateDeposit({ depositAmount, annualRate, termYears, fixedTermMonths })

        const historyEntry = new DepositHistory({
            depositType,
            depositAmount,
            termYears,
            totalAmount: result.totalAmount,
            interest: result.interest
        })

        console.log(historyEntry)

        await historyEntry.save()

        res.json({depositType, name, fixedTermMonths, ...result})
    } catch (err) {
        res.status(500).json({error: "Ошибка базы данных:", details: err.message})
    }
})

// Получение списка и описания депозитов
router.get("/deposit-types", async (req, res) => {
    try {
        const depositData = await DepositCollection.findOne()
        if (!depositData) return res.json([])

        const availableDeposits = Array.from(depositData.deposits.entries()).map(([key, value]) => ({
            depositType: key,
            name: value.name,
            description: value.description,
            annualRate: value.annualRate,
            fixedTermMonths: value.fixedTermMonths
        }))

        res.json(availableDeposits)
    } catch (error) {
        res.status(500).json({error: "Ошибка базы данных:", details: error.message})
    }
})


/*********************
Общие блоки
 *********************/

// Отправка почты
router.post("/send-email", async (req, res) => {
    const {email, loanData} = req.body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Неверный формат email"})
    }
        
    if (!loanData) {
        return res.status(404).json({error: "Email и данные о кредите обязательны"})
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Результат расчёта кредита",
        html: `
            <h2>Результат расчёта кредита</h2>
            <p><strong>Тип кредита: </strong>${loanData.name}</p>
            <p><strong>Ежемесячный платёж: </strong>${loanData.monthlyPayment}</p>
            <p><strong>Общая сумма выплат: </strong>${loanData.totalPayment}</p>
        `
    }

    try {
        await transporter.sendMail(mailOptions)
        res.json({message: "Email успешно отправлен"})
    } catch (err) {
        res.status(500).json({error: "Ошибка отправки письма:", details: err.message})
    }
})

/************************************************************
Секция администратора 
************************************************************/

/***********************************
Кредиты
***********************************/

// Добавление нового калькулятора
router.post("/types", authenticate, isAdmin, async (req, res) => {
    const { loanType, name, description, annualRate } = req.body

    if (!loanType || typeof loanType !== 'string') {
        return res.status(400).json({ error: "Тип кредита должен быть строкой" })
    }

    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: "Название должно быть строкой" })
    }

    if (!description || typeof description !== 'string') {
        return res.status(400).json({ error: "Описание должно быть строкой" })
    }

    if (!annualRate || typeof annualRate !== 'number' || annualRate <= 0) {
        return res.status(400).json({ error: "Годовая ставка должна быть положительным целым числом" })
    }

    try {
        let loanData = await LoanCollection.findOne()
        if (!loanData) {
            loanData = new LoanCollection({ loans: new Map() })
        }

        if (loanData.loans.has(loanType)) {
            return res.status(400).json({ error: "Тип кредита уже существует" })
        }

        loanData.loans.set(loanType, { name, description, annualRate })
        await loanData.save()

        res.status(201).json({ message: "Тип кредита успешно добавлен" })
    } catch (error) {
        res.status(500).json({ error: "Ошибка базы данных:", details: error.message })
    }
})

// Удаление калькулятора
router.delete("/types/:loanType", authenticate, isAdmin, async (req, res) => {
    const {loanType} = req.params
    
    if (!loanType || typeof loanType !== 'string') {
        return res.status(400).json({error: "Тип кредита должен быть строкой"})
    }
    
    try {
        const loanData = await LoanCollection.findOne()
        
        if (!loanData || !loanData.loans.has(loanType)) {
            return res.status(404).json({error: "Тип кредита не найден"})
        }
        
        loanData.loans.delete(loanType)
        await loanData.save()
        
        res.json({message: "Тип кредита успешно удалён", loanType})
    } catch (error) {
        res.status(500).json({ error: "Ошибка базы данных:", details: error.message })
    }
})

// Изменение калькулятора
router.put("/types/", authenticate, isAdmin, async (req, res) => {

    const {loanType, name, description, annualRate} = req.body

    if (!loanType || typeof loanType !== 'string') {
        return res.status(400).json({ error: "Тип кредита должен быть строкой" })
    }

    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: "Название должно быть строкой" })
    }

    if (!description || typeof description !== 'string') {
        return res.status(400).json({ error: "Описание должно быть строкой" })
    }

    if (!annualRate || typeof annualRate !== 'number' || annualRate <= 0) {
        return res.status(400).json({ error: "Годовая ставка должна быть положительным целым числом" })
    }

    try {
        const loanData = await LoanCollection.findOne()
        if (!loanData || !loanData.loans.has(loanType)) {
            return res.status(404).json({error: "Тип кредита не найден"})
        }
        
        loanData.loans.set(loanType, {
            name: name || loanData.loans.get(loanType).name,
            description: description || loanData.loans.get(loanType).description,
            annualRate: annualRate || loanData.loans.get(loanType).annualRate
        })

        await loanData.save()

        res.json({message: "Тип кредита успешно изменён", loanType})
    } catch (error) {
        res.status(500).json({error: "Ошибка базы данных:", details: error.message })
    }
})

router.get("/loan-history", authenticate, isAdmin, async (req, res) => {
    try {
        const history = await LoanHistory.find().sort({createdAt: 1})

        res.json(history)
    } catch (error) {
        res.status(500).json({error: "Ошибка базы данных:", details: error.message })
    }
})

router.delete("/loan-history", authenticate, isAdmin, async (req, res) => {
    try {
        await LoanHistory.deleteMany({})

        res.json({message: "History cleared successfully"})
    } catch (error) {
        res.status(500).json({error: "Ошибка базы данных:", details: error.message })
    }
})



/***********************************
Депозиты
***********************************/

router.post("/deposit-types", authenticate, isAdmin, async (req, res) => {
    const { depositType, name, description, annualRate, fixedTermMonths } = req.body

    if (!depositType || typeof depositType !== "string") {
        return res.status(400).json({error: "Тип депозита должен быть строкой"})
    }

    if (!name || typeof name !== "string") {
        return res.status(400).json({error: "Название должно быть строкой"})
    }

    if (!description || typeof description !== "string") {
        return res.status(400).json({error: "Описание должно быть строкой"})
    }

    if (!annualRate || typeof annualRate !== "number" || annualRate <= 0) {
        return res.status(400).json({error: "Годовая ставка должна быть положительным целым числом"})
    }

    if (fixedTermMonths < 0 || fixedTermMonths === undefined || fixedTermMonths === null || typeof fixedTermMonths !== "number") {
        return res.status(400).json({error: "Месяцы фиксированного срока должны быть целым неотрицательным числом"})
    }

    try {
        let depositData = await DepositCollection.findOne()
        if (!depositData) {
            depositData = new DepositCollection({deposits: new Map()})
        }

        if (depositData.deposits.has(depositType)) {
            return res.status(400).json({error: "Тип депозита уже существует"})
        }

        depositData.deposits.set(depositType, {name, description, annualRate, fixedTermMonths})
        await depositData.save()

        res.status(201).json({message: "Тип депозита успешно добавлен"})
    } catch (error) {
        res.status(500).json({error: "Ошибка базы данных:", details: error.message})
    }
})

router.delete("/deposit-types/:depositType", authenticate, isAdmin, async (req, res) => {
    const {depositType} = req.params

    if (!depositType || typeof depositType !== "string") {
        return res.status(400).json({error: "Тип депозита должен быть строкой"})
    }

    try {
        const depositData = await DepositCollection.findOne()

        if (!depositData || !depositData.deposits.has(depositType)) {
            return res.status(400).json({error: "Тип депозита не найден"})
        }

        depositData.deposits.delete(depositType)
        await depositData.save()

        res.json({message: "Тип депозита успешно удалён", depositType})
    } catch (error) {
        res.status(500).json({error: "Ошибка базы данных:", details: error.message})
    }
})

router.put("/deposit-types/", authenticate, isAdmin, async (req, res) => {
    const { depositType, name, description, annualRate, fixedTermMonths } = req.body

    if (!depositType || typeof depositType !== "string") {
        return res.status(400).json({error: "Тип депозита должен быть строкой"})
    }

    if (!name || typeof name !== "string") {
        return res.status(400).json({error: "Название должно быть строкой"})
    }

    if (!description || typeof description !== "string") {
        return res.status(400).json({error: "Описание должно быть строкой"})
    }

    if (!annualRate || typeof annualRate !== "number" || annualRate <= 0) {
        return res.status(400).json({error: "Годовая ставка должна быть положительным целым числом"})
    }

    if (fixedTermMonths < 0 || fixedTermMonths === undefined || fixedTermMonths === null || typeof fixedTermMonths !== "number") {
        return res.status(400).json({error: "Месяцы фиксированного срока должны быть целым неотрицательным числом"})
    }

    try {
        const depositData = await DepositCollection.findOne()
        if (!depositData || !depositData.deposits.has(depositType)) {
            return res.status(404).json({error: "Тип депозита не найден"})
        }

        depositData.deposits.set(depositType, {
            name: name || depositData.deposits.get(depositType).name,
            description: description || depositData.deposits.get(depositType).description,
            annualRate: annualRate || depositData.deposits.get(depositType).annualRate,
            fixedTermMonths: fixedTermMonths || depositData.deposits.get(depositType).fixedTermMonths
        })

        await depositData.save()
        res.json({message: 'Тип депозита успешно изменён', depositType})
    } catch (error) {
        res.status(500).json({error: "Ошибка базы данных:", details: error.message})
    }
})

router.get("/deposit-history", authenticate, isAdmin, async (req, res) => {
    try {
        const history = await DepositHistory.find().sort({createdAt: 1})

        res.json(history)
    } catch (error) {
        res.status(500).json({error: "Ошибка базы данных:", details: error.message })
    }
})

router.delete("/deposit-history", authenticate, isAdmin, async (req, res) => {
    try {
        await DepositHistory.deleteMany({})

        res.json({message: "История успешно очищена"})
    } catch (error) {
        res.status(500).json({error: "Ошибка базы данных:", details: error.message })
    }
})

export default router