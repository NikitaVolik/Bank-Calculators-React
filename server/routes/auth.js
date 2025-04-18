// server/routes/auth.js

import bcrypt from "bcrypt"
import express from "express"
import fs from "fs"
import jwt from "jsonwebtoken"
import path from "path"
import { createInterface } from "readline"

const router = express.Router()
const usersFilePath = path.resolve("./data/users.json")
const SECRET_KEY = "nkoxdz_DU5svYbWlvymHKBueMo7kF842zWIXkr0fs_oOrq6Pm6"
const SALT_ROUNDS = 10

const loginAttempts = {}
const MAX_ATTEMPTS = 5
const BLOCK_TIME = 300 // в секундах 5 минут

function recordFiledAttempt(login) {
    if (!loginAttempts[login]) {
        loginAttempts[login] = {count: 1}
    } else {
        loginAttempts[login].count += 1
    }

    if (loginAttempts[login].count >= MAX_ATTEMPTS) {
        loginAttempts[login].blockedUntil = Date.now() + BLOCK_TIME * 1000
        console.warn(`Логин ${login} заблокирован на ${BLOCK_TIME / 60} минут`)
    }
}

// Ввод пароля с клавиатуры
async function promptInput(question, hideInput = false) {
    return new Promise((resolve) => {
        const readline = createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true
        })

        if (hideInput) {
            process.stdin.on("data", (char) => {
                char = char.toString()
                if (char === "\n" || char === "\r" || char === "\t") {
                    process.stdin.pause()
                } else {
                    process.stdout.clearLine()
                    process.stdout.cursorTo(0)
                    process.stdout.write(question + "*".repeat(readline.line.length))
                }
            })
        }

        readline.question(question, (input) => {
            readline.close()
            resolve(input.trim())
        })
    })
}

// Инициализация users.json при первом запуске
async function initializeUsersFile() {
    if (!fs.existsSync(usersFilePath)) {
        console.log('Файл users.json не найден. Требуется настройка администратора.')

        const login = await promptInput('Введите логин администратора: ')
        const email = await promptInput('Введите email администратора: ')
        const password = await promptInput('Введите пароль администратора: ', true)
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        const defaultUsers = [
            { login, password: hashedPassword, email, role: "admin"}
        ]

        saveUsers(defaultUsers)
        console.log('Файл users.json успешно создан')
    }
}

// Чтение пользователей
function loadUsers() {
    if (!fs.existsSync(usersFilePath)) return []
    return JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'))
}

// Функция сохранения пользователей
function saveUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8')
}

// API для входа
router.post("/login", async (req, res) => {
    const { login, password } = req.body;
    const users = loadUsers();
    const user = users.find((u) => u.login === login);

    const attempt = loginAttempts[login]
    const now = Date.now()

    if (attempt && attempt.blockedUntil && now < attempt.blockedUntil) {
        const waitSec = Math.ceil((attempt.blockedUntil - now) / 1000)
        return res.status(429).json({error: `Слишком много попыток. Попробуйте через ${waitSec} секунд`})
    }

    if (!user) {
        recordFiledAttempt(login)
        return res.status(401).json({ error: "Неверный логин или пароль" })
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        recordFiledAttempt(login)
        return res.status(401).json({ error: "Неверный логин или пароль" })
    }

    if (loginAttempts[login]) {
        delete loginAttempts[login]
    }

    const token = jwt.sign({ login: user.login, role: user.role }, SECRET_KEY, { expiresIn: "2h" })
    res.json({ token, role: user.role });
})

// Проверка токена
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Нет доступа' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, SECRET_KEY)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(401).json({ error: 'Неверный токен' })
    }
}

// Проверка на наличие админских прав
function isAdmin(req, res, next){
    if (req.user.role !== 'admin') return res.status(403).json({error: 'Недостаточно прав'})

    next()
}

await initializeUsersFile()

export { authenticate, router as authRouter, isAdmin }