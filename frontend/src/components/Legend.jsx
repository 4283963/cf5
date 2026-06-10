import React from 'react'

const Legend = () => {
  const items = [
    { color: 'bg-blue-500', label: '低强度', desc: '心率 < 最大心率60%', textColor: 'text-blue-400' },
    { color: 'bg-emerald-500', label: '燃脂区', desc: '60% ~ 85% 最大心率', textColor: 'text-emerald-400' },
    { color: 'bg-red-500', label: '极限区', desc: '心率 > 最大心率85%', textColor: 'text-red-400' },
  ]

  return (
    <div className="flex items-center gap-8">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${item.color} shadow-lg`} style={{ boxShadow: `0 0 12px ${item.color.replace('bg-', 'rgb(').replace('-', ',').replace('-500', ',1)')}` }}></div>
          <span className={`text-sm font-bold ${item.textColor}`}>{item.label}</span>
          <span className="text-xs text-gray-500">({item.desc})</span>
        </div>
      ))}
    </div>
  )
}

export default Legend
