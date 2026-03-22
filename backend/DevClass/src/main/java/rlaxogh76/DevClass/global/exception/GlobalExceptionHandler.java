package rlaxogh76.DevClass.global.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException e) {
        log.warn("BusinessException: {}", e.getMessage());
        return ResponseEntity
                .status(e.getErrorCode().getStatus())
                .body(ErrorResponse.of(e.getErrorCode()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .orElse("잘못된 요청입니다.");
        return ResponseEntity.badRequest()
                .body(ErrorResponse.of(400, message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception e) {
        log.error("Unhandled exception", e);
        return ResponseEntity.internalServerError()
                .body(ErrorResponse.of(500, "서버 내부 오류가 발생했습니다."));
    }
}
