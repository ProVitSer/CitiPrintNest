module.exports = {
    apps : [{
      name: 'NewCityPrintBitrix',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
    }],
  }
