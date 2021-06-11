const mongoose = require('mongoose')

mongoose.set('useCreateIndex', true)

const DB_NAME = 'wecat'
const PORT = 27017
const IP = 'localhost'


module.exports = function contentMongod (callback) {
    // 连接数据库
    mongoose.connect(
        `mongodb://${IP}:${PORT}/${DB_NAME}`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

    // mongoose.connection.on('open', function (err) {
    //     if(err){
    //         console.log('数据库连接失败')
    //         callback(12)
    //     }else{
    //         console.log('数据库连接成功')
    //         callback()
    //     }
    // })

    mongoose.connection.on('error', function () {
        console.log('数据库连接失败')
        callback(12)
    });
    mongoose.connection.once('open', function() {
        console.log('数据库连接成功')
        callback()
    });
    

}