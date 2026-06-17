package rlaxogh76.DevClass.global.notification;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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
        String html = """
                <div style="font-family:'Apple SD Gothic Neo',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;">
                  <div style="background:#f97316;padding:32px 40px;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">DevClass</h1>
                  </div>
                  <div style="padding:40px;">
                    <h2 style="color:#111827;font-size:20px;font-weight:700;margin:0 0 8px;">결제가 완료되었습니다 ✓</h2>
                    <p style="color:#6b7280;font-size:14px;margin:0 0 32px;">%s님, 수강 신청해 주셔서 감사합니다.</p>
                    <div style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:32px;">
                      <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                        <span style="color:#6b7280;font-size:13px;">주문 강좌</span>
                        <span style="color:#111827;font-size:13px;font-weight:600;">%s</span>
                      </div>
                      <div style="border-top:1px solid #e5e7eb;padding-top:12px;display:flex;justify-content:space-between;">
                        <span style="color:#111827;font-size:14px;font-weight:700;">결제 금액</span>
                        <span style="color:#f97316;font-size:18px;font-weight:800;">%,d원</span>
                      </div>
                    </div>
                    <a href="https://devclass.com" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:700;">지금 학습 시작하기 →</a>
                  </div>
                  <div style="padding:24px 40px;border-top:1px solid #f3f4f6;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">DevClass | 문의: support@devclass.com</p>
                  </div>
                </div>
                """.formatted(userName, orderName, amount);
        sendHtml(to, subject, html);
    }

    @Async
    public void sendCourseCreatedNotification(String to, String teacherName, String courseTitle) {
        String subject = "[DevClass] 강좌가 등록되었습니다";
        String html = """
                <div style="font-family:'Apple SD Gothic Neo',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;">
                  <div style="background:#f97316;padding:32px 40px;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">DevClass</h1>
                  </div>
                  <div style="padding:40px;">
                    <h2 style="color:#111827;font-size:20px;font-weight:700;margin:0 0 8px;">강좌 등록이 완료되었습니다 🎉</h2>
                    <p style="color:#6b7280;font-size:14px;margin:0 0 32px;">%s 선생님, 새로운 강좌를 등록해 주셔서 감사합니다!</p>
                    <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:32px;">
                      <p style="color:#9a3412;font-size:12px;margin:0 0 4px;font-weight:600;">등록된 강좌</p>
                      <p style="color:#111827;font-size:16px;font-weight:700;margin:0;">%s</p>
                    </div>
                    <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">강의 영상을 추가하고 강좌를 발행하면 수강생들이 등록할 수 있습니다.</p>
                    <a href="https://devclass.com/teacher" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:700;">대시보드로 이동 →</a>
                  </div>
                  <div style="padding:24px 40px;border-top:1px solid #f3f4f6;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">DevClass | 문의: support@devclass.com</p>
                  </div>
                </div>
                """.formatted(teacherName, courseTitle);
        sendHtml(to, subject, html);
    }

    public void sendVerificationCode(String to, String code) {
        String subject = "[DevClass] 이메일 인증 코드";
        String html = """
                <div style="font-family:'Apple SD Gothic Neo',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;">
                  <div style="background:#f97316;padding:32px 40px;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">DevClass</h1>
                  </div>
                  <div style="padding:40px;text-align:center;">
                    <h2 style="color:#111827;font-size:20px;font-weight:700;margin:0 0 8px;">이메일 인증 코드</h2>
                    <p style="color:#6b7280;font-size:14px;margin:0 0 32px;">아래 코드를 입력하여 이메일을 인증해 주세요.</p>
                    <div style="background:#f9fafb;border:2px dashed #e5e7eb;border-radius:16px;padding:32px;margin-bottom:24px;">
                      <p style="color:#f97316;font-size:40px;font-weight:800;letter-spacing:12px;margin:0;font-family:monospace;">%s</p>
                    </div>
                    <p style="color:#6b7280;font-size:13px;margin:0;"><strong>5분 후 만료됩니다.</strong> 본인이 요청하지 않았다면 이 메일을 무시하세요.</p>
                  </div>
                  <div style="padding:24px 40px;border-top:1px solid #f3f4f6;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">DevClass | 문의: support@devclass.com</p>
                  </div>
                </div>
                """.formatted(code);
        // 인증 코드는 발송 실패 시 호출자에게 예외를 전파해야 사용자에게 오류를 알릴 수 있음
        notificationRetryTemplate.execute(ctx -> {
            if (ctx.getRetryCount() > 0) {
                log.warn("[Email] 인증 코드 재시도 #{} to={}", ctx.getRetryCount(), to);
            }
            sendHtmlDirect(to, subject, html);
            log.info("[Email] 인증 코드 발송 성공 to={}", to);
            return null;
        });
    }

    @Async
    public void sendProgressReminder(String to, String userName, String courseTitle, int progress) {
        String subject = "[DevClass] 강좌 학습을 계속해보세요!";
        String html = """
                <div style="font-family:'Apple SD Gothic Neo',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;">
                  <div style="background:#f97316;padding:32px 40px;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">DevClass</h1>
                  </div>
                  <div style="padding:40px;">
                    <h2 style="color:#111827;font-size:20px;font-weight:700;margin:0 0 8px;">학습을 이어가 보세요! 📚</h2>
                    <p style="color:#6b7280;font-size:14px;margin:0 0 32px;">%s님, 아직 완료하지 못한 강좌가 있어요.</p>
                    <div style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:32px;">
                      <p style="color:#6b7280;font-size:12px;margin:0 0 4px;">수강 중인 강좌</p>
                      <p style="color:#111827;font-size:15px;font-weight:700;margin:0 0 16px;">%s</p>
                      <div style="background:#e5e7eb;border-radius:999px;height:8px;overflow:hidden;">
                        <div style="background:#f97316;height:100%%;width:%d%%;border-radius:999px;"></div>
                      </div>
                      <p style="color:#f97316;font-size:13px;font-weight:700;margin:8px 0 0;text-align:right;">%d%% 완료</p>
                    </div>
                    <a href="https://devclass.com/my" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:700;">이어서 학습하기 →</a>
                  </div>
                  <div style="padding:24px 40px;border-top:1px solid #f3f4f6;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">DevClass | 문의: support@devclass.com</p>
                  </div>
                </div>
                """.formatted(userName, courseTitle, progress, progress);
        sendHtml(to, subject, html);
    }

    @Async
    public void sendCourseDeletedRefundNotification(String to, String userName, String courseTitle, long refundAmount) {
        String subject = "[DevClass] 강좌 폐강 및 환불 안내";
        String html = """
                <div style="font-family:'Apple SD Gothic Neo',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;">
                  <div style="background:#6b7280;padding:32px 40px;">
                    <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">DevClass</h1>
                  </div>
                  <div style="padding:40px;">
                    <h2 style="color:#111827;font-size:20px;font-weight:700;margin:0 0 8px;">강좌 폐강 및 환불 안내</h2>
                    <p style="color:#6b7280;font-size:14px;margin:0 0 32px;">%s님, 수강 중이시던 강좌에 대한 중요 안내입니다.</p>
                    <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
                      <p style="color:#7f1d1d;font-size:12px;margin:0 0 4px;font-weight:600;">폐강된 강좌</p>
                      <p style="color:#111827;font-size:15px;font-weight:700;margin:0;">%s</p>
                    </div>
                    <p style="color:#374151;font-size:14px;margin:0 0 24px;">위 강좌가 강사에 의해 폐강되었습니다. 결제하신 금액을 전액 환불해 드립니다.</p>
                    <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:32px;">
                      <div style="display:flex;justify-content:space-between;">
                        <span style="color:#111827;font-size:14px;font-weight:700;">환불 금액</span>
                        <span style="color:#059669;font-size:18px;font-weight:800;">%,d원</span>
                      </div>
                    </div>
                    <p style="color:#6b7280;font-size:13px;margin:0;">환불은 결제 수단에 따라 영업일 기준 3~5일 내로 처리됩니다. 불편을 드려 진심으로 사과드립니다.</p>
                  </div>
                  <div style="padding:24px 40px;border-top:1px solid #f3f4f6;">
                    <p style="color:#9ca3af;font-size:12px;margin:0;">DevClass | 문의: support@devclass.com</p>
                  </div>
                </div>
                """.formatted(userName, courseTitle, refundAmount);
        sendHtml(to, subject, html);
    }

    public void sendCustom(String to, String subject, String htmlContent) {
        sendHtml(to, subject, htmlContent);
    }

    private void sendHtml(String to, String subject, String html) {
        try {
            notificationRetryTemplate.execute(ctx -> {
                if (ctx.getRetryCount() > 0) {
                    log.warn("[Email] 재시도 #{} to={}", ctx.getRetryCount(), to);
                }
                sendHtmlDirect(to, subject, html);
                log.info("[Email] 발송 성공 to={} subject={}", to, subject);
                return null;
            });
        } catch (Exception e) {
            log.error("[Email] 최종 발송 실패 (재시도 소진) to={} subject={} error={}", to, subject, e.getMessage());
        }
    }

    private void sendHtmlDirect(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("이메일 생성 실패", e);
        }
    }
}
