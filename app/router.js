/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller, middleware } = app
  const _jwt = middleware.jwtErr(app.config.jwt.secret)
  // 路由-user
  router.post('/user/register', controller.user.register) // 注册
  router.post('/user/login', controller.user.login) // 登录
  router.get('/user/test', _jwt, controller.user.testToken) // 测试 Token 是否生效
  router.get('/user/getUserInfo', _jwt, controller.user.getUserInfo) // 获取用户信息
  router.post('/user/updateUserInfo', _jwt, controller.user.updateUserInfo) // 更新用户信息
  router.post('/user/updateUserPW', _jwt, controller.user.updateUserPW) // 更新用户密码
  router.post('/upload', _jwt, controller.upload.upload) // 上传头像
  router.post('/deleteFile', _jwt, controller.upload.deleteFile) // 删除头像

  // 路由-bill
  router.post('/bill/add', _jwt, controller.bill.add) // 添加账单
  router.get('/bill/list', _jwt, controller.bill.list) // 获取账单列表
  router.get('/bill/detail', _jwt, controller.bill.detail) // 获取账单详情
  router.post('/bill/update', _jwt, controller.bill.update) // 更新账单
  router.post('/bill/delete', _jwt, controller.bill.delete) // 删除账单
  router.get('/bill/data', _jwt, controller.bill.data) // 月度收支数据

  // 路由-type
  router.get('/type/list', _jwt, controller.type.list) // 获取全部 type
}
