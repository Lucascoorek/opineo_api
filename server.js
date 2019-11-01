const express = require('express');
const request = require('request');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json({ extended: false }));

app.get('/', (req, res) => {
  res.send('Hello from api');
});

app.get('/opineo/:name', (req, res) => {
  try {
    const option = {
      uri: `https://www.opineo.pl/sklep/${req.params.name}-pl`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };
    request(option, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200)
        return res.status(404).json({ msg: 'Data not found' });

      const arr = [];
      const $ = cheerio.load(body);
      const tr = $('.info tbody tr');
      for (let i = 0; i < tr.length; i++) {
        arr[i] = tr.eq(i).text();
      }

      const obj = {};
      for (let str of arr) {
        const res = str.split(':');
        obj[res[0]] = res[1];
        if (res.length === 3) {
          obj[res[0]] = res[1] + res[2];
        }
      }
      return res.json(obj);
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

app.listen(port, () => console.log(`Server running at: ${port}`));
