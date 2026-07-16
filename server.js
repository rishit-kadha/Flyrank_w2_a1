import express from 'express';
const app = express();
const expressPort = 3000;

app.get('/', (req, res) => {
  res.json({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] })
});

app.get('/health', (req,res)=>{
    res.json({"status": "ok"})
})
app.listen(expressPort , ()=>{
    console.log(`Server running on PORT ${expressPort}`);
})