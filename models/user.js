const mongoose = require("mongoose");


const attemptSchema = mongoose.Schema({
    paperId: {
        type: String,
        required: true
    },
    startTime: {
        type: Number,
        required: true
    },
    finishTime: {
        type: Number,
        default: 0
    },
    markedAns: {
        type: Map,
        of: Array,
        default: {}
    },
    status:{

    }
})

const userSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        trim: true,
    },
    email: {
        required: true,
        type: String,
        trim: true,
        validate: {
            validator: (value) => {
                const re = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
                return value.match(re)
            },
            message: 'Please enter valid email'
        },
    },
    password: {
        required: true,
        type: String,
        validate: {
            validator: (value) => {
                return value.length > 6;
            },
            message: 'password must be more than 6 characters long'
        },
    },
    address: {
        type: Array,
        default: [],
    },
    phone: {
        type: String,
        default: "",
        trim: true,
    },
    image: {
        type: String,
        default: "",
    },
    verified: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Map,
        of:Array,    // {"pid":[attemtschema]}
        default: {}
    },
    lastlogin: {
        type: Number,
        default: 0
    },
    lastpasschanged: {
        type: Number,
        default: 0
    }
});


const User = mongoose.model("student", userSchema);
module.exports = User;

//  const UserTC = composeWithMongoose(User);

//  schemaComposer.Query.addFields({
//     userById: UserTC.mongooseResolvers.findById(),
//     userByIds: UserTC.mongooseResolvers.findByIds(),
//     userOne: UserTC.mongooseResolvers.findOne(),
//     userMany: UserTC.mongooseResolvers.findMany(),
//     userDataLoader: UserTC.mongooseResolvers.dataLoader(),
//     userDataLoaderMany: UserTC.mongooseResolvers.dataLoaderMany(),
//     userByIdLean: UserTC.mongooseResolvers.findById({ lean: true }),
//     userByIdsLean: UserTC.mongooseResolvers.findByIds({ lean: true }),
//     userOneLean: UserTC.mongooseResolvers.findOne({ lean: true }),
//     userManyLean: UserTC.mongooseResolvers.findMany({ lean: true }),
//     userDataLoaderLean: UserTC.mongooseResolvers.dataLoader({ lean: true }),
//     userDataLoaderManyLean: UserTC.mongooseResolvers.dataLoaderMany({ lean: true }),
//     userCount: UserTC.mongooseResolvers.count(),
//     userConnection: UserTC.mongooseResolvers.connection(),
//     userPagination: UserTC.mongooseResolvers.pagination(),
//   });
//   const schema = schemaComposer.buildSchema();
// module.exports=  schema;


