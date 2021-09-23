import express from 'express';
import { Database } from './index';

const app: express.Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./updateHistory.html'));

require('./client');

app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
  }
);

app.listen(3000, () => {
  console.log('Start on port 3000');
  Database;
});

app.get('/', function (req, res) {
  res.send('connected');
});
