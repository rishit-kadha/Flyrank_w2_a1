import express from 'express';
const app = express();
const expressPort = 3000;

let tasks = [
    { 
    id : 1,
    title : "Wake up at 6am",
    done : true,
    },
    {
    id : 2,
    title : "Brush my Teeth",
    done : true,    
    },
    {
    id : 3,
    title : "Code for 2 hours",
    done : false    
    },

]

app.get('/', (req, res) => {
  res.json({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] });
});

app.get('/tasks', (req,res) =>{
    let jsonTasks = JSON.stringify(tasks);
    res.json(jsonTasks);
})

app.get('/tasks/:id',(req,res)=>{
    let status = 404
    let json = JSON.stringify({"error": `Task ${req.params.id} not found`})

    for (let i = 0 ; i < tasks.length ; i++){
        if (tasks[i].id === Number(req.params.id)){
            status = 200
            json = JSON.stringify(tasks[i])
            break
        }    
    }
    res.status(status)
    res.json(json)
})

app.get('/health', (req,res)=>{
    res.json({"status": "ok"});
})

app.listen(expressPort , ()=>{
    console.log(`Server running on PORT ${expressPort}`);
})