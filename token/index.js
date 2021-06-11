
const jwt = require('jsonwebtoken')
const signKey = 'lai_jian_dong'

module.exports = {
    setToken (userInfo) {
        return new Promise((resolve,reject) => {
            let token = jwt.sign({...userInfo},signKey,{expiresIn:60*60*24})
            resolve(token)
        })
    },

    varToken (token) {
        return new Promise((resolve,reject) => {
            jwt.verify( token, signKey, (error,decoded) => {
                if(error){
                    reject(error)
                }else{
                    resolve(decoded)
                }
            } )
        })
    }
}