import express, { Application } from "express"
import { PORT } from "./lib/config";
import cors from "cors";
import IndexRouter from "./routes/index"
const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors({
    origin: '*',
}))
app.use("/api/v1", IndexRouter);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...😎😎😎😎`);
})