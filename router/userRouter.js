const userModel = require('../model/userModel')
const multer = require('multer')
const path = require('path')
const token = require('../token/index')

let storage = multer.diskStorage({          //将文件存储到硬盘中
    destination: function (req, file, cb) {
        cb(null, './public/img')                //文件存储的地址
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.parse(file.originalname).ext)         //文件的名字
    }
})
const upload = multer({ storage: storage })         //实例一个中间件,专门处理formdata参数
const uploadSingle = upload.single('img')

const { Router } = require('express')
const userModle = require('../model/userModel')

let router = new Router()



router.post('/login', ( req, res ) => {
    let {username,password} = req.body
    userModle.findOne({username}).then(data => {
        if(data){
            if(data.password === password){
                // 判断当前用户是否登录
                if(!data.is_login){
                    // 将登录状态改为true,
                    userModle.updateOne({username},{$set:{is_login:true,now_login_url:req.headers.origin}}).then( value => {
                        // 获取token
                        token.setToken({username,password}).then(token => {
                            return res.send({
                                status: 0,
                                data: {...data._doc,token},
                            })
                        })
                    }).catch( error => {
                        return res.send({
                            status: 1,
                            msg: '请稍后再试'
                        })
                    })

                }else{
                    return res.send({
                        status: 1,
                        msg: '当前账号在其他地方登录,请稍后再试'
                    })
                }   
            }else{
                return res.send({
                    status: 1,
                    msg: '密码错误'
                })
            }
        }else{
            return res.send({
                status: 1,
                msg: '用户不存在'
            })
        }
    }).catch(err => {
        return res.send({
            status: 1,
            msg: '网络出现错误,请稍后再试'
        })
    })
})

router.post('/register', ( req, res ) => {
    uploadSingle(req,res, (err)=>{
        if(err){
            return res.send({
                status: 1,
                msg: '文件上传失败,请稍后再试'
            })
        }else{
            let { username, password} = req.body
            // console.log(req.body)
            // console.log(req.file)
            let user_avatar = 'http://localhost:3000/img/userHeader.png'
            
            req.file && (user_avatar = `http://localhost:3000/img/${req.file.filename}`)
            

            userModel.findOne({username}).then(data => {
                if(data === null){

                    userModle.create({
                        username,
                        password,
                        user_avatar
                    }).then(data => {
                        return res.send({
                            status: 0,
                            data: '注册成功'
                        })
                    }).catch(err => {
                        return res.send({
                            status: 1,
                            msg: '注册失败,请稍后再试'
                        })
                    })

                }else{
                    return res.send({
                        status: 1,
                        msg: '用户已存在'
                    })
                }
            }).catch(err => {
                return res.send({
                    status: 1,
                    msg: '注册失败,请稍后再试'
                })
            })
        }
    })
})

router.post('/allUser', ( req, res ) => {
    userModle.find({}).then(data => {
        res.send({
            status:0,
            data
        })
    })
})


router.post('/output', ( req, res ) => {
    userModle.updateOne({username:req.body.username},{$set:{is_login:false,now_login_url:''}}).then(data => {
        return res.send({
            status: 0,
        })
    }).catch(error => {
        return res.send({
            status: 1,
            msg: '网络出错,请稍后再试'
        })
    })
})





module.exports = function () {
    return router
}