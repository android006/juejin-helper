const Request = require('./request.js')
const SUCCESS_CODE = 0

class Api extends Request {
  constructor() {
    super()
    this.baseURL = 'https://api.juejin.cn'
    this.headers.referer = 'https://juejin.cn/'
    this.headers.cookie = ''
  }

  responseInterceptor(responce) {
    if (responce.err_no !== SUCCESS_CODE) {
      throw new Error(responce.err_msg)
    }

    return responce.data
  }

  setCookie(cookie) {
    this.headers.cookie = cookie
  }

  /**
   * @desc 用户信息
   * @returns {Promise<*>}
   * {
   *   user_name: String 用户名
   * }
   */
  getUser() {
    return this.get('/user_api/v1/user/get')
  }

  /**
   * @desc 当日签到状态
   * @returns {Promise<*>}
   * Boolean 是否签到
   */
  getTodayStatus() {
    return this.get('/growth_api/v1/get_today_status')
  }

  /**
   * @desc 签到
   * @returns {Promise<*>}
   * {
   *   incr_point: Number 获得矿石数
   *   sum_point: Number 总矿石数
   * }
   */
  checkIn() {
    return this.post('/growth_api/v1/check_in')
  }

  /**
   * @desc 签到天数
   * @returns {Promise<*>}
   * {
   *   cont_count: Number 连续签到天数
   *   sum_count: Number 累计签到天数
   * }
   */
  getCounts() {
    return this.get('/growth_api/v1/get_counts')
  }

  /**
   * @desc 围观大奖记录
   * @param page_no
   * @param page_size
   * @returns {Promise<*>}
   * {
   *   count: Number 数量
   *   lotteries: [
   *     {
   *       history_id: String 记录 ID
   *     }
   *   ]
   * }
   */
  getLotteryHistory({ page_no = 1, page_size = 5 } = {}) {
    return this.post('/growth_api/v1/lottery_history/global_big', { data: { page_no, page_size } })
  }

  /**
   * @desc 沾喜气
   * @param lottery_history_id
   * @returns {Promise<*>}
   * {
   *   dip_value: Number 幸运值
   *   total_value: Number 总幸运值
   *   has_dip: Boolean 是否沾过
   * }
   */
  dipLucky(lottery_history_id) {
    return this.post('/growth_api/v1/lottery_lucky/dip_lucky', { data: { lottery_history_id } })
  }

  /**
   * @desc 免费抽奖次数
   * @returns {Promise<*>}
   * {
   *   free_count: Number 免费次数
   * }
   */
  getLotteryConfig() {
    return this.get('/growth_api/v1/lottery_config/get')
  }

  /**
   * 抽奖
   * @returns {Promise<*>}
   * {
   *   lottery_name: String 奖品名称
   * }
   */
  drawLottery() {
    return this.post('/growth_api/v1/lottery/draw')
  }

  /**
   * 未收集的 Bug
   * @returns {Promise<*>}
   * [
   *   {
   *     bug_type: Number Bug 类型
   *     bug_time: Number 时间戳
   *   }
   * ]
   */
  getNotCollectBug() {
    return this.post('/user_api/v1/bugfix/not_collect')
  }

  /**
   * @desc 收集 Bug
   * @param bug_time
   * @param bug_type
   * @returns {Promise<*>}
   */
  collectBug({ bug_time = '', bug_type = '' } = {}) {
    return this.post('/user_api/v1/bugfix/collect', { data: { bug_time, bug_type } })
  }

  /**
   * bugfix 比赛看板
   * @returns {Promise<*>}
   * {
   *   competition_id: 场次id
   * }
   */
  competition() {
    return this.post('/user_api/v1/bugfix/competition', { data: {competition_id: '' } })
  }

  /**
   * 获取 bugFix 本场个人详情
   * @returns {Promise<*>}
   * {
   *   user_own_bug: 用户拥有bug数
   * }
   */
  getBugfixUser(competition_id) {
    return this.post('/user_api/v1/bugfix/user', {data: { competition_id }})
  }
}

module.exports = Api
