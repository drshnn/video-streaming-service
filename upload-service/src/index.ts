import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors({ origin: 'localhost:5173' }));


app.get('/', (req, res) => {
    res.send({ message: 'Hello' });
});


app.listen(3000, () => {
    console.log("listening on port 3000");
})
