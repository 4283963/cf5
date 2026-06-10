package com.gym.heartrate.mapper;

import com.gym.heartrate.entity.Student;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface StudentMapper {
    Student selectById(@Param("id") Long id);
    Student selectByBraceletId(@Param("braceletId") String braceletId);
    List<Student> selectAll();
    List<Student> selectByStatus(@Param("status") Integer status);
    int insert(Student student);
    int update(Student student);
    int deleteById(@Param("id") Long id);
}
