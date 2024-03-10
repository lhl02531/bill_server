const Controller = require('egg').Controller
const moment = require('moment')
// 用来筛选月份的条件
function condition(item, date) {
  return moment(Number(item.date)).format('YYYY-MM') === date
}
class BillController extends Controller {
  // 添加账单
  async add() {
    const { ctx, app } = this
    const {
      amount,
      type_id,
      type_name,
      date,
      pay_type,
      remark = ''
    } = ctx.request.body

    // 判空处理
    if (!amount || !type_id || !type_name || !date || !pay_type) {
      ctx.body = {
        code: 400,
        message: '参数错误',
        data: null
      }
    }

    try {
      const token = ctx.request.header.authorization
      const decode = await app.jwt.verify(token, app.config.jwt.secret)
      if (!decode) return
      let user_id = decode.id
      const res = await ctx.service.bill.add({
        amount,
        type_id,
        type_name,
        date,
        pay_type,
        remark,
        user_id
      })

      ctx.body = {
        code: 200,
        message: '添加成功',
        data: res
      }
    } catch (err) {
      console.log(err)
      ctx.body = {
        code: 500,
        message: '系统错误'
      }
    }
  }

  // 获取账单列表
  async list() {
    const { ctx, app } = this
    const { date, page = 1, pageSize = 5, type_id = 'all' } = ctx.query
    try {
      const token = ctx.request.header.authorization
      const decode = await app.jwt.verify(token, app.config.jwt.secret)
      if (!decode) return
      let user_id = decode.id
      const list = await ctx.service.bill.list(user_id)

      // 过滤出月份和类型所对应的账单列表
      const listByMonAndType = list.filter((item) => {
        return type_id !== 'all'
          ? condition(item, date) && Number(type_id) === item.type_id
          : condition(item, date)
      })
      // 格式化数据
      // 最后还进行了一步排序操作
      let formatMap = listByMonAndType
        .reduce((curr, item) => {
          // 格式化
          const date = moment(Number(item.date)).format('YYYY-MM-DD')
          const index = curr.findIndex((item) => item.date === date)
          const commonCondition = curr && curr.length
          // 如果能在数组 curr 中找到当前项日期 date, 则在数组中加入当前项到 bill 数组
          if (commonCondition && index > -1) {
            curr[index].bills.push(item)
          }

          // 如果在数组 curr 找不到当前项，则新建一项
          if (commonCondition && index === -1) {
            curr.push({ date, bills: [item] })
          }

          // 如果数组 curr 为空
          if (!curr.length) {
            curr.push({ date, bills: [item] })
          }

          return curr
        }, [])
        .sort((a, b) => moment(b.date) - moment(a.date))

      // 格式化后的 filterMap 还需要分页
      const filterListMap = formatMap.slice(
        (page - 1) * pageSize,
        page * pageSize
      )
      // 当月账单列表
      const listByMon = list.filter((item) => condition(item, date))
      // 累加计算支出
      let totalExpense = listByMon.reduce((curr, item) => {
        if (item.pay_type === 1) {
          curr += Number(item.amount)
        }
        return curr
      }, 0)
      // 累加计算收入
      let totalIncome = listByMon.reduce((curr, item) => {
        if (item.pay_type === 2) {
          curr += Number(item.amount)
          return curr
        }
        return curr
      }, 0)

      ctx.body = {
        code: 200,
        message: '请求成功',
        data: {
          totalExpense, // 当月指出
          totalIncome, // 当月收入
          totalPage: Math.ceil(formatMap.length / pageSize), // 总分页
          list: filterListMap || [] // 格式化且分页的数据列表
        }
      }
    } catch (err) {
      console.log(err)
      ctx.body = {
        code: 500,
        message: '系统错误'
      }
    }
  }

  //  获取账单详情
  async detail() {
    const { ctx, app } = this
    //
    const { id = ' ' } = ctx.query
    // 判断是否传入账单 id
    if (!id) {
      ctx.body = {
        code: 500,
        message: '订单 id 不能为空'
      }
      return
    }
    const token = ctx.request.header.authorization
    const decode = await app.jwt.verify(token, app.config.jwt.secret)
    if (!decode) return
    let user_id = decode.id
    try {
      // 获取账单详情
      const detail = await ctx.service.bill.detail(id, user_id)
      ctx.body = {
        code: 200,
        message: '请求成功',
        data: detail
      }
    } catch (err) {
      ctx.body = {
        code: 500,
        message: '系统错误'
      }
    }
  }

  // 更新账单
  async update() {
    const { ctx, app } = this

    // 账单的相关参数，这里注意要把账单的 id 也传进来
    const {
      id,
      amount,
      type_id,
      type_name,
      date,
      pay_type,
      remark = ''
    } = ctx.request.body

    // 判空处理
    if (!id || !amount || !type_id || !type_name || !date || !pay_type) {
      ctx.body = {
        code: 400,
        message: '参数错误'
      }
      return
    }
    const token = ctx.request.header.authorization
    const decode = await app.jwt.verify(token, app.config.jwt.secret)
    if (!decode) return
    let user_id = decode.id
    try {
      await ctx.service.bill.update({
        id,
        amount,
        type_id,
        type_name,
        date,
        pay_type,
        remark,
        user_id
      })
      ctx.body = {
        code: 200,
        message: '更新成功'
      }
    } catch (err) {
      console.log(err)
      ctx.body = {
        code: 500,
        message: '系统错误'
      }
    }
  }

  // 删除账单
  async delete() {
    const { ctx, app } = this
    const { id } = ctx.request.body
    if (!id) {
      ctx.body = {
        code: 400,
        message: '参数错误,账单 id 必传'
      }
      return
    }
    const token = ctx.request.header.authorization
    const decode = await app.jwt.verify(token, app.config.jwt.secret)
    if (!decode) return
    let user_id = decode.id
    try {
      await ctx.service.bill.delete(id, user_id)
      ctx.body = {
        code: 200,
        message: '删除成功'
      }
    } catch (err) {
      console.log(err)
      ctx.body = {
        code: 500,
        message: '删除失败'
      }
    }
  }

  async data() {
    const { ctx, app } = this
    const { date } = ctx.query
    if (!date) {
      ctx.body = {
        code: 400,
        message: '参数错误,账单 id 必传'
      }
      return
    }
    const token = ctx.request.header.authorization
    const decode = await app.jwt.verify(token, app.config.jwt.secret)
    if (!decode) return
    let user_id = decode.id
    try {
      const result = await ctx.service.bill.data(user_id)
      // 时间参数，筛选当月所有的账单数据
      const start = moment(date).startOf('month').unix() * 1000 // 月初时间
      const end = moment(date).endOf('month').unix() * 1000 // 月初时间
      console.log('开始结束 start, end====>', start, end)
      const list = result.filter(
        (item) => Number(item.date) > start && Number(item.date) < end
      )
      // 总支出
      const total_expense = list.reduce((res, curr) => {
        if (curr.pay_type === 1) {
          res += Number(curr.amount)
        }
        return res
      }, 0)
      // 总收入
      const total_income = list.reduce((res, curr) => {
        if (curr.pay_type === 2) {
          res += Number(curr.amount)
        }
        return res
      }, 0)

      // 收支构成对象
      let total_data = list.reduce((arr, curr) => {
        // 尝试在 arr 找当前项的支付类型
        const index = arr.findIndex((item) => item.type_id === curr.type_id)
        // 如果没找到，将当前项添加到 arr
        if (index === -1) {
          arr.push({
            type_id: curr.type_id,
            type_name: curr.type_name,
            pay_type: curr.pay_type,
            number: Number(curr.amount)
          })
        }

        if (index > -1) {
          arr[index].number += Number(curr.amount)
        }
        return arr
      }, [])

      total_data = total_data.map((item) => {
        item.number = Number(Number(item.number).toFixed(2))
        return item
      })
      console.log('total_data==>', total_data)
      ctx.body = {
        code: 200,
        message: '请求成功',
        data: {
          totalExpense: Number(total_expense).toFixed(2),
          totalIncome: Number(total_income).toFixed(2),
          total_data: total_data || []
        }
      }
    } catch (err) {
      console.log(err)
      ctx.body = {
        code: 500,
        message: '系统错误'
      }
    }
  }
}

module.exports = BillController
