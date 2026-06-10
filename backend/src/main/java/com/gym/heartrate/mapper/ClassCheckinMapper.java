package com.gym.heartrate.mapper;

import com.gym.heartrate.entity.ClassCheckin;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ClassCheckinMapper {
    ClassCheckin selectById(@Param("id") Long id);
    ClassCheckin selectByClassAndStudent(@Param("classId") Long classId, @Param("studentId") Long studentId);
    ClassCheckin selectByBraceletAndStatus(@Param("braceletId") String braceletId, @Param("status") Integer status);
    List<ClassCheckin> selectByClassId(@Param("classId") Long classId);
    List<ClassCheckin> selectByStudentId(@Param("studentId") Long studentId);
    int insert(ClassCheckin checkin);
    int update(ClassCheckin checkin);
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
}
