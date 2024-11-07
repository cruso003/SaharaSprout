const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

router.post('/translate', async (req, res) => {
    const { text, targetLanguage } = req.body;

    try {
        // Construct the prompt for translation
        const prompt = `Translate the following text into ${targetLanguage}: "${text}"`;;

        // Generate the translation using the generative model
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log("response: ", response, );
        
        const translatedText = response.text();
        console.log("translatedText:", translatedText);
        

        res.json({ translatedText });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).send('Translation failed');
    }
});

module.exports = router;
