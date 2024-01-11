import express from 'express'
import axios from 'axios';
import cors from 'cors'
import fs from 'fs';

const app = express();
const port = 5000; // You can choose any available port

app.use(express.json());

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(cors({
    origin: 'http://49.149.87.60:3000', // Replace with the origin of your Vue.js app
    credentials: true,
  }));

// Define a route to proxy OpenAI API requests
app.post('/openai', async (req, res) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/completions', req.body, {
      headers: {
        'Authorization': 'Bearer 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', // Replace with your actual API key
        'Content-Type': 'application/json',
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response.status).json(error.response.data);
  }
});


app.post('/generate-image', async (req, res) => {
    try {
      const response = await axios.post('https://api.openai.com/v1/images/generations', req.body, {
        headers: {
          'Authorization': 'Bearer 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', // Replace with your actual API key
          'Content-Type': 'application/json',
        },
      });
      console.log('test-->', response.data)
      res.json(response.data);
    } catch (error) {
      res.status(error.response.status).json(error.response.data);
    }
  });

app.get('/image-convert', async (req, res) => {
 
  const imageUrl = req.query.url; // Assuming this is 'http://localhost:8000/storage/presentations_image/1697934290_65346bd22125e.jpg'

  try {
    // Fetch the image from the URL
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer', // Tell Axios to treat the response as an array buffer
    });

    // Convert the array buffer to base64
    const base64Data = Buffer.from(response.data, 'binary').toString('base64');

    // Construct a data URL
    const base64Image = `data:image/jpeg;base64,${base64Data}`; // Replace 'image/jpeg' with the appropriate image format

    res.send(base64Image);
  } catch (error) {
    console.error('Error converting image to base64:', error);
    res.status(500).send('Error converting image to base64');
  }
});



app.listen(port, () => {
  console.log(`Proxy server is running on port ${port}`);
});
