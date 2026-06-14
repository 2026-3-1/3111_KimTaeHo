package rlaxogh76.DevClass.global.scheduler;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import rlaxogh76.DevClass.global.notification.DiscordService;
import rlaxogh76.DevClass.global.notification.EmailService;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;

/**
 * 배치/스케줄러 통합 테스트.
 * 외부 알림 서비스는 MockitoBean으로 대체하고,
 * JobLog가 정상적으로 저장되는지 검증한다.
 */
@SpringBootTest
@ActiveProfiles("test")
class SchedulerIntegrationTest {

    @Autowired private SchedulerService schedulerService;
    @Autowired private JobLogRepository jobLogRepository;

    @MockitoBean private EmailService emailService;
    @MockitoBean private DiscordService discordService;

    @AfterEach
    void cleanup() {
        jobLogRepository.deleteAll();
    }

    @Test
    @DisplayName("진행률 리마인더 실행 시 JobLog가 SUCCESS 상태로 저장된다")
    void sendProgressReminders_createsSuccessJobLog() {
        // when: 스케줄러 직접 호출 (대상 없어도 성공 처리)
        schedulerService.sendProgressReminders();

        // then: PROGRESS_REMINDER JobLog 가 SUCCESS 로 기록됨
        List<JobLog> logs = jobLogRepository.findTop10ByJobNameOrderByStartedAtDesc("PROGRESS_REMINDER");
        assertThat(logs).isNotEmpty();

        JobLog latest = logs.get(0);
        assertThat(latest.getStatus()).isEqualTo(JobLog.JobStatus.SUCCESS);
        assertThat(latest.getStartedAt()).isNotNull();
        assertThat(latest.getCompletedAt()).isNotNull();
        assertThat(latest.getCompletedAt()).isAfterOrEqualTo(latest.getStartedAt());
    }

    @Test
    @DisplayName("주간 통계 실행 시 JobLog가 SUCCESS 상태로 저장되고 Discord 알림이 전송된다")
    void sendWeeklyStats_createsSuccessJobLogAndSendsDiscordAlert() {
        // when
        schedulerService.sendWeeklyStats();

        // then: WEEKLY_STATS JobLog 가 SUCCESS 로 기록됨
        List<JobLog> logs = jobLogRepository.findTop10ByJobNameOrderByStartedAtDesc("WEEKLY_STATS");
        assertThat(logs).isNotEmpty();

        JobLog latest = logs.get(0);
        assertThat(latest.getStatus()).isEqualTo(JobLog.JobStatus.SUCCESS);
        assertThat(latest.getCompletedAt()).isNotNull();

        // then: Discord 알림이 정확히 1회 전송됨
        verify(discordService).sendWeeklyStatsAlert(anyString());
    }

    @Test
    @DisplayName("두 작업이 연속 실행되면 각각 독립적인 JobLog가 저장된다")
    void multipleJobs_eachHaveIndependentJobLog() {
        // when
        schedulerService.sendProgressReminders();
        schedulerService.sendWeeklyStats();

        // then: 두 종류의 JobLog 가 모두 존재해야 함
        List<JobLog> reminderLogs = jobLogRepository.findTop10ByJobNameOrderByStartedAtDesc("PROGRESS_REMINDER");
        List<JobLog> statsLogs = jobLogRepository.findTop10ByJobNameOrderByStartedAtDesc("WEEKLY_STATS");

        assertThat(reminderLogs).hasSize(1);
        assertThat(statsLogs).hasSize(1);
        assertThat(reminderLogs.get(0).getStatus()).isEqualTo(JobLog.JobStatus.SUCCESS);
        assertThat(statsLogs.get(0).getStatus()).isEqualTo(JobLog.JobStatus.SUCCESS);
    }
}
