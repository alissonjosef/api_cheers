const express = require('express')
const app = express()
const db = require('./config/db')
const consign = require('consign')

const PORT = process.env.PORT || 3000;

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

consign()
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./api')
    .then('./config/routes.js')
    .into(app)

app.db = db

app.listen(PORT, () => {
    console.log('Backend executando...')
})