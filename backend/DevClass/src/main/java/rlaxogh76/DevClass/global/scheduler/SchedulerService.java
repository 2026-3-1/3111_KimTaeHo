package rlaxogh76.DevClass.global.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rlaxogh76.DevClass.domain.enrollment.entity.Enrollment;
import rlaxogh76.DevClass.domain.enrollment.repository.EnrollmentRepository;
import rlaxogh76.DevClass.global.notification.DiscordService;
import rlaxogh76.DevClass.global.notification.EmailService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulerService {

    private final EnrollmentRepository enrollmentRepository;
    private final EmailService emailService;
    private final DiscordService discordService;
    private final JobLogService jobLogService;

    private static final String JOB_PROGRESS_REMINDER = "PROGRESS_REMINDER";
    private static final String JOB_WEEKLY_STATS = "WEEKLY_STATS";

    /**
     * 매일 자정 — 수강 등록 후 7일이 지났는데 진행률 30% 미만인 학생에게 리마인더
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional(readOnly = true)
    public void sendProgressReminders() {
        JobLog jobLog = jobLogService.start(JOB_PROGRESS_REMINDER);
        log.info("[Scheduler] 진행률 리마인더 발송 시작 jobId={}", jobLog.getId());

        try {
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            List<Enrollment> targets = enrollmentRepository.findLowProgressEnrollments(30, sevenDaysAgo);

            for (Enrollment e : targets) {
                String userName = e.getUser().getName();
                String userEmail = e.getUser().getEmail();
                String courseTitle = e.getCourse().getTitle();
                int progress = e.getTotalProgress();

                emailService.sendProgressReminder(userEmail, userName, courseTitle, progress);
                log.info("[Scheduler] 리마인더 발송 → {} ({}%, {})", userName, progress, courseTitle);
            }

            jobLogService.success(jobLog.getId(), targets.size());
            log.info("[Scheduler] 진행률 리마인더 완료: {}명 jobId={}", targets.size(), jobLog.getId());
        } catch (Exception e) {
            jobLogService.fail(jobLog.getId(), e.getMessage());
            log.error("[Scheduler] 진행률 리마인더 실패 jobId={}", jobLog.getId(), e);
        }
    }

    /**
     * 매주 월요일 오전 9시 — 선생님별 주간 수강 통계를 Discord로 알림
     */
    @Scheduled(cron = "0 0 9 * * MON")
    @Transactional(readOnly = true)
    public void sendWeeklyStats() {
        JobLog jobLog = jobLogService.start(JOB_WEEKLY_STATS);
        log.info("[Scheduler] 주간 통계 알림 시작 jobId={}", jobLog.getId());

        try {
            LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
            List<Enrollment> recentEnrollments = enrollmentRepository.findEnrollmentsSince(oneWeekAgo);

            Map<String, Long> countByTeacher = recentEnrollments.stream()
                    .collect(Collectors.groupingBy(
                            e -> e.getCourse().getTeacher().getName(),
                            Collectors.counting()
                    ));

            if (countByTeacher.isEmpty()) {
                discordService.sendWeeklyStatsAlert("이번 주 수강 등록이 없습니다.");
            } else {
                StringBuilder sb = new StringBuilder("📊 **이번 주 강좌별 신규 수강생**\n");
                countByTeacher.forEach((teacher, count) ->
                        sb.append(String.format("- %s 선생님: %d명\n", teacher, count)));
                discordService.sendWeeklyStatsAlert(sb.toString());
            }

            jobLogService.success(jobLog.getId(), recentEnrollments.size());
            log.info("[Scheduler] 주간 통계 알림 완료 jobId={}", jobLog.getId());
        } catch (Exception e) {
            jobLogService.fail(jobLog.getId(), e.getMessage());
            log.error("[Scheduler] 주간 통계 알림 실패 jobId={}", jobLog.getId(), e);
        }
    }
}
