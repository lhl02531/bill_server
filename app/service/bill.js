const Service = require('egg').Service

class BillService extends Service {
  // 添加账单
  async add(params) {
    const { app } = this
    try {
      // 插入数据
      const res = await app.mysql.insert('bill', params)
      return res
    } catch (err) {
      console.log(err)
      throw new Error(err)
    }
  }

  // 获取账单列表
  async list(id) {
    const { app } = this
    const QUERY_STR = 'id, pay_type, amount, date, type_id, type_name, remark'
    let sql = `select ${QUERY_STR} from bill where user_id = ${id}`

    try {
      const res = await app.mysql.query(sql)
      return res
    } catch (err) {
      console.log(err)
      return null
    }
  }

  // 获取账单详情
  async detail(id, user_id) {
    const { app } = this
    try {
      const res = await app.mysql.get('bill', { id, user_id })
      return res
    } catch (err) {
      console.log(err)
      return null
    }
  }

  // 更新账单
  async update(params) {
    const { app } = this
    try {
      const res = await app.mysql.update(
        'bill',
        { ...params },
        { id: params.id, user_id: params.user_id }
      )
      return res
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  // 删除账单
  async delete(id, user_id) {
    const { app } = this
    try {
      await app.mysql.delete('bill', { id, user_id })
    } catch (err) {
      throw err
    }
  }
  // 返回月度支出收入数据
  async data(id) {
    const { app } = this
    const QUERY_STR = 'id, pay_type, amount, date, type_id, type_name, remark'
    let sql = `select ${QUERY_STR} from bill where user_id =${id}`
    try {
      const res = await app.mysql.query(sql)
      return res
    } catch (err) {
      throw err
    }
  }
}

module.exports = BillService
