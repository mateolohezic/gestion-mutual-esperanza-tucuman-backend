const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.URI_MONGO)
  .catch((error) => console.log(error))
  .then(() => console.log("Conectado a MongoDB Atlas"));
    
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.listen(PORT, () => {
  console.log(`API Rest escuchando el puerto ${PORT}`);
});
