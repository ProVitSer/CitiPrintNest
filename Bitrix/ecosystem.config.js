module.exports = {
    apps : [{
      name: 'CityPrintBitrix',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
    }],
  }