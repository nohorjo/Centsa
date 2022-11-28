const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/centsa2/',
  devServer: {
    allowedHosts: 'all',
  },
})

