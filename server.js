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

      //Scraping data
      const rating = $('.sh_rnote');
      const ratingCount = $('.sh_revcount');
      const ratingCountArr = ratingCount.text().split('opinii');
      const tr = $('.info tbody tr');

      // Array of key:value pairs from scrapped data
      for (let i = 0; i < tr.length; i++) {
        arr[i] = tr.eq(i).text();
      }

      //Contructing object of final data
      const obj = {};
      obj['averageRating'] = rating.text();
      obj['ratingCount'] = ratingCountArr[0];
      for (let str of arr) {
        const res = str.split(':');
        if (res[0] === 'Nazwa firmy') {
          obj['name'] = res[1];
        }
        if (res[0] === 'E-mail') {
          obj['email'] = res[1];
        }
        if (res[0] === 'Telefon') {
          obj['phone'] = res[1];
        }
        if (res[0] === 'Województwo') {
          obj['voivodeship'] = res[1];
        }
        if (res[0] === 'Miasto') {
          obj['city'] = res[1];
        }
        if (res[0] === 'Kod pocztowy') {
          obj['postalCode'] = res[1];
        }
        if (res[0] === 'Ulica') {
          obj['street'] = res[1];
        }
        if (res[0] === 'Www') {
          obj['websiteUrl'] = res[1] + res[2];
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
