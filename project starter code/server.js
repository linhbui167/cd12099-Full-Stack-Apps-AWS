import express from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util.js";

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// @TODO1 IMPLEMENT A RESTFUL ENDPOINT
// GET /filteredimage?image_url={{URL}}
// endpoint to filter an image from a public url.
// IT SHOULD
//    1
//    1. validate the image_url query
//    2. call filterImageFromURL(image_url) to filter the image
//    3. send the resulting file in the response
//    4. deletes any files on the server on finish of the response
// QUERY PARAMATERS
//    image_url: URL of a publicly accessible image
// RETURNS
//   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

/**************************************************************************** */

app.get("/filteredimage", (req, res, next) => {
  const auth = { login: "linhbd", password: "20231607" };
  const b64auth = (req.headers.authorization || "")?.split(" ")?.[1] || "";
  const [login, password] = Buffer.from(b64auth, "base64")
    .toString()
    .split(":");
  if (login && password && login === auth.login && password === auth.password) {
    return next();
  }
  res.status(401).send("Access Denied");
}, async (req, res) => {
  const imgUrl = req.query.image_url;
  if (!imgUrl) {
    res.status(422).send("image_url query parameter is required");
    return;
  }
  try {
    const result = await filterImageFromURL(imgUrl);
    res.sendFile(result);

    res.on("finish", () => {
      deleteLocalFiles([result]);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: "There was an error while processing the image",
    });
  }
});

//! END @TODO1

// Root Endpoint
// Displays a simple message to the user
app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}");
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});
