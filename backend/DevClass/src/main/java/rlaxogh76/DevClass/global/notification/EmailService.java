package rlaxogh76.DevClass.global.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final RetryTemplate notificationRetryTemplate;

    @Async
    public void sendPaymentReceipt(String to, String userName, String orderName, long amount) {
        String subject = "[DevClass] 결제가 완료되었습니다";
        String text = String.format(
                "%s님, 안녕하세요!\n\n" +
                "결제가 정상적으로 완료되었습니다.\n\n" +
                "주문 강좌: %s\n" +
                "결제 금액: %,d원\n\n" +
                "DevClass에서 학습을 시작하세요!\n" +
                "https://devclass.com",
                userName, orderName, amount
        );
        send(to, subject, text);
    }

    @Async
    public void sendCourseCreatedNotification(String to, String teacherName, String courseTitle) {
        String subject = "[DevClass] 강좌가 등록되었습니다";
        String text = String.format(
                "%s 선생님, 안녕하세요!\n\n" +
                "강좌가 성공적으로 등록되었습니다.\n\n" +
                "강좌명: %s\n\n" +
                "학생들이 수강을 시작하면 알려드리겠습니다.\n" +
                "DevClass 드림",
                teacherName, courseTitle
        );
        send(to, subject, text);
    }

    public void sendVerificationCode(String to, String code) {
        String subject = "[DevClass] 이메일 인증 코드";
        String text = String.format(
                "안녕하세요!\n\n" +
                "DevClass 이메일 인증 코드입니다.\n\n" +
                "인증 코드: %s\n\n" +
                "인증 코드는 5분 간 유효합니다.\n" +
                "본인이 요청하지 않은 경우 이 이메일을 무시해주세요.",
                code
        );
        // 인증 코드는 발송 실패 시 호출자에게 예외를 전파해야 사용자에게 오류를 알릴 수 있음
        notificationRetryTemplate.execute(ctx -> {
            if (ctx.getRetryCount() > 0) {
                log.warn("[Email] 인증 코드 재시도 #{} to={}", ctx.getRetryCount(), to);
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("[Email] 인증 코드 발송 성공 to={}", to);
            return null;
        });
    }

    @Async
    public void sendProgressReminder(String to, String userName, String courseTitle, int progress) {
        String subject = "[DevClass] 강좌 학습을 계속해보세요!";
        String text = String.format(
                "%s님, 안녕하세요!\n\n" +
                "수강 중인 강좌 '%s'의 진행률이 %d%%입니다.\n\n" +
                "지금 바로 이어서 학습을 시작해보세요!\n" +
                "https://devclass.com",
                userName, courseTitle, progress
        );
        send(to, subject, text);
    }

    private void send(String to, String subject, String text) {
        try {
            notificationRetryTemplate.execute(ctx -> {
                if (ctx.getRetryCount() > 0) {
                    log.warn("[Email] 재시도 #{} to={}", ctx.getRetryCount(), to);
                }
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(text);
                mailSender.send(message);
                log.info("[Email] 발송 성공 to={} subject={}", to, subject);
                return null;
            });
        } catch (Exception e) {
            log.error("[Email] 최종 발송 실패 (재시도 소진) to={} subject={} error={}", to, subject, e.getMessage());
        }
    }
}
