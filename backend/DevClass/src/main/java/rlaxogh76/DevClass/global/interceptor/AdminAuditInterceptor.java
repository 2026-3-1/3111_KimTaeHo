package rlaxogh76.DevClass.global.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import rlaxogh76.DevClass.domain.admin.entity.AdminAuditLog;
import rlaxogh76.DevClass.domain.admin.repository.AdminAuditLogRepository;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminAuditInterceptor implements HandlerInterceptor {

    private final AdminAuditLogRepository auditLogRepository;

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = (authentication != null && authentication.isAuthenticated())
                ? authentication.getName()
                : "anonymous";

        AdminAuditLog auditLog = AdminAuditLog.builder()
                .email(email)
                .ip(getClientIp(request))
                .method(request.getMethod())
                .uri(request.getRequestURI())
                .status(response.getStatus())
                .build();

        try {
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("[AuditLog] 감사 로그 저장 실패: {}", e.getMessage());
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
