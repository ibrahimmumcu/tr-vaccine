const MongoClient = require('mongodb').MongoClient;

export default async function handler(req, res) {
  if (req.query.API_KEY !== process.env.API_KEY) {
    res.writeHead(301, {
      Location: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });
    res.end();
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'max-age=0, s-maxage=3600');

  const result = await getData();

  let tempResult = [],
    tempDate;

  for (let item of result) {
    item['number'] = Number(item.number.replace(/\./g, ''));
    tempDate = new Date(item.date);
    item['date'] =
      ('0' + tempDate.getDate()).slice(-2) +
      '.' +
      ('0' + (tempDate.getMonth() + 1)).slice(-2) +
      '.' +
      tempDate.getFullYear() +
      ' ' +
      ('0' + (tempDate.getHours() + 1)).slice(-2) +
      ':' +
      ('0' + (tempDate.getMinutes() + 1)).slice(-2);
    tempResult.push(item);
  }

  res.json(tempResult);
}

async function getData() {
  const client = await MongoClient.connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
  }).catch((err) => {
    console.log(err);
  });
  try {
    const db = client.db(process.env.MONGODB_DB);
    const data = await db
      .collection(process.env.MONGODB_COLLECTION)
      .find()
      .sort({date:1})
      .toArray();
    console.log('get data success');
    return data;
  } catch (error) {
    console.log('get data error', error);
    return error;
  } finally {
    console.log('get data close connection');
    client.close();
  }
}
