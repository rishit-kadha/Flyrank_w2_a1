import express from 'express';

const app = express();
const expressPort = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(expressPort , ()=>{
    console.log(`Server running on PORT ${expressPort}`);
})