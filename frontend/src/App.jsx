import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Header from './components/Header'
import HeartRateCard from './components/HeartRateCard'
import Legend from './components/Legend'
import TeamPKBar from './components/TeamPKBar'
import { useHeartRateWebSocket } from './hooks/useHeartRateWebSocket'

const TOTAL_STUDENTS = 20
const EMPTY_TEMPLATE = Object.freeze({ heartRate: 0, intensity: 0 })

function App() {
  const { heartRateData, isConnected } = useHeartRateWebSocket()
  const [students, setStudents] = useState([])
  const [classInfo, setClassInfo] = useState(null)
  const [mockRunning, setMockRunning] = useState(false)
  const [teamAssignment, setTeamAssignment] = useState({})

  const fetchInitialData = useCallback(async () => {
    try {
      const [studentsRes, classRes, mockRes, teamRes] = await Promise.all([
        fetch('/api/student/list').then(r => r.json()),
        fetch('/api/class/current?roomId=ROOM-A01').then(r => r.json()),
        fetch('/api/mock/status').then(r => r.json()),
        fetch('/api/heartrate/team-stats').then(r => r.json())
      ])
      if (studentsRes.code === 200) setStudents(studentsRes.data || [])
      if (classRes.code === 200) setClassInfo(classRes.data)
      if (mockRes.code === 200) setMockRunning(mockRes.data?.running || false)
      if (teamRes.code === 200) setTeamAssignment(teamRes.data?.teamAssignment || {})
    } catch (e) {
      console.error('获取初始数据失败:', e)
    }
  }, [])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const autoCheckin = useCallback(async () => {
    if (!classInfo) {
      alert('没有进行中的课程，请先创建课程')
      return
    }
    try {
      for (const s of students) {
        await fetch('/api/class/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classId: classInfo.id, braceletId: s.braceletId })
        })
      }
      alert('全部学员签到成功！')
    } catch (e) {
      console.error('签到失败:', e)
    }
  }, [classInfo, students])

  const toggleMock = useCallback(async () => {
    try {
      const url = mockRunning ? '/api/mock/stop' : '/api/mock/start'
      const res = await fetch(url, { method: 'POST' }).then(r => r.json())
      if (res.code === 200) {
        setMockRunning(res.data?.running || !mockRunning)
      }
    } catch (e) {
      console.error('切换模拟数据失败:', e)
    }
  }, [mockRunning])

  const resetTeams = useCallback(async () => {
    if (!confirm('确定要重新随机分组吗？将重置所有爆卡警告。')) return
    try {
      const res = await fetch('/api/heartrate/reset-teams', { method: 'POST' }).then(r => r.json())
      if (res.code === 200) {
        fetchInitialData()
      }
    } catch (e) {
      console.error('重置分组失败:', e)
    }
  }, [fetchInitialData])

  const heartRateMap = useMemo(() => {
    const map = new Map()
    for (const d of heartRateData) {
      map.set(d.braceletId, d)
    }
    return map
  }, [heartRateData])

  const getTeamForStudent = useCallback((braceletId, index) => {
    if (heartRateMap.get(braceletId)?.team) {
      return heartRateMap.get(braceletId).team
    }
    if (teamAssignment[braceletId]) {
      return teamAssignment[braceletId]
    }
    return index % 2 === 0 ? 'RED' : 'BLUE'
  }, [heartRateMap, teamAssignment])

  const mergedData = useMemo(() => {
    const result = new Array(TOTAL_STUDENTS)

    for (let i = 0; i < TOTAL_STUDENTS; i++) {
      const stu = students[i]
      if (stu) {
        const rt = heartRateMap.get(stu.braceletId)
        if (rt) {
          result[i] = rt
        } else {
          result[i] = {
            ...stu,
            ...EMPTY_TEMPLATE,
            team: getTeamForStudent(stu.braceletId, i),
            dangerWarning: false,
            dangerSeconds: 0
          }
        }
      } else {
        result[i] = {
          name: `学员${i + 1}`,
          braceletId: `EMPTY${i}`,
          ...EMPTY_TEMPLATE,
          team: i % 2 === 0 ? 'RED' : 'BLUE',
          dangerWarning: false,
          dangerSeconds: 0
        }
      }
    }
    return result
  }, [students, heartRateMap, getTeamForStudent])

  const teamStats = useMemo(() => {
    let redCal = 0, blueCal = 0, redCnt = 0, blueCnt = 0, redDanger = 0, blueDanger = 0
    for (const d of heartRateData) {
      const cal = Number(d.totalCalories) || 0
      if (d.team === 'RED' || (!d.team && heartRateMap.get(d.braceletId)?.team === 'RED')) {
        redCal += cal
        redCnt++
        if (d.dangerWarning) redDanger++
      } else {
        blueCal += cal
        blueCnt++
        if (d.dangerWarning) blueDanger++
      }
    }
    return {
      redCalories: redCal,
      blueCalories: blueCal,
      redCount: redCnt,
      blueCount: blueCnt,
      redDanger,
      blueDanger
    }
  }, [heartRateData, heartRateMap])

  const stats = useMemo(() => {
    let count = 0
    let totalCal = 0
    let hrSum = 0

    for (const d of heartRateData) {
      if (d.heartRate > 0) {
        count++
        totalCal += Number(d.totalCalories) || 0
        hrSum += d.avgHeartRate || d.heartRate || 0
      }
    }

    return {
      connected: count,
      totalCalories: totalCal,
      avgHeartRate: count > 0 ? Math.round(hrSum / count) : 0
    }
  }, [heartRateData])

  const intensityStats = useMemo(() => {
    let low = 0, fatburn = 0, extreme = 0
    for (const d of heartRateData) {
      if (d.heartRate > 0) {
        if (d.intensity === 1) low++
        else if (d.intensity === 2) fatburn++
        else if (d.intensity === 3) extreme++
      }
    }
    return { low, fatburn, extreme }
  }, [heartRateData])

  const intensityBars = useMemo(() => [
    { label: '低强度', count: intensityStats.low, color: 'from-blue-500 to-blue-600', textColor: 'text-blue-400' },
    { label: '燃脂区', count: intensityStats.fatburn, color: 'from-emerald-500 to-green-600', textColor: 'text-emerald-400' },
    { label: '极限区', count: intensityStats.extreme, color: 'from-red-500 to-red-600', textColor: 'text-red-400' },
  ], [intensityStats])

  const dangerCount = useMemo(() => {
    return heartRateData.filter(d => d.dangerWarning).length
  }, [heartRateData])

  return (
    <div className="min-h-screen bg-gym-dark">
      <Header
        classInfo={classInfo}
        connectedCount={stats.connected}
        totalCalories={stats.totalCalories}
        avgHeartRate={stats.avgHeartRate}
      />

      {dangerCount > 0 && (
        <div className="bg-gradient-to-r from-red-900/90 via-red-700/90 to-red-900/90 px-8 py-3 flex items-center justify-center gap-4 border-y-2 border-yellow-400">
          <span className="text-4xl animate-bounce">🚨</span>
          <span className="text-yellow-300 font-black text-2xl animate-pulse">
            ⚠️ 爆卡警告：{dangerCount} 名学员心率超过极限，请教练立即关注！
          </span>
          <span className="text-4xl animate-bounce">🚨</span>
        </div>
      )}

      <div className="px-8 py-4 bg-gym-darker/50">
        <TeamPKBar
          redCalories={teamStats.redCalories}
          blueCalories={teamStats.blueCalories}
          redCount={teamStats.redCount}
          blueCount={teamStats.blueCount}
          redDanger={teamStats.redDanger}
          blueDanger={teamStats.blueDanger}
        />
      </div>

      <div className="px-8 py-3 border-b border-gray-700/30 flex items-center justify-between bg-gym-darker/30">
        <Legend />
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
            {isConnected ? '实时连接中' : '连接断开'}
          </div>
          <button
            onClick={resetTeams}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/30"
          >
            🎲 重新分组
          </button>
          <button
            onClick={autoCheckin}
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/30"
          >
            一键全部签到
          </button>
          <button
            onClick={toggleMock}
            className={`px-5 py-2 text-sm font-bold rounded-xl transition-all shadow-lg ${mockRunning
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/30 hover:opacity-90'
              : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/30 hover:opacity-90'
            }`}
          >
            {mockRunning ? '停止模拟手环' : '启动模拟手环'}
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-4 gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {mergedData.map((student, index) => (
            <HeartRateCard
              key={student.braceletId}
              student={student}
              index={index}
            />
          ))}
        </div>
      </div>

      <div className="px-8 pb-6">
        <div className="bg-gym-card/50 rounded-2xl p-5 border border-gray-700/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">运动强度分布统计</h2>
            <span className="text-xs text-gray-400">实时数据</span>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {intensityBars.map((item) => (
              <div key={item.label} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${item.textColor}`}>{item.label}</span>
                  <span className="text-xl font-black text-white">{item.count} <span className="text-xs text-gray-500 font-normal">人</span></span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${stats.connected > 0 ? (item.count / stats.connected * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
