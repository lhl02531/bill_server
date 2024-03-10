const Service = require('egg').Service

class UserService extends Service {
  // 判断用户是否存在
  // 这个方法不太合理，需要改进
  async getRegisterdUser(username) {
    const { app } = this
    try {
      const res = await app.mysql.get('user', { username })
      return res
    } catch (error) {
      console.log(error)
      return null
    }
  }

  // 根据用户 id 获取用户信息
  async getRegisterdUserByUid(uid) {
    const { app } = this
    try {
      const res = await app.mysql.get('user', { id: uid })
      return res
    } catch (error) {
      console.log(error)
      return null
    }
  }

  // 用户注册
  async register(params) {
    const { app } = this
    try {
      const result = await app.mysql.insert('user', params)
      return result
    } catch (err) {
      console.log(err)
      return null
    }
  }

  // 更新用户信息
  async updateUserInfo(params) {
    const { app } = this
    try {
      let res = await app.mysql.update(
        'user',
        {
          ...params
        },
        {
          id: params.id
        }
      )
      return res
    } catch (err) {
      console.log(err)
      return null
    }
  }

  // 更新用户密码
  async updateUserPW(params) {
    const { app } = this
    try {
      let res = await app.mysql.update(
        'user',
        { password: params.password },
        { where: { id: params.id } }
      )
      return res
    } catch (err) {
      console.log(err)
      throw err
    }
  }
}

module.exports = UserService
