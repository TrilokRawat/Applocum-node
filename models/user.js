const mongoose = require('mongoose');
const validator = require('validator');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const usersSechema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true,
            trim: true,
            validate(value) {
                if (value.length < 0) {
                    throw new Error('Please Provide a vailid name')
                }
            }
        },
        last_name: {
            type: String,
            required: true,
            trim: true,
            validate(value) {
                if (value.length < 0) {
                    throw new Error('Please Provide a vailid name')
                }
            }
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email is invailid')
                }
            }
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 6,
            validate(value) {
                if (value.toLowerCase().includes('password')) {
                    throw new Error('Password can not contain "password"')
                }
            }
        },
        phone: {
            type: Number,
            required: true,
            trim: true,
            minlength: 10,
            validate(value) {
                
            }
        },
        tokens: [
           {
            token : {
            type: String,
            required: true
            }
            }
        ],
        avatar: {
            type: Buffer
        },
        avatar_name: {
            type: String
        },
        device_type: {
            type: String,
            required: true,
            trim: true
        },
        player_id: {
            type: String,
            required: true,
            trim: true
        },
        address_line1 : {
            type: String
        },
        address_line2 : {
            type: String
        },
        address_line3 : {
            type: String
        },
        town : {
            type: String
        },
        pincode : {
            type: Number,
            minlength:6,
            trim: true
        },
        documnet: [
            {
             file : {
             type: Buffer,
             }
            }
        ],
        date_of_birth : {
          type:String
        },
         
            
    },{
        timestamps: true
    }
)


//  instans methode.
usersSechema.methods.generateAuthToken = async function ( ) {
const user = this;
const jwtdata = await jwt.sign({_id: user._id.toString()}, "thisismy secretKey" )
console.log(jwtdata);
user.tokens = user.tokens.concat({token: jwtdata});
let userdata = await user.save();
return jwtdata
}

usersSechema.methods.toJSON =  function ( ) {
    const user = this;
    const userObj =  user.toObject();
    delete userObj.password;
    delete userObj.tokens;
    return userObj
    }

//   static methode are accesiable the model
usersSechema.statics.findByCrentials = async (email, password) => {
    const user = await User.findOne({email});
 
    if(!user) {
        throw new Error('Email is not found, please register first to login')
    }
    const isMatch = await bycrypt.compare(password, user.password)
    if(!isMatch) 
    {
        throw new Error('password is not matched')
    }
    return user;
}

// covert # password before saving
usersSechema.pre('save', async function (next) {
    const user =  this
    if(user.isModified('password')) {
        user.password = await bycrypt.hash(user.password, 8)
    }
    next();
});


const User = mongoose.model('User', usersSechema);



module.exports = User