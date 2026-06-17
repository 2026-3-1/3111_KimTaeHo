package rlaxogh76.DevClass.global.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    EMAIL_DUPLICATE("이미 사용 중인 이메일입니다.", HttpStatus.CONFLICT),
    INVALID_CREDENTIALS("이메일 또는 비밀번호가 올바르지 않습니다.", HttpStatus.UNAUTHORIZED),
    USER_NOT_FOUND("존재하지 않는 사용자입니다.", HttpStatus.NOT_FOUND),
    COURSE_NOT_FOUND("존재하지 않는 강의입니다.", HttpStatus.NOT_FOUND),
    LECTURE_NOT_FOUND("존재하지 않는 강의 영상입니다.", HttpStatus.NOT_FOUND),
    LECTURE_NOT_IN_COURSE("해당 영상은 수강 중인 강의에 포함되지 않습니다.", HttpStatus.BAD_REQUEST),
    ENROLLMENT_NOT_FOUND("수강 정보를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    ALREADY_ENROLLED("이미 수강 중인 강의입니다.", HttpStatus.CONFLICT),
    CANNOT_CANCEL("학습을 시작한 강의는 취소할 수 없습니다.", HttpStatus.BAD_REQUEST),
    REVIEW_NOT_FOUND("존재하지 않는 리뷰입니다.", HttpStatus.NOT_FOUND),
    REVIEW_NOT_AUTHORIZED("리뷰 작성자만 수정/삭제할 수 있습니다.", HttpStatus.FORBIDDEN),
    NOT_ENROLLED("수강 중인 강의에만 리뷰를 작성할 수 있습니다.", HttpStatus.FORBIDDEN),
    REVIEW_ALREADY_EXISTS("이미 리뷰를 작성한 강의입니다.", HttpStatus.CONFLICT),
    FORBIDDEN("접근 권한이 없습니다.", HttpStatus.FORBIDDEN),
    NOT_TEACHER("강사만 접근할 수 있습니다.", HttpStatus.FORBIDDEN),
    COURSE_NOT_OWNED("본인의 강의만 수정/삭제할 수 있습니다.", HttpStatus.FORBIDDEN),
    LECTURE_NOT_FOUND_IN_COURSE("해당 강의에 속한 영상을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    REVIEW_PROGRESS_INSUFFICIENT("강의를 80% 이상 수강한 후 리뷰를 작성할 수 있습니다.", HttpStatus.FORBIDDEN),
    NOT_STUDENT("학생만 수강 신청할 수 있습니다.", HttpStatus.FORBIDDEN),
    CART_ALREADY_EXISTS("이미 장바구니에 담긴 강의입니다.", HttpStatus.CONFLICT),
    CART_ITEM_NOT_FOUND("장바구니 항목을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    CART_EMPTY("장바구니가 비어 있습니다.", HttpStatus.BAD_REQUEST),
    PAYMENT_NOT_FOUND("결제 정보를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    PAYMENT_AMOUNT_MISMATCH("결제 금액이 일치하지 않습니다.", HttpStatus.BAD_REQUEST),
    PAYMENT_CONFIRM_FAILED("결제 승인에 실패했습니다.", HttpStatus.BAD_GATEWAY),
    EMAIL_NOT_VERIFIED("이메일 인증을 완료해주세요.", HttpStatus.BAD_REQUEST),
    EMAIL_VERIFICATION_FAILED("인증 코드가 올바르지 않거나 만료되었습니다.", HttpStatus.BAD_REQUEST),
    EMAIL_SEND_FAILED("이메일 발송에 실패했습니다. SMTP 설정을 확인해주세요.", HttpStatus.INTERNAL_SERVER_ERROR),
    REFUND_PROGRESS_EXCEEDED("수강 진행률이 환불 기준을 초과하여 환불이 불가합니다.", HttpStatus.BAD_REQUEST),
    PAYMENT_ALREADY_REFUNDED("이미 환불된 결제입니다.", HttpStatus.BAD_REQUEST),
    PAYMENT_CANCEL_FAILED("결제 취소에 실패했습니다.", HttpStatus.BAD_GATEWAY),
    COURSE_HAS_NO_LECTURES("강의 영상이 없는 강좌는 발행할 수 없습니다.", HttpStatus.BAD_REQUEST),
    QUESTION_NOT_FOUND("존재하지 않는 질문입니다.", HttpStatus.NOT_FOUND),
    QUESTION_NOT_AUTHORIZED("본인의 질문만 삭제할 수 있습니다.", HttpStatus.FORBIDDEN),
    ANSWER_NOT_FOUND("존재하지 않는 답변입니다.", HttpStatus.NOT_FOUND),
    ANSWER_NOT_AUTHORIZED("강사만 답변을 작성할 수 있습니다.", HttpStatus.FORBIDDEN),
    ACCOUNT_SUSPENDED("정지된 계정입니다. 관리자에게 문의하세요.", HttpStatus.FORBIDDEN),
    PAYMENT_ALREADY_CANCELLED("이미 취소된 결제입니다.", HttpStatus.BAD_REQUEST);

    private final String message;
    private final HttpStatus status;

    ErrorCode(String message, HttpStatus status) {
        this.message = message;
        this.status = status;
    }

    public String getMessage() { return message; }
    public HttpStatus getStatus() { return status; }
}