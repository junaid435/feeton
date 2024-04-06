const dotenv=require('dotenv').config();
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
const express = require('express')
const app = express()
const nocache=require('nocache')
app.set("view engine", "ejs");

const job=require('./job')

app.use( express.json())
app.use( express.urlencoded({ extended : true}))

app.use(nocache())

const user_route = require('./routes/user_route')
const admin_route = require('./routes/admin_routes')
// app.use(morgan('dev'))
app.use('/' , user_route)
app.use('/admin' , admin_route)

app.use(express.static('public'))

app.use((req, res) => {
    res.status(404).render("error404");
  });
app.listen(process.env.PORT, () => {
    console.log('connected');
})