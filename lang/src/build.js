require('babel-core/register');
var getCurrencies = require('./currencies').default;
var babel = require('babel-core');
var fs = require('fs');
var codegen = require('./parser').codegen;
var opts = {
  'presets': ['es2015', 'stage-0'],
  'plugins': ['syntax-flow', 'transform-flow-strip-types']
};

const BUILD_FOLDER = './build';

try {
  fs.mkdirSync(BUILD_FOLDER);
} catch(e) {
  // folder already exists
}

getCurrencies((rates) => {
  fs.writeFileSync(`${__dirname}/rates.js`, `
    module.exports = ${JSON.stringify(rates)};
  `);

  fs.writeFileSync(
    `${BUILD_FOLDER}/parser.js`,
    codegen()
  );

  delete require.cache[require.resolve('./units')];
  var units = require('./units').DEFAULT_ENVIRONMENT;
  fs.writeFileSync(`${__dirname}/environment.js`, `
    module.exports = ${JSON.stringify(units)};
  `);

  ['runtime.js', 'types.js', 'units.js', 'environment.js', 'rates.js'].map(function(filename) {
    fs.writeFileSync(
      `${BUILD_FOLDER}/${filename}`,
      babel.transform(fs.readFileSync(`${__dirname}/${filename}`), opts).code
    );
  });

  fs.unlinkSync(`${__dirname}/rates.js`);
  fs.unlinkSync(`${__dirname}/environment.js`);
});
