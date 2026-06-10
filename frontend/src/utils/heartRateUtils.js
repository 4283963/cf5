export const getIntensityInfo = (intensity) => {
  switch (intensity) {
    case 1:
      return {
        label: '低强度',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500',
        borderColor: 'border-blue-500',
        className: 'intensity-low',
        hex: '#3b82f6'
      }
    case 2:
      return {
        label: '燃脂区',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500',
        borderColor: 'border-emerald-500',
        className: 'intensity-fatburn',
        hex: '#10b981'
      }
    case 3:
      return {
        label: '极限区',
        color: 'text-red-400',
        bgColor: 'bg-red-500',
        borderColor: 'border-red-500',
        className: 'intensity-extreme',
        hex: '#ef4444'
      }
    default:
      return {
        label: '待连接',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500',
        borderColor: 'border-gray-500',
        className: 'idle-card',
        hex: '#6b7280'
      }
  }
}

export const getMembershipBadge = (level) => {
  switch (level) {
    case '钻石':
      return { bg: 'bg-gradient-to-r from-cyan-400 to-blue-500', text: 'text-white' }
    case '白金':
      return { bg: 'bg-gradient-to-r from-gray-300 to-gray-400', text: 'text-gray-900' }
    case '黄金':
      return { bg: 'bg-gradient-to-r from-yellow-400 to-amber-500', text: 'text-white' }
    default:
      return { bg: 'bg-gray-600', text: 'text-gray-200' }
  }
}

export const formatCalories = (cal) => {
  if (!cal) return '0.00'
  return Number(cal).toFixed(2)
}

export const formatDuration = (min) => {
  if (!min) return '0分'
  if (min < 60) return `${min}分`
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}时${m}分`
}
