import React, { useState, useEffect, useMemo } from 'react'
import Header from './components/Header'
import HeartRateCard from './components/HeartRateCard'
import Legend from './components/Legend'
import { useHeartRateWebSocket } from './hooks/useHeartRateWebSocket'

const TOTAL_STUDENTS = 20

function App() {
  const { heartRateData, isConnected } = useHeartRateWebSocket()
  const [students, setStudents] = useState([])
  const [classInfo, setClassInfo] = useState(null)
  const [mockRunning, setMockRunning] = useState(false)

  const fetchInitialData = async () => {
    try {
      const [studentsRes, classRes, mockRes] = await Promise.all([
        fetch('/api/student/list').then(r => r.json()),
        fetch('/api/class/current?roomId=ROOM-A01').then(r => r.json()),
        fetch('/api/mock/status').then(r => r.json())
      ])
      if (studentsRes.code === 200) setStudents(studentsRes.data || [])
      if (classRes.code === 200) setClassInfo(classRes.data)
      if (mockRes.code === 200) setMockRunning(mockRes.data?.running || false)
    } catch (e) {
      console.error('获取初始数据失败:', e)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  const autoCheckin = async () => {
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
  }

  const toggleMock = async () => {
    try {
      const url = mockRunning ? '/api/mock/stop' : '/api/mock/start'
      const res = await fetch(url, { method: 'POST' }).then(r => r.json())
      if (res.code === 200) {
        setMockRunning(res.data?.running || !mockRunning)
      }
    } catch (e) {
      console.error('切换模拟数据失败:', e)
    }
  }

  const mergedData = useMemo(() => {
    const result = new Array(TOTAL_STUDENTS).fill(null)
    const dataMap = new Map()
    heartRateData.forEach(d => dataMap.set(d.braceletId, d))

    students.forEach((stu, idx) => {
      if (idx < TOTAL_STUDENTS) {
        const rt = dataMap.get(stu.braceletId)
        result[idx] = rt || { ...stu, heartRate: 0, intensity: 0 }
      }
    })

    for (let i = 0; i < TOTAL_STUDENTS; i++) {
      if (!result[i]) {
        result[i] = { name: `学员${i + 1}`, braceletId: `EMPTY${i}`, heartRate: 0, intensity: 0 }
      }
    }
    return result
  }, [students, heartRateData])

  const stats = useMemo(() => {
    const active = heartRateData.filter(d => d.heartRate > 0)
    const totalCal = active.reduce((sum, d) => sum + (Number(d.totalCalories) || 0), 0)
    const avgHr = active.length > 0
      ? Math.round(active.reduce((sum, d) => sum + (d.avgHeartRate || d.heartRate || 0), 0) / active.length)
      : 0
    return { connected: active.length, totalCalories: totalCal, avgHeartRate: avgHr }
  }, [heartRateData])

  return (
    <div className="min-h-screen bg-gym-dark">
      <Header
        classInfo={classInfo}
        connectedCount={stats.connected}
        totalCalories={stats.totalCalories}
        avgHeartRate={stats.avgHeartRate}
      />

      <div className="px-8 py-4 border-b border-gray-700/30 flex items-center justify-between bg-gym-darker/50">
        <Legend />
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
            {isConnected ? '实时连接中' : '连接断开'}
          </div>
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
              key={student?.braceletId || `empty-${index}`}
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
            {[
              { label: '低强度', count: heartRateData.filter(d => d.intensity === 1).length, color: 'from-blue-500 to-blue-600', textColor: 'text-blue-400' },
              { label: '燃脂区', count: heartRateData.filter(d => d.intensity === 2).length, color: 'from-emerald-500 to-green-600', textColor: 'text-emerald-400' },
              { label: '极限区', count: heartRateData.filter(d => d.intensity === 3).length, color: 'from-red-500 to-red-600', textColor: 'text-red-400' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${item.textColor}`}>{item.label}</span>
                  <span className="text-xl font-black text-white">{item.count} <span className="text-xs text-gray-500 font-normal">人</span></span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-700`}
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
