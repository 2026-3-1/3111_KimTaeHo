package rlaxogh76.DevClass.global.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiscordService {

    private final RetryTemplate notificationRetryTemplate;

    @Value("${discord.webhook-url:}")
    private String webhookUrl;

    @Async
    public void sendPaymentAlert(String userName, String orderName, long amount) {
        String content = String.format(
                "💳 **결제 완료**\n- 학생: %s\n- 강좌: %s\n- 금액: %,d원",
                userName, orderName, amount
        );
        send(content);
    }

    @Async
    public void sendCourseCreatedAlert(String teacherName, String courseTitle) {
        String content = String.format(
                "📚 **새 강좌 등록**\n- 선생님: %s\n- 강좌명: %s",
                teacherName, courseTitle
        );
        send(content);
    }

    @Async
    public void sendEnrollmentAlert(String userName, String courseTitle) {
        String content = String.format(
                "🎓 **수강 등록**\n- 학생: %s\n- 강좌: %s",
                userName, courseTitle
        );
        send(content);
    }

    @Async
    public void sendRefundAlert(String userName, long amount) {
        String content = String.format(
                "↩️ **환불 처리**\n- 학생: %s\n- 환불금액: %,d원",
                userName, amount
        );
        send(content);
    }

    @Async
    public void sendWeeklyStatsAlert(String message) {
        send(message);
    }

    private void send(String content) {
        if (webhookUrl == null || webhookUrl.isBlank()) {
            log.debug("[Discord] webhook-url 미설정, 알림 생략");
            return;
        }
        try {
            notificationRetryTemplate.execute(ctx -> {
                if (ctx.getRetryCount() > 0) {
                    log.warn("[Discord] 재시도 #{}", ctx.getRetryCount());
                }
                String body = "{\"content\": \"" + escapeJson(content) + "\"}";

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(webhookUrl))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                        .build();

                HttpResponse<String> response = HttpClient.newHttpClient()
                        .send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    log.error("[Discord] 발송 실패 status={} body={}", response.statusCode(), response.body());
                    throw new RuntimeException("Discord 응답 오류: " + response.statusCode());
                }
                log.info("[Discord] 발송 성공");
                return null;
            });
        } catch (Exception e) {
            log.error("[Discord] 최종 발송 실패 (재시도 소진)", e);
        }
    }

    private String escapeJson(String text) {
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }
}
