package rlaxogh76.DevClass.global.scheduler;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobLogRepository extends JpaRepository<JobLog, Long> {

    List<JobLog> findTop10ByJobNameOrderByStartedAtDesc(String jobName);
}
