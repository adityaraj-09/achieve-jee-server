const express=require("express");
const mongoose=require("mongoose")
const cors =require("cors")
const PORT =8000
Admin = mongoose.mongo.Admin

const app=express();
const DB="mongodb+srv://assignment:edviron@cluster0.ebxruu8.mongodb.net";
app.use(cors())
app.use(express.json())


mongoose.connect(DB).then(async()=>{
    
}).catch((e) => {
    console.log(e);
});
app.get("/",async (req,res)=>{
    const db = mongoose.connection;
    try {
        const collection = await mongoose.connection.db.collection("dues")
        const datetimeString = "2023-04-16T18:30:00.000Z";
    
    
    milliseconds = new Date(datetimeString).getTime();
    const currentTimeMillis = Date.now();
    console.log(currentTimeMillis);
    
    const currentDate = new Date();
    
    // Find objects in the DueModel where duedate is less than the current date
     const students=await mongoose.connection.db.collection("students")
    // const dueObjects = await collection.find({ due_date: { $gt: currentDate } }).toArray();
    // const defaulters=[]
    //     for (let index = 0; index < 10; index++) {
    //         const element = dueObjects[index];
    //         const s=await students.findOne({_id:element["student"]})
    //         defaulters.push(s)
    //     }
    // Access the collection in the target database
const duesCollection = mongoose.connection.db.collection('dues');
const studentsCollection = mongoose.connection.db.collection('students');

const pipeline = [
    {
      $match: {
        due_date: { $lt: currentDate }
      }
    },
    {
      $lookup: {
        from: 'students', // Replace with the actual name of the students collection
        localField: 'student',
        foreignField: '_id',
        as: 'studentInfo'
      }
    },
    {
      $unwind: '$studentInfo'
    },
    {
      $project: {
        _id: 0,
        // Include only the studentInfo field in the result
      },
    },
      {
        $replaceRoot: { newRoot: '$studentInfo' } // Promote studentInfo to the top level
      }
    
  ]
const defaulters = await duesCollection.aggregate(pipeline).toArray();



       res.status(200).json(defaulters)
       
      }catch(e){
    
      }
})
const db = mongoose.connection;

db.once('open', async () => {
  
});





app.listen(PORT,"0.0.0.0",() =>{
    console.log(`connected at port ${PORT}`);
});



