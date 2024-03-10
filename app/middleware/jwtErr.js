module.exports = (secret) => {
  return async function jwtErr(ctx, next) {
    // 拿到 token
    const token = ctx.request.header.authorization
    console.log('token==>', token)
    if (token !== 'null' && token) {
      try {
        // 验证 token
        ctx.app.jwt.verify(token, secret)
        await next()
      } catch (error) {
        console.log('eror', error)
        ctx.status = 200
        ctx.body = {
          message: 'token 已过期，请重新登录',
          code: 401
        }
        return
      }
    } else {
      ctx.status = 200
      ctx.body = {
        code: 401,
        message: 'token 不存在'
      }
      return
    }
  }
}
