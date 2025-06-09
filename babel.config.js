module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',
      corejs: 3,
      targets: {
        browsers: [
          '>0.2%',
          'not dead',
          'not op_mini all',
          'not ie > 0',
          'not safari < 11',
          'not samsung < 8',
          'not and_uc < 13'
        ]
      }
    }],
    ['@babel/preset-react', {
      runtime: 'automatic',
      development: process.env.NODE_ENV === 'development'
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      regenerator: true,
      corejs: 3
    }]
  ]
};
