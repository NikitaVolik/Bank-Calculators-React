// server/server.js

import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import loanRoutes from "./routes/loanRoutes.js"
import { authenticate, authRouter } from "./routes/auth.js"
import connectDB from "./db.js"

connectDB()

dotenv.config() // Считывание конфигурации

const app = express() // Инициализация приложения
const PORT = process.env.PORT || 5000 // Порт для работы приложения

app.use(cors())
app.use(express.json())

// Маршрут авторизации
app.use("/api/auth", authRouter)

// Пример защищённого маршрута
app.get("/api/protected", authenticate, (req, res) => {
    res.json({message: 'Доступ разрешён', user: req.user})
})

// URL API
app.use("/api/loans", loanRoutes) 

// Тест на нормальное состояние backend
app.get("/", (req, res) => {
    res.send('Backend запущен')
})

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`)
})