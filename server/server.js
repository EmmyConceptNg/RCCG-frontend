import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import workorderRoutes from "./routes/WorkOrder.js";
/* CONFIGURATION */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());

/* ROUTES */
app.use('/api/workorders', workorderRoutes)
// app.get('/', function (req, res){
//   console.log(' Welcome to RCCG server >>>>>>>>>>> To the Moon >>>>>>>>')
// })

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 9090;
mongoose
  .connect(process.env.MONGO_URL, {})
  .then(() => {
    app.listen(PORT, () => {
      console.log("================================================");
      console.log(`====== Server is running on ${PORT} ============`);
      console.log("================================================");
    });
  })
  .catch((error) => console.log(`${error} did not connect`));
