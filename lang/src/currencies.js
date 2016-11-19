import request from 'request';

const APP_ID = '6bbadc74f96e427a8aa9dc1a6bd8e57b';

export default function getCurrencies(cb) {
  request(
    `https://openexchangerates.org/api/latest.json?app_id=${APP_ID}`,
    (error, response, body) => {
      const rates = JSON.parse(body).rates;
      cb(rates);
    }
  )
};
