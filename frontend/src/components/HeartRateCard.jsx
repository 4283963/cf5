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
    formatCalories(prev.totalCalories) === formatCalories(next.totalCalories)
  )
}

const HeartRateCard = memo(({ student, index }) => {
  const isConnected = student && student.heartRate > 0
  const intensityInfo = isConnected ? getIntensityInfo(student.intensity) : getIntensityInfo(0)
  const membership = student ? getMembershipBadge(student.membershipLevel) : getMembershipBadge('普通')

  return (
    <div
      className={`relative rounded-2xl p-4 ${intensityInfo.className} h-full min-h-[180px]`}
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span className="text-xs font-bold text-gray-400">#{String(index + 1).padStart(2, '0')}</span>
        {student && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${membership.bg} ${membership.text}`}>
            {student.membershipLevel || '普通'}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center justify-center h-full pt-4">
        <h3 className={`text-xl font-bold mb-2 ${isConnected ? 'text-white' : 'text-gray-500'}`}>
          {student ? student.name : '---'}
        </h3>

        {isConnected ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <svg
                className={`w-8 h-8 heart-pulse ${intensityInfo.color}`}
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ transformOrigin: 'center' }}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className={`text-5xl font-black ${intensityInfo.color}`}>
                {student.heartRate}
              </span>
              <span className={`text-lg ${intensityInfo.color}`}>bpm</span>
            </div>

            <div className={`text-sm font-semibold mb-3 px-3 py-1 rounded-full ${intensityInfo.bgColor} text-white`}>
              {intensityInfo.label}
            </div>

            <div className="grid grid-cols-3 gap-3 w-full text-center">
              <div className="bg-black/20 rounded-lg py-2 px-1">
                <div className="text-[10px] text-gray-400 mb-0.5">卡路里</div>
                <div className="text-sm font-bold text-amber-400">{formatCalories(student.totalCalories)}</div>
              </div>
              <div className="bg-black/20 rounded-lg py-2 px-1">
                <div className="text-[10px] text-gray-400 mb-0.5">平均</div>
                <div className="text-sm font-bold text-white">{student.avgHeartRate || 0}</div>
              </div>
              <div className="bg-black/20 rounded-lg py-2 px-1">
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
