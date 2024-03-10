const fs = require('fs')
const moment = require('moment')
const mkdirp = require('mkdirp')
const path = require('path')

const Controller = require('egg').Controller

class UploadController extends Controller {
  async upload() {
    const { ctx } = this
    console.log('files==>', ctx.request.files)
    let file = ctx.request.files[0]
    let uploadDir = ''
    try {
      let f = fs.readFileSync(file.filepath)
      // 获取当前日期
      let day = moment(new Date()).format('YYYYMMDD')
      //  创建图片保存的路径
      let dir = path.join(this.config.uploadDir, day)
      // 毫秒数
      let date = Date.now()
      // 如果不存在目录
      await mkdirp.mkdirp(dir)
      // 图片保存的路径
      uploadDir = path.join(dir, date + path.extname(file.filename))
      // 写入文件
      fs.writeFileSync(uploadDir, f)
    } catch (err) {
      console.log('上传错误', err)
      ctx.body = {
        code: 500,
        message: '上传失败'
      }
      return
    } finally {
      await ctx.cleanupRequestFiles()
    }
    uploadDir = uploadDir.split(path.sep).join('/')
    ctx.body = {
      code: 200,
      message: '上传成功',
      data: uploadDir.replace(/app/, '')
    }
  }

  async deleteFile() {
    const { ctx } = this
    const { avatar } = ctx.request.body

    if (!avatar) {
      ctx.body = {
        code: 400,
        message: '参数错误'
      }
    }

    try {
      // fileName 类似 'http://127.0.0.1:7001/public/upload/20240308/1709890350676.jpeg'
      // 拿到 /20240308/1709890350676.jpeg
      const fileName = avatar.split('/upload')[1]
      let filePath = path.join('app/public/upload', fileName)
      await fs.promises.unlink(filePath)
      ctx.body = {
        code: 200,
        message: '删除成功'
      }
    } catch (err) {
      console.log('文件删除失败', err)
      ctx.body = {
        code: 500,
        message: '删除失败'
      }
    }
  }
}

module.exports = UploadController
