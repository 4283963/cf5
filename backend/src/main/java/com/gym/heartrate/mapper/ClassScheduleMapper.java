package com.gym.heartrate.mapper;

import com.gym.heartrate.entity.ClassSchedule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ClassScheduleMapper {
    ClassSchedule selectById(@Param("id") Long id);
    List<ClassSchedule> selectByRoomId(@Param("roomId") String roomId);
    List<ClassSchedule> selectByStatus(@Param("status") Integer status);
    ClassSchedule selectCurrentClass(@Param("roomId") String roomId);
    int insert(ClassSchedule classSchedule);
    int update(ClassSchedule classSchedule);
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
    int deleteById(@Param("id") Long id);
}
