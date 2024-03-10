/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  // mysql 插件起用
  mysql: {
    enable: true,
    package: 'egg-mysql'
  },
  // egg-jwt 插件起用
  jwt: {
    enable: true,
    package: 'egg-jwt'
  },
  // cors 插件起用
  cors: {
    enable: true,
    package: 'egg-cors'
  }
}
