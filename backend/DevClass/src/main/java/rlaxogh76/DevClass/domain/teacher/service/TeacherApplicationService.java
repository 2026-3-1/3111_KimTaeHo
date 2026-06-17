package rlaxogh76.DevClass.domain.teacher.service;

import rlaxogh76.DevClass.domain.teacher.dto.TeacherApplicationRequest;
import rlaxogh76.DevClass.domain.teacher.dto.TeacherApplicationResponse;
import rlaxogh76.DevClass.domain.teacher.entity.TeacherApplication;
import rlaxogh76.DevClass.domain.teacher.repository.TeacherApplicationRepository;
import rlaxogh76.DevClass.domain.user.entity.User;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;
import rlaxogh76.DevClass.global.notification.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeacherApplicationService {

    private final TeacherApplicationRepository applicationRepository;
    private final EmailService emailService;

    @Transactional
    public void apply(User user, TeacherApplicationRequest request) {
        if (user.getRole() == User.Role.TEACHER || user.getRole() == User.Role.ADMIN) {
            throw new BusinessException(ErrorCode.ALREADY_TEACHER);
        }
        if (user.getRole() == User.Role.PENDING_TEACHER) {
            throw new BusinessException(ErrorCode.TEACHER_APPLICATION_ALREADY_EXISTS);
        }
        TeacherApplication application = TeacherApplication.builder()
            .user(user)
            .phone(request.phone())
            .introduction(request.introduction())
            .build();
        applicationRepository.save(application);
        user.changeRole(User.Role.PENDING_TEACHER);
    }

    public List<TeacherApplicationResponse> getAll() {
        return applicationRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(TeacherApplicationResponse::from)
            .toList();
    }

    @Transactional
    public void approve(Long applicationId) {
        TeacherApplication application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new BusinessException(ErrorCode.TEACHER_APPLICATION_NOT_FOUND));
        if (application.getStatus() != TeacherApplication.Status.PENDING) {
            throw new BusinessException(ErrorCode.TEACHER_APPLICATION_ALREADY_REVIEWED);
        }
        application.approve();
        User user = application.getUser();
        user.changeRole(User.Role.TEACHER);
        sendApprovalEmail(user);
    }

    @Transactional
    public void reject(Long applicationId, String reason) {
        TeacherApplication application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new BusinessException(ErrorCode.TEACHER_APPLICATION_NOT_FOUND));
        if (application.getStatus() != TeacherApplication.Status.PENDING) {
            throw new BusinessException(ErrorCode.TEACHER_APPLICATION_ALREADY_REVIEWED);
        }
        application.reject(reason);
        application.getUser().changeRole(User.Role.STUDENT);
    }

    private void sendApprovalEmail(User user) {
        String displayName = user.getName().isBlank() ? user.getEmail() : user.getName();
        String html = """
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#18181b;color:#ffffff;border-radius:16px">
              <div style="text-align:center;margin-bottom:32px">
                <div style="display:inline-block;width:48px;height:48px;background:#f97316;border-radius:12px;line-height:48px;text-align:center;font-size:24px;font-weight:900;color:#fff">D</div>
                <h1 style="color:#fff;font-size:22px;font-weight:900;margin:16px 0 4px">Dev<span style="color:#f97316">Class</span></h1>
              </div>
              <h2 style="color:#f97316;font-size:20px;font-weight:900;margin-bottom:16px">강사 승인이 완료되었습니다!</h2>
              <p style="color:#a1a1aa;font-size:14px;line-height:1.8;margin-bottom:24px">
                안녕하세요, <strong style="color:#fff">%s</strong>님!<br>
                DevClass 강사 신청이 승인되었습니다.<br>
                이제 강의를 개설하고 수강생을 가르칠 수 있습니다.
              </p>
              <div style="background:#27272a;border-radius:12px;padding:20px;margin-bottom:24px">
                <p style="color:#a1a1aa;font-size:13px;margin:0 0 8px">다음 단계</p>
                <ul style="color:#e4e4e7;font-size:14px;line-height:2;margin:0;padding-left:20px">
                  <li>강사 대시보드에서 강의를 등록하세요</li>
                  <li>영상을 업로드하고 커리큘럼을 구성하세요</li>
                  <li>강의를 발행하면 수강생들이 수강할 수 있습니다</li>
                </ul>
              </div>
              <p style="color:#52525b;font-size:12px;text-align:center;margin-top:40px">DevClass · 강사 지원팀</p>
            </div>
            """.formatted(displayName);
        try {
            emailService.sendCustom(user.getEmail(), "[DevClass] 강사 승인이 완료되었습니다.", html);
        } catch (Exception e) {
            log.warn("[TeacherApply] 승인 이메일 발송 실패 email={}", user.getEmail(), e);
        }
    }
}
