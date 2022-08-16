const jwt = require('jsonwebtoken')
require('dotenv').config()

const express = require('express')
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const user = {
    id: 42,
    name: 'Jean bon',
    email: "jeanbon@gmail.com",
    admin: true
}

function generateAcessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1800s'});
}

function generateRefreshToken(user){
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1y'});
}

//const accessToken = generateAcessToken(user);
//console.log(accessToken)

app.post('/api/login', (req, res) => {

    //TODO: checker l'utilisateur ans la base de donné
    if(req.body.email !== user.email){
        res.status(401).send('invalid credentials')
        //return
    }
    if(req.body.password !== "gilles"){
        res.status(401).send('invalid credentials')
        //return
    }

    const accessToken = generateAcessToken(user)
    const refreshToken = generateRefreshToken(user)
    res.send({
        token: accessToken,
        refresh: refreshToken
    })
})

app.post("/api/refreshToken", (req, res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(!token){
        console.log("Tokenisation ...")
        return res.sendStatus(401)
    }

    // TODO : check en DB que le user a toujours les droits et qu'il existe toujours
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        console.log("Verfication ...")
        if(err){
            return res.sendStatus(401)
        }
        delete user.iat
        delete user.exp
        const refreshToken = generateRefreshToken(user)
        res.send({
            refresh: refreshToken
        })
    })
})

function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(!token){
        console.log("Tokenisation ...")
        return res.sendStatus(401)
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, us) => {
        console.log("Verfication ...")
        if(err){
            return res.sendStatus(401)
        }
        req.user = us;
        next();
    })
}

app.get('/api/me', authenticateToken, (req, res) => {
    res.send(req.user)
})

app.listen(3000, () => {
    console.log('server run port 3000')
})