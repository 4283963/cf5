CREATE DATABASE IF NOT EXISTS smart_gym DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE smart_gym;

DROP TABLE IF EXISTS heart_rate_history;
DROP TABLE IF EXISTS class_checkin;
DROP TABLE IF EXISTS class_schedule;
DROP TABLE IF EXISTS student;

CREATE TABLE student (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '学员ID',
    name VARCHAR(50) NOT NULL COMMENT '学员姓名',
    gender TINYINT DEFAULT 0 COMMENT '性别: 0未知 1男 2女',
    age INT DEFAULT 25 COMMENT '年龄',
    weight DECIMAL(5,2) DEFAULT 60.00 COMMENT '体重(kg)',
    height INT DEFAULT 170 COMMENT '身高(cm)',
    bracelet_id VARCHAR(50) UNIQUE NOT NULL COMMENT '手环设备ID',
    phone VARCHAR(20) COMMENT '手机号',
    membership_level VARCHAR(20) DEFAULT '普通' COMMENT '会员等级',
    status TINYINT DEFAULT 1 COMMENT '状态: 0禁用 1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bracelet (bracelet_id),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学员信息表';

CREATE TABLE class_schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '课程ID',
    class_name VARCHAR(100) NOT NULL COMMENT '课程名称',
    coach_name VARCHAR(50) COMMENT '教练姓名',
    class_type VARCHAR(50) COMMENT '课程类型: 瑜伽/动感单车/搏击操等',
    room_id VARCHAR(20) NOT NULL COMMENT '操房ID',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    capacity INT DEFAULT 20 COMMENT '容纳人数',
    status TINYINT DEFAULT 1 COMMENT '状态: 0取消 1待开始 2进行中 3已结束',
    description TEXT COMMENT '课程描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_room_time (room_id, start_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程课表';

CREATE TABLE class_checkin (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '签到ID',
    class_id BIGINT NOT NULL COMMENT '课程ID',
    student_id BIGINT NOT NULL COMMENT '学员ID',
    bracelet_id VARCHAR(50) NOT NULL COMMENT '手环ID',
    checkin_time DATETIME COMMENT '签到时间',
    checkout_time DATETIME COMMENT '签退时间',
    total_calories DECIMAL(10,2) DEFAULT 0.00 COMMENT '总消耗卡路里',
    avg_heart_rate INT DEFAULT 0 COMMENT '平均心率',
    max_heart_rate INT DEFAULT 0 COMMENT '最高心率',
    duration INT DEFAULT 0 COMMENT '运动时长(分钟)',
    status TINYINT DEFAULT 0 COMMENT '状态: 0未开始 1上课中 2已完成',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_class_student (class_id, student_id),
    INDEX idx_class_id (class_id),
    INDEX idx_student_id (student_id),
    INDEX idx_bracelet (bracelet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程签到表';

CREATE TABLE heart_rate_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    class_id BIGINT NOT NULL COMMENT '课程ID',
    checkin_id BIGINT NOT NULL COMMENT '签到ID',
    student_id BIGINT NOT NULL COMMENT '学员ID',
    bracelet_id VARCHAR(50) NOT NULL COMMENT '手环ID',
    heart_rate INT NOT NULL COMMENT '心率(bpm)',
    calories DECIMAL(8,2) DEFAULT 0.00 COMMENT '本次累计卡路里',
    intensity TINYINT COMMENT '运动强度: 1低(蓝) 2燃脂(绿) 3极限(红)',
    record_time DATETIME NOT NULL COMMENT '记录时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_class_time (class_id, record_time),
    INDEX idx_student_time (student_id, record_time),
    INDEX idx_bracelet_time (bracelet_id, record_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='心率历史数据表';

INSERT INTO student (name, gender, age, weight, height, bracelet_id, phone, membership_level) VALUES
('张伟', 1, 28, 75.5, 180, 'BR001', '13800000001', '钻石'),
('李娜', 2, 25, 55.0, 165, 'BR002', '13800000002', '白金'),
('王强', 1, 32, 80.0, 178, 'BR003', '13800000003', '黄金'),
('刘洋', 1, 27, 70.0, 175, 'BR004', '13800000004', '普通'),
('陈静', 2, 30, 60.0, 168, 'BR005', '13800000005', '钻石'),
('杨帆', 1, 24, 68.0, 172, 'BR006', '13800000006', '白金'),
('赵敏', 2, 26, 52.0, 160, 'BR007', '13800000007', '黄金'),
('黄磊', 1, 35, 85.0, 182, 'BR008', '13800000008', '普通'),
('周婷', 2, 29, 58.0, 163, 'BR009', '13800000009', '钻石'),
('吴刚', 1, 31, 78.0, 176, 'BR010', '13800000010', '白金'),
('郑丽', 2, 23, 50.0, 158, 'BR011', '13800000011', '黄金'),
('孙浩', 1, 28, 72.0, 179, 'BR012', '13800000012', '普通'),
('马丽', 2, 27, 56.0, 167, 'BR013', '13800000013', '钻石'),
('朱伟', 1, 33, 82.0, 181, 'BR014', '13800000014', '白金'),
('胡雪', 2, 25, 54.0, 162, 'BR015', '13800000015', '黄金'),
('林峰', 1, 29, 76.0, 177, 'BR016', '13800000016', '普通'),
('何芳', 2, 31, 62.0, 169, 'BR017', '13800000017', '钻石'),
('高鹏', 1, 26, 69.0, 174, 'BR018', '13800000018', '白金'),
('罗敏', 2, 28, 57.0, 164, 'BR019', '13800000019', '黄金'),
('谢军', 1, 30, 74.0, 177, 'BR020', '13800000020', '普通');

INSERT INTO class_schedule (class_name, coach_name, class_type, room_id, start_time, end_time, capacity, status, description) VALUES
('动感单车燃脂课', '王教练', '动感单车', 'ROOM-A01', NOW(), DATE_ADD(NOW(), INTERVAL 45 MINUTE), 20, 2, '高强度间歇有氧训练，快速燃脂塑形'),
('搏击操', '李教练', '搏击操', 'ROOM-A01', DATE_ADD(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 105 MINUTE), 20, 1, '释放压力，全身燃脂');
