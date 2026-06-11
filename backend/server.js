require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pool = require("./database/db") 
const userRoute = require("./routes/userRoutes");

const app = express();

//Middle ware
app.use(cors());
app.use(express.json());

//Testing db connection
pool.connect()
.then(() => console.group("Database connected"))
.then(() => console.log("Database connected"))
.catch(err => console.log("DB error", err));

//Routes
app.use("/api/users", userRoute);

//Default route
app.get('/', (req, res) => {
  res.send("Server is running");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{
  console.log(`Server is running at port: ${PORT}`)
})