const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const { spawn } = require("child_process");

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'https://r23.core.learn.edgenuity.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(bodyParser.json());

app.post("/api/question", async (req, res) => {
  const questionText = req.body.text;

  console.log(`Received question from client: ${questionText}`);

  const pythonProcess = spawn("python3", ["script.py", questionText]);

  let aiResponse = "";

  pythonProcess.stdout.on("data", (data) => {
    aiResponse += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    if (code === 0) {
      console.log(`AI Response: ${aiResponse.trim()}`);
      res.json({ response: aiResponse.trim() });
      console.log('Response sent to client');
    } else {
      res.status(500).send("Error processing AI response.");
      console.error('Error processing AI response');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
