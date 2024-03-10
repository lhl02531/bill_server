const Controller = require('egg').Controller
// 默认头像
const defaultAvatar =
  'http://s.yezgea02.com/1615973940679/WeChat77d6d2ac093e247c361f0b8a7aeb6c2a.png'
class UserController extends Controller {
  // 注册
  async register() {
    const { ctx } = this
    const { username, password } = ctx.request.body

    // 账号和密码不能为空
    if (!username || !password) {
      ctx.body = {
        code: 500,
        message: '账号密码不能为空',
        data: null
      }

      return
    }

    const existedUser = await ctx.service.user.getRegisterdUser(username)

    if (existedUser && existedUser.id) {
      ctx.body = {
        code: 500,
        message: '账号名已被注册，请重新输入',
        data: null
      }
      return
    }

    const res = await ctx.service.user.register({
      username,
      password,
      signature: '默认签名，可修改',
      avatar: defaultAvatar
    })

    if (res) {
      ctx.body = {
        code: 200,
        message: '注册成功',
        data: null
      }
    } else {
      ctx.body = {
        code: 500,
        message: '注册失败',
        data: null
      }
    }
  }

  // 登录
  async login() {
    const { ctx, app } = this
    const { username, password } = ctx.request.body
    const existedUser = await ctx.service.user.getRegisterdUser(username)
    // 判断用户是否存在
    if (!existedUser || !existedUser.id) {
      ctx.body = {
        code: 500,
        message: '账号不存在',
        data: null
      }

      return
    }

    // 找到用户，并且判断输入密码匹配
    if (existedUser && password !== existedUser.password) {
      ctx.body = {
        code: 500,
        message: '账号或密码错误',
        data: null
      }
      return
    }

    // 生成 Token 加盐
    const token = app.jwt.sign(
      {
        id: existedUser.id,
        username: existedUser.username,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
      },
      app.config.jwt.secret
    )

    ctx.body = {
      code: 200,
      message: '登录成功',
      data: {
        token
      }
    }
  }

  // 获取用户信息
  async getUserInfo() {
    const { ctx, app } = this
    const token = ctx.request.header.authorization
    const decode = await app.jwt.verify(token, app.config.jwt.secret)
    const user = await ctx.service.user.getRegisterdUser(decode.username)
    ctx.body = {
      code: 200,
      message: '请求成功',
      data: {
        id: user.id,
        username: user.username,
        signature: user.signature,
        avatar: user.avatar || defaultAvatar
      }
    }
  }

  // 修改用户信息
  async updateUserInfo() {
    const { ctx, app } = this
    const { signature = '', avatar = '' } = ctx.request.body

    try {
      const token = ctx.request.header.authorization
      const decode = await app.jwt.verify(token, app.config.jwt.secret)
      if (!decode) return
      let userId = decode.id
      const user = await ctx.service.user.getRegisterdUser(decode.username)
      const params = {
        ...user,
        signature,
        avatar
      }
      if (signature === '') delete params.signature
      if (avatar === '') delete params.avatar
      await ctx.service.user.updateUserInfo(params)

      ctx.body = {
        code: 200,
        message: '更新成功',
        data: {
          id: userId,
          signature,
          username: user.username,
          avatar
        }
      }
    } catch (err) {
      ctx.body = {
        code: 500,
        message: '更新失败'
      }
    }
  }

  // 修改用户密码
  async updateUserPW() {
    const { ctx, app } = this
    const { oldPW, newPW, confirmPW } = ctx.request.body
    if (
      !oldPW ||
      !newPW ||
      !confirmPW ||
      newPW === oldPW ||
      newPW !== confirmPW
    ) {
      ctx.body = {
        code: 400,
        message: '参数错误，请填写正确参数'
      }
      return
    }

    try {
      const token = ctx.request.header.authorization
      const decode = await app.jwt.verify(token, app.config.jwt.secret)
      if (!decode) return
      let userId = decode.id
      const user = await ctx.service.user.getRegisterdUserByUid(userId)
      // 特殊规则，如果是用户名是 lv3333的话，不允许修改
      if (user.username === 'lv3333') {
        ctx.body = {
          code: 500,
          message: '特殊账号，不允许修改密码'
        }
        return
      }
      // 如果用户不存在或者用户密码对不上
      if (!user || user.password !== oldPW) {
        ctx.body = {
          code: 500,
          message: '旧密码错误，请输入正确旧密码'
        }
        return
      }
      // 如果参数正确，且特殊规则和旧密码符合
      // 则更新密码
      await ctx.service.user.updateUserPW({ id: user.id, password: newPW })
      ctx.body = {
        code: 200,
        message: '更新成功'
      }
    } catch (err) {
      ctx.body = {
        code: 500,
        message: '系统错误'
      }
    }
  }

  // 测试 token 是否成功
  async testToken() {
    const { ctx, app } = this
    // 通过 token 解析，拿到 user_id
    const token = ctx.request.header.authorization // 请求头获取 authorization 属性，值为 token
    // 通过 app.jwt.verify + 加密字符串 解析出 token 的值
    const decode = await app.jwt.verify(token, app.config.jwt.secret)
    // 响应接口
    ctx.body = {
      code: 200,
      message: '获取成功',
      data: {
        ...decode
      }
    }
  }
}

module.exports = UserController
