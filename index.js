require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const user = require('./model').user
const exercise = require('./model').exercise


mongoose.connect(process.env.MONGO_URI, 
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connection successful');
  })
  .catch((err) => {
    console.error('Database connection error');
  });

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

function createAndSaveUser (req, res) {
  
  const newUser = new user({username:req.body.username})
  newUser
  .save()
  .then((output) => {
    res.json({username: output['username'], _id:output['_id']})
  })
  .catch((err) => {
    console.error(err);
    res.type("txt").send(err);
  });
  
};

function getUsers (req, res){
  user.find({})
  .then((users) => {
    res.json(users)
  })
  .catch((err) => {
    console.error(err)
    res.type("txt").send(err);
  })
}

function saveExercise (req, res){
  const user_id = req.params._id
  const description = req.body.description
  const duration = req.body.duration
  const dateTemp = req.body.date ? ( Number(req.body.date) ? new Date(Number(req.body.date)) : new Date(req.body.date) ): new Date()
  if (isNaN(dateTemp)) {
    res.json({"error": "Invalid Date"})
    return console.log(dateTemp)
  }
  const date = dateTemp.toDateString()
  const newExercise = new exercise({user_id, description, duration, date})
  
  newExercise.save()
  .then((exerciseOutput) => {
    user.findById(user_id)
    .then((userOutput) => {
      res.json({
        _id: userOutput._id,
        username: userOutput.username,
        date: exerciseOutput.date,
        description: exerciseOutput.description,
        duration: Number(exerciseOutput.duration)
      })
    })
    .catch((err) => {
      res.type("txt").send(err);
      return console.error(err)
    })
  })
  .catch((err) => {
    res.type("txt").send(err);
    return console.error(err)
  });
}

function getLogs(req, res) {
  const id = req.params._id
  const from = req.query.from ? ( Number(req.query.from) ? new Date(Number(req.query.from )) : new Date(req.query.from ) ): ''
  const to = req.query.to ? ( Number(req.query.to) ? new Date(Number(req.query.to )) : new Date(req.query.to ) ): ''
  const limit = req.query.limit ? (isNaN(Number(req.query.limit))? 0: Number(req.query.limit)) : 0

  user.findById(id)
  .then((userOutput)=>{
    if(from && to) {
      exercise.find({user_id: id, date : { $gte: from, $lte: to }})
      .limit(limit)
      .exec()
      .then((exerciseOutput)=>{
        res.json({
          _id: userOutput._id,
          username: userOutput.username,
          count: exerciseOutput.length,
          log: exerciseOutput.map((x) => new Date(x.date).toDateString())
        })
      })
      .catch(()=>{
        res.json({'error': 'no logs'})
        return console.log({'error': 'no logs'})
      })
    }
    else if(from) {
      exercise.find({user_id: id, date : { $gte: from}})
      .limit(limit)
      .exec()
      .then((exerciseOutput)=>{
        res.json({
          _id: userOutput._id,
          username: userOutput.username,
          count: exerciseOutput.length,
          log: exerciseOutput
        })
      })
      .catch(()=>{
        res.json({'error': 'no logs'})
        return console.log({'error': 'no logs'})
      })
    }
    else if(to) {
      exercise.find({user_id: id, date : {$lte: to }})
      .limit(limit)
      .exec()
      .then((exerciseOutput)=>{
        res.json({
          _id: userOutput._id,
          username: userOutput.username,
          count: exerciseOutput.length,
          log: exerciseOutput
        })
      })
      .catch(()=>{
        res.json({'error': 'no logs'})
        return console.log({'error': 'no logs'})
      })
    }
    else {
      exercise.find({user_id: id})
      .limit(limit)
      .exec()
      .then((exerciseOutput)=>{
        res.json({
          _id: userOutput._id,
          username: userOutput.username,
          count: exerciseOutput.length,
          log: exerciseOutput
        })
      })
      .catch(()=>{
        res.json({'error': 'no logs'})
        return console.log({'error': 'no logs'})
      })
    }
    
  })
  .catch(()=>{
    res.json({'error': 'uesr not found'})
    return console.log({'error': 'uesr not found'})
  })
}

app.post('/api/users', createAndSaveUser)

app.get('/api/users', getUsers)

app.post('/api/users/:_id/exercises', saveExercise)

app.get('/api/users/:_id/logs', getLogs)


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
