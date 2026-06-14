package rlaxogh76.DevClass.global.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class AuditLogAspect {

    // 결제 관련 메서드
    @Before("execution(* rlaxogh76.DevClass.domain.payment.service.PaymentService.confirmPayment(..))")
    public void beforePaymentConfirm(JoinPoint jp) {
        log.info("[AUDIT] 결제 확인 요청 | user={} | args={}", currentUser(), jp.getArgs()[0]);
    }

    @AfterReturning(
            pointcut = "execution(* rlaxogh76.DevClass.domain.payment.service.PaymentService.confirmPayment(..))",
            returning = "result")
    public void afterPaymentConfirm(Object result) {
        log.info("[AUDIT] 결제 확인 성공 | user={} | result={}", currentUser(), result);
    }

    @AfterThrowing(
            pointcut = "execution(* rlaxogh76.DevClass.domain.payment.service.PaymentService.*(..))",
            throwing = "ex")
    public void afterPaymentException(JoinPoint jp, Exception ex) {
        log.warn("[AUDIT] 결제 실패 | user={} | method={} | error={}",
                currentUser(), jp.getSignature().getName(), ex.getMessage());
    }

    // 강좌 생성/삭제
    @AfterReturning(
            pointcut = "execution(* rlaxogh76.DevClass.domain.teacher.service.TeacherCourseService.createCourse(..))",
            returning = "result")
    public void afterCourseCreate(Object result) {
        log.info("[AUDIT] 강좌 등록 | user={} | result={}", currentUser(), result);
    }

    @Before("execution(* rlaxogh76.DevClass.domain.teacher.service.TeacherCourseService.deleteCourse(..))")
    public void beforeCourseDelete(JoinPoint jp) {
        log.warn("[AUDIT] 강좌 삭제 요청 | user={} | courseId={}", currentUser(), jp.getArgs()[0]);
    }

    // 수강 등록/취소
    @AfterReturning(
            pointcut = "execution(* rlaxogh76.DevClass.domain.enrollment.service.EnrollmentService.enroll(..))",
            returning = "result")
    public void afterEnroll(Object result) {
        log.info("[AUDIT] 수강 등록 | user={} | result={}", currentUser(), result);
    }

    @Before("execution(* rlaxogh76.DevClass.domain.enrollment.service.EnrollmentService.cancel(..))")
    public void beforeEnrollCancel(JoinPoint jp) {
        log.info("[AUDIT] 수강 취소 요청 | user={} | enrollmentId={}", currentUser(), jp.getArgs()[1]);
    }

    private String currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : "anonymous";
    }
}
