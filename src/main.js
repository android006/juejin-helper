const Juejin = require('./juejin/index.js')
const pushMessage = require('./utils/pushMessage.js')
const { wait, getRandomArbitrary } = require('./utils/utils.js')
const { USER } = require('./ENV.js')


const message = (growth) => {
  return `
Hello ${growth.userName}
${growth.checkedIn ? `签到 +${growth.incrPoint} 矿石` : '今日已签到'}
当前矿石数 ${growth.sumPoint}
当前bug数 ${growth.userOwnBug}
连续签到天数 ${growth.contCount}
累计签到天数 ${growth.sumCount}
${growth.dippedLucky ? '今日已经沾过喜气' : `沾喜气 +${growth.dipValue} 幸运值`}
当前幸运值 ${growth.luckyValue}
绑定手机号 ${growth.phone || '未绑定'}
免费抽奖次数 ${growth.freeCount}
${growth.phone ? growth.freeDrawed ? `恭喜抽中 ${growth.lotteryName}` : '今日已免费抽奖' : '未绑定手机号无法抽奖'}
${growth.collectedBug ? `收集 Bug +${growth.collectBugCount}` : '暂无可收集 Bug'}
`.trim()
}

const main = async (user) => {
  const juejin = new Juejin();

  const growth = {
    userName: '', // 用户名
    checkedIn: false, // 是否签到
    incrPoint: 0, // 签到获得矿石数
    sumPoint: 0, // 总矿石数
    contCount: 0, // 连续签到天数
    sumCount: 0, // 累计签到天数
    dippedLucky: false, // 是否沾喜气
    dipValue: 0, // 幸运值
    luckyValue: 0, // 总幸运值
    freeCount: 0, // 免费抽奖次数
    freeDrawed: false, // 是否免费抽奖
    lotteryName: '', // 奖品名称
    collectedBug: false, // 是否收集 Bug
    collectBugCount: 0, // 收集 Bug 的数量
    userOwnBug: 0, // Bug 拥有数量
    phone: false, // 是否绑定手机
  }

  // 登录
  try {
    await juejin.login(user.cookie);

    // 判断是否绑定手机号
    if (juejin.user.phone) {
      growth.phone = juejin.user.phone
    }

    growth.userName = juejin.user.user_name
  } catch {
      throw new Error(`${user.name} 登录失败, 请尝试更新 Cookies`)
  }

  // 签到
  const checkIn = await juejin.getTodayStatus()

  if (!checkIn) {
    const checkInResult = await juejin.checkIn()

    growth.checkedIn = true
    growth.incrPoint = checkInResult.incr_point
    growth.sumPoint = checkInResult.sum_point
  }

  // 签到天数
  const counts = await juejin.getCounts()

  growth.contCount = counts.cont_count
  growth.sumCount = counts.sum_count

  // 沾喜气
  const lotteryHistory = await juejin.getLotteryHistory()
  const lotteries = lotteryHistory.lotteries || []

  if (lotteries.length > 0) {
    const [firstLottery] = lotteries
    const dipLuckyResult = await juejin.dipLucky(firstLottery.history_id)

    growth.dippedLucky = dipLuckyResult.has_dip
    growth.dipValue = dipLuckyResult.dip_value
    growth.luckyValue = dipLuckyResult.total_value
  }

  // 免费抽奖, 必须得绑定手机号
  if (growth.phone) {
    const lotteryConfig = await juejin.getLotteryConfig()
    growth.freeCount = lotteryConfig.free_count || 0

    if (growth.freeCount > 0) {
      const lottery = await juejin.drawLottery()

      growth.freeDrawed = true
      growth.lotteryName = lottery.lottery_name
    }
  }

  // BugFix
  const notCollectBug = await juejin.getNotCollectBug()

  if (notCollectBug.length > 0) {
    const requests = notCollectBug.map(bug => {
      return async () => {
        await juejin.collectBug(bug)
        await wait(getRandomArbitrary(1000, 1500))
      }
    })

    for (const request of requests) {
      await request()

      growth.collectBugCount++
    }

    growth.collectedBug = true
  }

  // BugFix 竞赛
  let competition = await juejin.competition();
  if (competition && competition.competition_id) {
    let bugfixUser = await juejin.getBugfixUser(competition.competition_id);

    growth.userOwnBug = bugfixUser.user_own_bug;
  }

  pushMessage({
    type: 'info',
    message: message(growth),
  })
}

let testUserList = USER.filter(v => v.test);
if (testUserList && testUserList.length) {
  testUserList.forEach(user => {
    main(user).catch(error => {
      pushMessage({
        type: 'error',
        message: error.stack,
      })
    })
  })
} else {
  setInterval(() => {
    // 获取当前小时 0-23
    let hours = new Date().getHours();

    // 获取当前分钟 0-59
    let minutes = new Date().getMinutes();
    if (hours === 7 && minutes === 30) {
      USER.forEach(user => {
        main(user).catch(error => {
          pushMessage({
            type: 'error',
            message: error.stack,
          })
        })
      })
    }
  }, 1000 * 60)
}
