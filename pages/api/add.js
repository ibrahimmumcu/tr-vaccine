const MongoClient = require('mongodb').MongoClient;
const covid19VaccineUrl = 'https://covid19asi.saglik.gov.tr/';

export default async function handler(req, res) {
  let number;
  let browser = null;
  let page;

  if (req.query.API_KEY !== process.env.API_KEY) {
    res.writeHead(301, {
      Location: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });
    res.end();
  }

  res.statusCode = 200;

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    const chrome = require('chrome-aws-lambda');

    try {
      browser = await chrome.puppeteer.launch({
        args: chrome.args,
        defaultViewport: chrome.defaultViewport,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
        ignoreHTTPSErrors: true,
      });

      page = await browser.newPage();
      await page.goto(covid19VaccineUrl);
      number = await page.$$eval('.count-nums', (elements) =>
        elements.map((item) => item.textContent)
      );
    } catch (error) {
      console.log('puppeteer got error', error);
    } finally {
      if (browser !== null) {
        await browser.close();
        const response = await addNewItem(number);
        res.json(response);
      }
    }
  } else {
    const puppeteer = require('puppeteer');

    (async () => {
      browser = await puppeteer.launch();
      page = await browser.newPage();
      await page.goto(covid19VaccineUrl);
      number = await page.$$eval('.count-nums', (elements) =>
        elements.map((item) => item.textContent)
      );
      await browser.close();
      const response = await addNewItem(number);
      res.json(response);
    })();
  }
}

async function addNewItem(number) {
  const item = {
    date: new Date(),
    number: number[0].replace(/\./g, ''),
  };
  const client = await MongoClient.connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
  }).catch((err) => {
    console.log(err);
  });
  try {
    const db = client.db(process.env.MONGODB_DB);
    await db.collection(process.env.MONGODB_COLLECTION).insertOne(item);
    console.log('new item has been added');
    return 'Added';
  } catch (error) {
    console.log('new item error', error);
    return error;
  } finally {
    console.log('new item added close connection');
    client.close();
  }
}
