const graphql = require('graphql');
const User = require('../models/user');
const Paper = require('../models/paper');
const {
    GraphQLObjectType, GraphQLString,
    GraphQLID, GraphQLInt,GraphQLSchema,
    GraphQLList,GraphQLNonNull,GraphQLBoolean
 } = graphql;
 
 

 const userType=new GraphQLObjectType({
    name:"user",
    fields:()=>({
        _id:{type:GraphQLID},
    email:{type:GraphQLString},
    name:{type:GraphQLString},
    password:{
        type:GraphQLString
    },
    phone:{
        type:GraphQLString
    },image:{
        type:GraphQLString
    },verified:{
        type:GraphQLBoolean
    },
    
    lastlogin:{
        type:GraphQLInt
    },
    lastpasschanged:{
        type:GraphQLInt
    }

 })


})
const papertype=new GraphQLObjectType({
    name:"paper",
    fields:()=>({
        _id:{type:GraphQLID},
        category:{type:GraphQLInt},
        qs:{
            type:new GraphQLList(GraphQLID)
        }
    })

})





// module.exports = new GraphQLSchema({
//     query: rootQuery
//  });
