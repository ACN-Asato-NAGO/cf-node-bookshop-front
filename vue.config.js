const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      "/browse/": {
        target: process.env.USE_LOCAL_SERVER ? 'http://localhost:4004' : process.env.API_URL,
      }
    }
  }

})
