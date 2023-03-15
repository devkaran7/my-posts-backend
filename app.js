const express = require("express");
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const { errorHandler } = require("./middlewares/error");
require("dotenv").config();

const app = express();

app.use(cors());

//regular middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

//cookies and file middleware
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

//import all routes here
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const commentRoutes = require("./routes/comment");

//router middleware
app.use("/api/v1/", userRoutes);
app.use("/api/v1/", postRoutes);
app.use("/api/v1/", commentRoutes);
//error handling route
app.use("*", errorHandler);

module.exports = app;
