require('dotenv').config()
const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
})

exports.user = mongoose.model('User_fcc', userSchema)

const exerciseSchema = new mongoose.Schema({
    user_id: String,
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }  
})

exports.exercise = mongoose.model('Exercise_fcc', exerciseSchema)