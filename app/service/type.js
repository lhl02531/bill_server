const Service = require('egg').Service

class TypeService extends Service {
  async list() {
    const { app } = this
    let sql = `select * from type`
    try {
      const res = await app.mysql.query(sql)
      return res
    } catch (err) {
      console.log(err)
      return null
    }
  }
}

module.exports = TypeService
