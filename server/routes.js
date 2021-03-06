const express = require("express");
const taskModel = require("./models/Task");
const userModel = require("./models/User");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.get("/myTasks/:id", async (req, res) => { //gets all tasks for Calendar
    const tasks = await taskModel
        .find({creator: req.params.id, complete: false})
        .sort({ predictedEndDate: 'asc', priority: 'desc' });//user.tasks undefined

    try {
        res.send(tasks);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.put("/completed/:id", async (req, res) => {
    const task = await taskModel.findById(req.params.id)

    if(!task) return res.status(404).send("Task not found")

    const newTask = new taskModel({
        taskName: req.body.taskName,
        startDate: req.body.startDate,
        complete: req.body.complete,
        difficulty: req.body.difficulty,
        predictedEndDate: req.body.deadline,
        priority: req.body.priority,
        predictedTimeHours: req.body.PredictedTimeHours,
        predictedTimeMinutes: req.body.PredictedTimeMinutes,
        actualTimeHours: req.body.actualTimeHours,
        actualTimeMinutes: req.body.actualTimeMinutes,
        startTime: req.body.startTime,
    });

    try{
        const updatedTask = await taskModel.findByIdAndUpdate(req.params.id, newTask, { new: true});
        res.send(updatedTask);
    }catch (error) {
        res.status(500).send(error.message);
    }
});

app.post("/deleteTask/:id", async (req, res) => {
    console.log("deleting task");
    const task_id = req.params.id;
    taskModel.deleteOne({_id: task_id}, function(err) {
        if (err) res.status(500).send(err);
    });
});

app.post("/updateTask/:id", async (req, res) => {
    const task_id = req.params.id;
    let taskPriority = 0;
    if (req.body.priority == "Low priority" || req.body.priority == "1") {
        taskPriority = 1;
    } else if (req.body.priority == "Medium priority" || req.body.priority == "2") {
        taskPriority = 2;
    } else {
        taskPriority = 3;
    }
    taskModel.updateOne(
        {_id: task_id},
        {taskName: req.body.taskName, predictedEndDate: req.body.deadline,
            priority: taskPriority, predictedTimeHours: req.body.PredictedTimeHours,
            predictedTimeMinutes: req.body.PredictedTimeMinutes, startDate: req.body.startDate,
            startTime: req.body.startTime, difficulty: req.body.difficulty},
        function(err) {
        if (err) res.status(500).send(err.message);
    });
});

app.post("/myTasks/:id", async (req, res) => { //gets all tasks for Calendar
    let taskPriority = 0;
    if (req.body.priority == "Low priority") {
        taskPriority = 1;
    } else if (req.body.priority == "Medium priority") {
        taskPriority = 2;
    } else {
        taskPriority = 3;
    }

    userModel.findOne({email: req.params.id}, async (err, user) => {
        if (err) {
            return done(err, null);
        }

        const newTask = new taskModel({
            _id: new mongoose.Types.ObjectId,
            taskName: req.body.taskName,
            predictedEndDate: req.body.deadline,
            priority: taskPriority,
            predictedTimeHours: req.body.PredictedTimeHours,
            predictedTimeMinutes: req.body.PredictedTimeMinutes,
            actualTimeHours: req.body.actualTimeHours,
            actualTimeMinutes: req.body.actualTimeMinutes,
            startTime: req.body.start,
            endTime: req.body.end,
            startDate: req.body.startDate,
            complete: false,
            difficulty: req.body.difficulty,
            creator: req.params.id,
        });


        taskModel.create(newTask, (err, task) => {
            if (err) {
                res.redirect('/');
                throw new Error(err);
            }

            user.tasks.push(newTask);
            user.save((err) => {
                return res.send(user.tasks);
            });
        });
    });
});


function getTimesForProductivityScore(tasks){
    let finalData = []
    let result = []

    for(var i = 0; i < tasks.length; i++) {
        let obj = tasks[i];
        finalData.push({
            id:obj.id,
            taskName: obj.taskName,
            deadline: new Date(obj.predictedEndDate),
            predTime: parseInt(obj.predictedTimeMinutes)/60 + parseInt(obj.predictedTimeHours),
            actualTime:parseInt(obj.actualTimeMinutes)/60 + parseInt(obj.actualTimeHours)})
       
    }
    
    totalPredTime = 0
    totalActualTime = 0

    for(var i = 0; i < finalData.length; i++) {
        totalPredTime += finalData[i].predTime
        totalActualTime += finalData[i].actualTime
    }
    result.push(totalPredTime, totalActualTime)
    return result

}

function calculateProductivityScore(predTime, actualTime) {
   var prodScore = (actualTime/predTime).toPrecision(2)
   return productivityScoreBucket(prodScore)
        
}

function productivityScoreBucket(prodScore){
    result = []
    switch (true) {
        case (Number.isNaN(prodScore) === true):
            result.push('--')
            result.push("You do not have a productivity score! As you add tasks and complete them, your productivity score will be available to you!")
            break;
        case (prodScore < .75):
            result.push(prodScore)
            result.push("Wow! You're hyper-productive. Feel free to do more things, or just enjoy your day!")
            break;     
        case (prodScore <= 1):
            result.push(prodScore)
            result.push("Yay! You're pretty spot on with your time estimates. Keep it up!");
            break;
        case (prodScore < 1.5):
            result.push(prodScore)
            result.push("Hmm, do you want to add some buffer time in your day, and plan spend more time on your tasks?");
            break;
        case (prodScore >= 1.5):
            result.push(prodScore)
            result.push("Oof. You might need a day off! Are you taking a day off at least once a week? Also, do you want to add some buffer time in your day, and plan spend more time on your tasks?");
    }

    return result
}


app.post('/goalTracker', async (req,res) => {
    id = req.body.credentials
    const today = new Date(new Date().getTime() - new Date().getTimezoneOffset()*60*1000).toISOString().substr(0,10); 
    const tasks = await taskModel.find({"creator":id, "predictedEndDate": today});
    var value = getTimesForProductivityScore(tasks)
    score = calculateProductivityScore(value[0], value[1])
    if (score.length === 0){
        score.push("--", "You do not have a productivity score yet. As you add tasks and check them off as complete, your productivity score will increase!")
    }
    try {
        res.send(score);
    } 
    catch (error) {
        res.status(500).send(error);
    }
})



app.post('/goalTrackerWeek', async (req,res) => {
    id = req.body.credentials
    const checkDates = []
    const result = []
  
    const myCurrentDate = new Date();
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var day = days[myCurrentDate.getDay()];
    
    const date = new Date(new Date().getTime() - new Date().getTimezoneOffset()*60*1000).toISOString().substr(0,10); 

    var myPastDate1 = new Date(myCurrentDate);
    myPastDate1.setDate(myPastDate1.getDate() - 6)  
    const date1 =  myPastDate1.getFullYear() + '-' +  (myPastDate1.getMonth()+1) + '-' + myPastDate1.getDate();
    
    var myPastDate2 = new Date(myCurrentDate);
    myPastDate2.setDate(myPastDate2.getDate() - 5)
    const date2 = myPastDate2.getFullYear() + '-' +  (myPastDate2.getMonth()+1) + '-' + myPastDate2.getDate();
    
    var myPastDate3 = new Date(myCurrentDate);
    myPastDate3.setDate(myPastDate3.getDate() - 4)
    const date3 = myPastDate3.getFullYear() + '-' +  (myPastDate3.getMonth()+1) + '-' + myPastDate3.getDate();

    var myPastDate4 = new Date(myCurrentDate);
    myPastDate4.setDate(myPastDate4.getDate() - 3)
    const date4 = myPastDate4.getFullYear() + '-' +  (myPastDate4.getMonth()+1) + '-' + myPastDate4.getDate();

    var myPastDate5 = new Date(myCurrentDate);
    myPastDate5.setDate(myPastDate5.getDate() - 2)
    const date5 = myPastDate5.getFullYear() + '-' +  (myPastDate5.getMonth()+1) + '-' + myPastDate5.getDate();

    var myPastDate6 = new Date(myCurrentDate);
    myPastDate6.setDate(myPastDate6.getDate() - 1)
    const date6 = myPastDate6.getFullYear() + '-' +  (myPastDate6.getMonth()+1) + '-' + myPastDate6.getDate();
    
    

    if (day === "Sunday"){
        checkDates.push(date1, date2, date3, date4, date5, date6, date)
        totalProductivityScore = 0
        var totalPredictedTime = 0
        var totalActualTime = 0
        for (var i = 0; i < checkDates.length; i++){
            const tasks = await taskModel.find({"creator":id, "predictedEndDate": checkDates[i]})
            let value = getTimesForProductivityScore(tasks)
            score = calculateProductivityScore(value[0], value[1])
            result.push(score[0])
            totalPredictedTime += value[0]
            totalActualTime += value[1]
        }
        result.push(calculateProductivityScore(totalPredictedTime, totalActualTime))
    }
    else{
        result.push(["You do not have a productivity score yet. Please check back at the end of the week!"])
    }
    try {
        res.send(result);
    } 
    catch (error) {
        res.status(500).send(error);
    }
})

module.exports = app;