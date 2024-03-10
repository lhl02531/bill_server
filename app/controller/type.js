const Controller = require('egg').Controller

class TypeController extends Controller {
  async list() {
    const { ctx, app } = this
    const token = ctx.request.header.authorization
    const decode = await app.jwt.verify(token, app.config.jwt.secret)
    if (!decode) return
    const list = await ctx.service.type.list()
    ctx.body = {
      code: 200,
      message: '请求成功',
      data: { list }
    }
  }
}
module.exports = TypeController
