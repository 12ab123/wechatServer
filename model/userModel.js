const mongoose = require('mongoose')


const Schema = mongoose.Schema


const userRule = new Schema({
    username: {
        type: String,
        require: true,
        unique:true
    },
    password: {
        type: String,
        require: true
    },
    user_avatar: {
        type: String,
        default: 'http://localhost:3000/img/userHeader.png'
    },
    is_login: {
        type: Boolean,
        default: false
    },
    now_login_url: {
        type: String,
        default: ''
    }
})


let userModle = mongoose.model('user',userRule)

module.exports = userModle