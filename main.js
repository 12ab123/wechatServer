const express = require('express')
const app = express()
const server = require('http').createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, { transports: ['websocket'] })
const path = require('path')
const contentMongod = require('./db/db')
const userRouter = require('./router/userRouter')
const token = require('./token')
const userModel = require('./model/userModel')
const userModle = require('./model/userModel')

// 所有上线的用户列表
let loginArray = []


// 暴露静态资源
app.use(express.static(path.join(__dirname,'public')))
// 将post请求时的urlencoded格式参数转换为对象并挂载到req上
// app.use(express.urlencoded({extended:true}))
// 使服务器可以解析post请求时参数为json格式,不加的话通过req.body无法获取
app.use(express.json())


app.use(function (req, res, next) {
    
    if(req.headers.ishavetoken){
        next()
    }else{
        token.varToken(req.headers.authorization).then( data => {
            let { username, password } = data
            if(req.originalUrl === '/autoLogin'){
                userModel.findOne({username}).then( data => {
                    if(data.password === password){

                        // 如果用户没有登录,将登录状态改为true,设置now_login_url
                        if(!data.is_login){
                            userModle.updateOne({username},{$set:{is_login:true,now_login_url:req.headers.origin}}).then(value => {
                                return res.send({
                                    status: 0,
                                    data
                                })       
                            }).catch(error => {
                                return res.send({
                                    status: 1,
                                    msg: '网络不好,请稍后再试'
                                })
                            })

                        }else{
                            // 如果用户登录,判断now_login_url地址是否相同
                            if(data.now_login_url === req.headers.origin){
                                return res.send({
                                    status: 0,
                                    data
                                })
                            }else{
                                return res.send({
                                    status:1,
                                    msg: '用户在其他地方以登录,请稍后再试'
                                })
                            }
                        }
                    }else{
                        return res.send({
                            status: 1,
                            msg: '密码已被修改,请重新登录'
                        })
                    }
                    
                }).catch( error => {
                    return res.send({
                        status: 1,
                        msg: '用户已注销账号'
                    })
                })
            }else{
                next()
            }
            
        }).catch( error => {
            return res.send({
                status: 1,
                msg: '身份过期,请重新登录'
            })
        })
    }
})





function contentServer (err) {
    if(err){
        return
    }else{
        // 使用路由器
        app.use(userRouter())
        
        
        io.on('connection',(socket) => {
            // 登录
            socket.on('login',(data)=>{
                io.sockets.emit('successLogin',data.username)
                loginArray.push({
                    username:data.username,
                    id: socket.id
                })
            })

            // 退出登录
            socket.on('disconnect',()=>{
                let index = loginArray.findIndex((item,index) => item.id === socket.id)
                io.sockets.emit('output',loginArray[index].username);
                if(index !== -1){
                    loginArray.splice(index)
                }
            })

            // 发送信息
            socket.on('sendMessage', (data) => {
                if(data.addressee === 'world'){
                    // 发给所有人,包含自己
                    io.sockets.emit('world',data);
                }else{
                    // 发给指定人
                    let youid = ''
                    let myid = ''
                    loginArray.forEach(item => {
                        if(item.username === data.addressee){
                            youid = item.id
                        }
                        if(item.username === data.user){
                            myid = item.id
                        }
                    })
                    // 发给自己
                    io.to(myid).emit('myMessage', data);
                    // 发给别人
                    io.to(youid).emit('yourMessage', data);
                }
                
            })
        })
        
        
        
        server.listen(3000,(err)=>{
            if(!err){
                console.log('服务器连接成功,地址为http://localhost:3000')
            }else{
                console.log('服务器连接失败')
            }
        })
    }
}




contentMongod(contentServer)