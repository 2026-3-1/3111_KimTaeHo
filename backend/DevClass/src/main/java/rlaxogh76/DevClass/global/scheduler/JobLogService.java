package rlaxogh76.DevClass.global.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobLogService {

    private final JobLogRepository jobLogRepository;

    /** 새 작업 시작 RUNNING 상태로 기록. 별도 트랜잭션으로 즉시 커밋. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public JobLog start(String jobName) {
        JobLog jobLog = JobLog.builder()
                .jobName(jobName)
                .status(JobLog.JobStatus.RUNNING)
                .startedAt(LocalDateTime.now())
                .build();
        JobLog saved = jobLogRepository.save(jobLog);
        log.info("[JobLog] 작업 시작 jobName={} id={}", jobName, saved.getId());
        return saved;
    }

    /** 작업 성공 완료 기록. 별도 트랜잭션으로 즉시 커밋. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void success(Long jobLogId, int processedCount) {
        jobLogRepository.findById(jobLogId).ifPresent(jobLog -> jobLog.complete(processedCount));
        log.info("[JobLog] 작업 완료 id={} processedCount={}", jobLogId, processedCount);
    }

    /** 작업 실패 기록. 별도 트랜잭션으로 즉시 커밋. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void fail(Long jobLogId, String errorMessage) {
        jobLogRepository.findById(jobLogId).ifPresent(jobLog -> jobLog.fail(errorMessage));
        log.warn("[JobLog] 작업 실패 id={} error={}", jobLogId, errorMessage);
    }
}
