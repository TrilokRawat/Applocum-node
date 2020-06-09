const jwt = require('jsonwebtoken');
const usermodel = require('../models/user')

const auth = async (req, res , next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        console.log('token' ,token);
        const decode =  jwt.verify(token, "thisismy secretKey");
        const user = await usermodel.findOne({_id : decode._id, 'tokens.token': token})
        if(!user) {
            throw new Error('token expires');
        }
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send({massege :"Authorization failed"})
    }
}

module.exports = auth;