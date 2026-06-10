import React, { useMemo } from 'react'

const TeamPKBar = ({ redCalories, blueCalories, redCount, blueCount, redDanger, blueDanger }) => {
  const stats = useMemo(() => {
    const red = Number(redCalories) || 0
    const blue = Number(blueCalories) || 0
    const total = red + blue
    const redPct = total > 0 ? (red / total) * 100 : 50
    const bluePct = total > 0 ? (blue / total) * 100 : 50
    const diff = Math.abs(red - blue).toFixed(2)
    const leader = red > blue ? 'RED' : (blue > red ? 'BLUE' : 'TIE')
    return { red, blue, total, redPct, bluePct, diff, leader }
  }, [redCalories, blueCalories])

  return (
    <div className="w-full bg-gradient-to-b from-gray-900/90 to-black/60 rounded-3xl p-5 border border-gray-700/50 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/40">
              <span className="text-white font-black text-lg">R</span>
            </div>
            {redDanger > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-red-900 text-[10px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-red-900">
                {redDanger}
              </span>
            )}
          </div>
          <div>
            <div className="text-red-400 font-black text-xl">红队 RED</div>
            <div className="text-xs text-gray-400">在线 {redCount} 人</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🔥</span>
            <span className="text-3xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              燃脂大 PK
            </span>
            <span className="text-2xl">🔥</span>
          </div>
          {stats.leader !== 'TIE' && (
            <div className={`text-xs font-bold px-3 py-0.5 rounded-full ${
              stats.leader === 'RED'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {stats.leader === 'RED' ? '红队' : '蓝队'} 领先 {stats.diff} kcal
            </div>
          )}
          {stats.leader === 'TIE' && (
            <div className="text-xs font-bold text-gray-400 px-3 py-0.5 rounded-full bg-gray-700/50">
              势均力敌
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-blue-400 font-black text-xl">蓝队 BLUE</div>
            <div className="text-xs text-gray-400">在线 {blueCount} 人</div>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/40">
              <span className="text-white font-black text-lg">B</span>
            </div>
            {blueDanger > 0 && (
              <span className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-400 text-red-900 text-[10px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-red-900">
                {blueDanger}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative h-14 bg-gray-800/80 rounded-full overflow-hidden border-2 border-gray-600 shadow-inner">
        <div
          className="absolute left-0 top-0 h-full transition-all duration-700 ease-out flex items-center"
          style={{ width: `${Math.max(stats.redPct, 3)}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-400" />
          <div className="absolute inset-0 opacity-50"
               style={{
                 backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 15px, rgba(255,255,255,0.2) 15px, rgba(255,255,255,0.2) 20px)',
                 animation: 'stripeMoveRed 0.8s linear infinite'
               }}
          />
          <div className="relative z-10 ml-4 flex items-center gap-2">
            <span className="text-white font-black text-2xl drop-shadow-lg">{stats.red.toFixed(1)}</span>
            <span className="text-red-100 text-xs font-bold opacity-80">kcal</span>
          </div>
          {stats.redPct >= stats.bluePct && (
            <div className="absolute right-0 top-0 h-full w-1 bg-yellow-300 shadow-[0_0_15px_#fde047] animate-pulse" />
          )}
        </div>

        <div
          className="absolute right-0 top-0 h-full transition-all duration-700 ease-out flex items-center justify-end"
          style={{ width: `${Math.max(stats.bluePct, 3)}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-blue-600 via-blue-500 to-blue-400" />
          <div className="absolute inset-0 opacity-50"
               style={{
                 backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 15px, rgba(255,255,255,0.2) 15px, rgba(255,255,255,0.2) 20px)',
                 animation: 'stripeMoveBlue 0.8s linear infinite'
               }}
          />
          <div className="relative z-10 mr-4 flex items-center gap-2">
            <span className="text-blue-100 text-xs font-bold opacity-80">kcal</span>
            <span className="text-white font-black text-2xl drop-shadow-lg">{stats.blue.toFixed(1)}</span>
          </div>
          {stats.bluePct > stats.redPct && (
            <div className="absolute left-0 top-0 h-full w-1 bg-yellow-300 shadow-[0_0_15px_#fde047] animate-pulse" />
          )}
        </div>

        <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gray-500/60 -translate-x-1/2 z-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-900 border-2 border-gray-500 flex items-center justify-center shadow-xl">
            <span className="text-yellow-400 font-black text-sm">VS</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-500 px-4">
        <span>起点</span>
        <span className="text-amber-400">总消耗 {(stats.red + stats.blue).toFixed(2)} kcal</span>
        <span>起点</span>
      </div>

      <style>{`
        @keyframes stripeMoveRed {
          from { background-position: 0 0; }
          to { background-position: 40px 0; }
        }
        @keyframes stripeMoveBlue {
          from { background-position: 40px 0; }
          to { background-position: 0 0; }
        }
      `}</style>
    </div>
  )
}

export default TeamPKBar
