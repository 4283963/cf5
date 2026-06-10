import React, { memo } from 'react'
import { getIntensityInfo, getMembershipBadge, formatCalories, formatDuration } from '../utils/heartRateUtils'

const areEqual = (prevProps, nextProps) => {
  const prev = prevProps.student
  const next = nextProps.student

  if (!prev && !next) return true
  if (!prev || !next) return false
  if (prevProps.index !== nextProps.index) return false

  return (
    prev.heartRate === next.heartRate &&
    prev.intensity === next.intensity &&
    prev.avgHeartRate === next.avgHeartRate &&
    prev.maxHeartRate === next.maxHeartRate &&
    prev.duration === next.duration &&
    prev.team === next.team &&
    prev.dangerWarning === next.dangerWarning &&
    prev.dangerSeconds === next.dangerSeconds &&
    formatCalories(prev.totalCalories) === formatCalories(next.totalCalories)
  )
}

const HeartRateCard = memo(({ student, index }) => {
  const isConnected = student && student.heartRate > 0
  const intensityInfo = isConnected ? getIntensityInfo(student.intensity) : getIntensityInfo(0)
  const membership = student ? getMembershipBadge(student.membershipLevel) : getMembershipBadge('普通')
  const isDanger = isConnected && student?.dangerWarning === true

  const teamBadge = () => {
    if (!student?.team) return null
    if (student.team === 'RED') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-gradient-to-r from-red-500 to-red-700 text-white shadow-md shadow-red-500/30">
          🔴 红队
        </span>
      )
    }
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md shadow-blue-500/30">
        🔵 蓝队
      </span>
    )
  }

  const cardBaseClass = isDanger
    ? 'danger-card'
    : intensityInfo.className

  return (
    <div
      className={`relative rounded-2xl p-4 ${cardBaseClass} h-full min-h-[180px] overflow-hidden`}
      style={{ willChange: 'transform, opacity' }}
    >
      {isDanger && (
        <>
          <div className="absolute inset-0 danger-flash pointer-events-none z-10" />
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-400/40 to-transparent pointer-events-none z-10" />
        </>
      )}

      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20">
        <span className="text-xs font-bold text-gray-400">#{String(index + 1).padStart(2, '0')}</span>
        {teamBadge()}
        {student && !isDanger && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${membership.bg} ${membership.text}`}>
            {student.membershipLevel || '普通'}
          </span>
        )}
      </div>

      {isDanger && (
        <div className="absolute top-3 right-3 z-30">
          <div className="danger-badge flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-red-700 shadow-lg shadow-red-500/50">
            <span className="text-base animate-bounce">⚠️</span>
            <span className="text-[11px] font-black text-white">爆卡 {student?.dangerSeconds || 0}s</span>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center h-full pt-4 relative z-20">
        <h3 className={`text-xl font-bold mb-1 ${isDanger ? 'text-yellow-300' : (isConnected ? 'text-white' : 'text-gray-500')}`}>
          {student ? student.name : '---'}
        </h3>

        {isDanger && (
          <div className="text-[11px] font-black text-red-400 mb-1 animate-pulse">
            ⛔ 心率超过极限 {student?.maxHeartRateLimit ? `(>${student.maxHeartRateLimit})` : ''}
          </div>
        )}

        {isConnected ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <svg
                className={`w-8 h-8 heart-pulse ${isDanger ? 'text-red-500' : intensityInfo.color}`}
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ transformOrigin: 'center' }}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className={`text-5xl font-black ${isDanger ? 'text-red-500' : intensityInfo.color}`}>
                {student.heartRate}
              </span>
              <span className={`text-lg ${isDanger ? 'text-red-500' : intensityInfo.color}`}>bpm</span>
            </div>

            <div className={`text-sm font-semibold mb-3 px-3 py-1 rounded-full ${isDanger ? 'bg-red-600 text-white' : `${intensityInfo.bgColor} text-white`}`}>
              {isDanger ? '⚠️ 危险区域' : intensityInfo.label}
            </div>

            <div className="grid grid-cols-3 gap-2 w-full text-center">
              <div className={`rounded-lg py-1.5 px-1 ${isDanger ? 'bg-red-900/50 border border-red-500/50' : 'bg-black/20'}`}>
                <div className="text-[10px] text-gray-400 mb-0.5">卡路里</div>
                <div className={`text-sm font-bold ${isDanger ? 'text-yellow-300' : 'text-amber-400'}`}>{formatCalories(student.totalCalories)}</div>
              </div>
              <div className={`rounded-lg py-1.5 px-1 ${isDanger ? 'bg-red-900/50 border border-red-500/50' : 'bg-black/20'}`}>
                <div className="text-[10px] text-gray-400 mb-0.5">平均</div>
                <div className="text-sm font-bold text-white">{student.avgHeartRate || 0}</div>
              </div>
              <div className={`rounded-lg py-1.5 px-1 ${isDanger ? 'bg-red-900/50 border border-red-500/50' : 'bg-black/20'}`}>
                <div className="text-[10px] text-gray-400 mb-0.5">时长</div>
                <div className="text-sm font-bold text-white">{formatDuration(student.duration)}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <svg className="w-12 h-12 text-gray-600 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-sm text-gray-500">等待连接手环...</span>
          </div>
        )}
      </div>
    </div>
  )
}, areEqual)

HeartRateCard.displayName = 'HeartRateCard'

export default HeartRateCard
