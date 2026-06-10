package com.gym.heartrate.service;

import com.gym.heartrate.entity.ClassCheckin;
import com.gym.heartrate.entity.ClassSchedule;
import com.gym.heartrate.entity.Student;
import com.gym.heartrate.mapper.ClassCheckinMapper;
import com.gym.heartrate.mapper.ClassScheduleMapper;
import com.gym.heartrate.mapper.StudentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassScheduleMapper classScheduleMapper;
    private final ClassCheckinMapper classCheckinMapper;
    private final StudentMapper studentMapper;
    private final HeartRateService heartRateService;

    public List<ClassSchedule> getAllClasses() {
        return classScheduleMapper.selectByStatus(1);
    }

    public ClassSchedule getCurrentClass(String roomId) {
        return classScheduleMapper.selectCurrentClass(roomId);
    }

    public ClassSchedule getClassById(Long id) {
        return classScheduleMapper.selectById(id);
    }

    @Transactional
    public ClassSchedule createClass(ClassSchedule classSchedule) {
        classSchedule.setStatus(1);
        classScheduleMapper.insert(classSchedule);
        return classSchedule;
    }

    @Transactional
    public ClassCheckin checkin(Long classId, Long studentId) {
        ClassSchedule classSchedule = classScheduleMapper.selectById(classId);
        if (classSchedule == null) {
            throw new RuntimeException("课程不存在");
        }

        Student student = studentMapper.selectById(studentId);
        if (student == null) {
            throw new RuntimeException("学员不存在");
        }

        ClassCheckin existing = classCheckinMapper.selectByClassAndStudent(classId, studentId);
        if (existing != null && existing.getStatus() == 1) {
            return existing;
        }

        ClassCheckin checkin = new ClassCheckin();
        checkin.setClassId(classId);
        checkin.setStudentId(studentId);
        checkin.setBraceletId(student.getBraceletId());
        checkin.setCheckinTime(LocalDateTime.now());
        checkin.setTotalCalories(BigDecimal.ZERO);
        checkin.setAvgHeartRate(0);
        checkin.setMaxHeartRate(0);
        checkin.setDuration(0);
        checkin.setStatus(1);
        classCheckinMapper.insert(checkin);

        return checkin;
    }

    @Transactional
    public ClassCheckin checkinByBracelet(Long classId, String braceletId) {
        Student student = studentMapper.selectByBraceletId(braceletId);
        if (student == null) {
            throw new RuntimeException("手环未绑定学员");
        }
        return checkin(classId, student.getId());
    }

    @Transactional
    public ClassCheckin checkout(Long checkinId) {
        ClassCheckin checkin = classCheckinMapper.selectById(checkinId);
        if (checkin == null) {
            throw new RuntimeException("签到记录不存在");
        }
        checkin.setCheckoutTime(LocalDateTime.now());
        checkin.setStatus(2);
        classCheckinMapper.update(checkin);

        heartRateService.clearRealtimeData(checkin.getBraceletId());

        return checkin;
    }

    public List<ClassCheckin> getClassCheckins(Long classId) {
        return classCheckinMapper.selectByClassId(classId);
    }

    public List<Student> getAllStudents() {
        return studentMapper.selectAll();
    }

    public Student getStudentByBracelet(String braceletId) {
        return studentMapper.selectByBraceletId(braceletId);
    }
}
