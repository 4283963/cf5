import React, { useState, useEffect } from 'react'

const Header = ({ classInfo, connectedCount, totalCalories, avgHeartRate }) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', { hour12: false })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long'
    })
  }

  const getClassStatus = (status) => {
    switch (status) {
      case 1: return { text: '待开始', color: 'text-yellow-400' }
      case 2: return { text: '进行中', color: 'text-emerald-400' }
      case 3: return { text: '已结束', color: 'text-gray-400' }
      default: return { text: '未知', color: 'text-gray-400' }
    }
  }

  return (
    <div className="bg-gradient-to-r from-gym-darker via-gym-card to-gym-darker border-b border-gray-700/50 px-8 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">
                智能操房心率监控系统
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Smart Gym Heart Rate Monitoring</p>
            </div>
          </div>

          {classInfo && (
            <div className="h-12 w-px bg-gray-700"></div>
          )}

          {classInfo && (
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-white">{classInfo.className}</span>
                <span className={`text-xs px-2 py-1 rounded-full bg-black/40 font-semibold ${getClassStatus(classInfo.status).color}`}>
                  {getClassStatus(classInfo.status).text}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                <span>教练: {classInfo.coachName || '待定'}</span>
                <span>操房: {classInfo.roomId}</span>
                <span>类型: {classInfo.classType || '团课'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6 bg-black/30 rounded-2xl px-6 py-3">
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-400">{connectedCount}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">在线学员</div>
            </div>
            <div className="h-8 w-px bg-gray-700"></div>
            <div className="text-center">
              <div className="text-2xl font-black text-amber-400">{Number(totalCalories).toFixed(1)}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">总卡路里(kcal)</div>
            </div>
            <div className="h-8 w-px bg-gray-700"></div>
            <div className="text-center">
              <div className="text-2xl font-black text-cyan-400">{avgHeartRate}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">平均心率</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-black text-white font-mono tracking-wider">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs text-gray-400 mt-1">{formatDate(currentTime)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
