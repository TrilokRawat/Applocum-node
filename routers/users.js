const express = require('express');
const mongodb = require('mongodb');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth')
const multer = require('multer');
const DeviceDetector = require('node-device-detector');
const detector = new DeviceDetector;


router.post('/sign_up', (req, res) => {
    const useragent = req.header('user-agent');
    const result = detector.detect(useragent);
    req.body['device_type'] = result.client.type
    req.body['player_id'] = result.client.short_name
    console.log(req.body, typeof req.body);
    const user = new User(req.body)
    User.find({email: req.body.email}, async  (err, result)=> {
        if(result.length == 0) {
            try {
               await user.save()
               const token = await user.generateAuthToken()
               res.send({error: false, user, token})
            }catch(e) {
                console.log(e)
                res.status(400).send(e);
            }
        }else 
        {
            res.status(400).send({error: 'Email aleardy exits.'});
        }
    });
} );

router.post('/sign_in', async (req, res) => {
    const useragent = req.header('user-agent');
    const result = detector.detect(useragent);
    req.body['device_type'] = result.client.type
    req.body['player_id'] = result.client.short_name;

    try {
        const user = await User.findByCrentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({error: false, user, token})
    } catch (error) {
        console.log(error)
        res.status(400).send({error: 'invailid emailId or password'})
    }
})

router.delete('/sign_out', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(f => f. token != req.token);
         await req.user.save()
        res.send({error: false, massege: 'logout succesfully'})
    } catch (error) {
        res.status(400).send({error: 'Something went wrong'})
    }
})

module.exports = router;