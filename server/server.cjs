// This is v1 of the server.cjs, whis is only supported with gemini API Keys.
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

app.post('/process-text', async (req, res) => {
    const { finalText } = req.body;

    if (!finalText) {
        return res.status(400).json({ error: 'finalText is required' });
    }

    try {
        const result = await model.generateContent(finalText);
        const responseText = result.response.text();

        res.json({ response: responseText });
    } catch (error) {
        console.error('Error interacting with Gemini API:', error);
        res.status(500).json({ error: 'Failed to process the text' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
