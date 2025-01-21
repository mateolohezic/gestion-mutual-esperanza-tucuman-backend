const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');

require("dotenv").config();

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const socioRouter = require("./routes/socioRoutes");

const app = express();

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.URI_MONGO)
  .catch((error) => console.log(error))
  .then(() => console.log("Conectado a MongoDB Atlas"));
    
const allowedOrigins = [
  'https://mutualesperanza.com.ar', 
  'http://localhost:3000'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
// app.use("/api/user", userRouter);
app.use("/api/socio", socioRouter);

app.listen(PORT, () => {
  console.log(`API Rest escuchando el puerto ${PORT}`);
});
