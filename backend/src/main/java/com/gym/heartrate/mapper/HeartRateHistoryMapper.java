package com.gym.heartrate.mapper;

import com.gym.heartrate.entity.HeartRateHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface HeartRateHistoryMapper {
    int insert(HeartRateHistory history);
    int batchInsert(@Param("list") List<HeartRateHistory> list);
    List<HeartRateHistory> selectByClassId(@Param("classId") Long classId);
    List<HeartRateHistory> selectByStudentIdAndClassId(@Param("studentId") Long studentId, @Param("classId") Long classId);
    HeartRateHistory selectLatestByBraceletId(@Param("braceletId") String braceletId);
}
