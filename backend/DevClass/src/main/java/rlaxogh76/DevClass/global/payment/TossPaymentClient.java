package rlaxogh76.DevClass.global.payment;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Slf4j
@Component
public class TossPaymentClient {

    @Value("${toss.secret-key}")
    private String secretKey;

    private static final String TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";
    private static final String TOSS_CANCEL_URL = "https://api.tosspayments.com/v1/payments/%s/cancel";

    /**
     * Toss Payments 결제 승인 API 호출.
     * 네트워크/서버 오류(IOException) 발생 시 최대 3회, 지수 백오프(1s→2s→4s)로 재시도.
     * BusinessException은 재시도하지 않음 (비즈니스 오류).
     */
    @Retryable(
            retryFor = {IOException.class, InterruptedException.class},
            noRetryFor = {BusinessException.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000, multiplier = 2.0, maxDelay = 8000)
    )
    public void confirmPayment(String paymentKey, String orderId, Long amount) throws IOException, InterruptedException {
        log.info("[Toss] 결제 승인 요청 orderId={} amount={}", orderId, amount);

        String credentials = Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));

        String body = String.format(
                "{\"paymentKey\":\"%s\",\"orderId\":\"%s\",\"amount\":%d}",
                paymentKey, orderId, amount
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(TOSS_CONFIRM_URL))
                .header("Authorization", "Basic " + credentials)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = HttpClient.newBuilder()
                .proxy(HttpClient.Builder.NO_PROXY)
                .build()
                .send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("[Toss] 결제 승인 실패 status={} body={}", response.statusCode(), response.body());
            throw new BusinessException(ErrorCode.PAYMENT_CONFIRM_FAILED);
        }

        log.info("[Toss] 결제 승인 성공 orderId={}", orderId);
    }

    @Retryable(
            retryFor = {IOException.class, InterruptedException.class},
            noRetryFor = {BusinessException.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000, multiplier = 2.0, maxDelay = 8000)
    )
    public void cancelPartialPayment(String paymentKey, String cancelReason, long cancelAmount) throws IOException, InterruptedException {
        log.info("[Toss] 부분 결제 취소 요청 paymentKey={} cancelAmount={}", paymentKey, cancelAmount);

        String credentials = Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));

        String body = String.format(
                "{\"cancelReason\":\"%s\",\"cancelAmount\":%d}",
                cancelReason, cancelAmount
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(String.format(TOSS_CANCEL_URL, paymentKey)))
                .header("Authorization", "Basic " + credentials)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = HttpClient.newBuilder()
                .proxy(HttpClient.Builder.NO_PROXY)
                .build()
                .send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("[Toss] 부분 결제 취소 실패 status={} body={}", response.statusCode(), response.body());
            throw new BusinessException(ErrorCode.PAYMENT_CANCEL_FAILED);
        }

        log.info("[Toss] 부분 결제 취소 성공 paymentKey={}", paymentKey);
    }

    @Retryable(
            retryFor = {IOException.class, InterruptedException.class},
            noRetryFor = {BusinessException.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000, multiplier = 2.0, maxDelay = 8000)
    )
    public void cancelPayment(String paymentKey, String cancelReason) throws IOException, InterruptedException {
        log.info("[Toss] 결제 취소 요청 paymentKey={}", paymentKey);

        String credentials = Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));

        String body = String.format("{\"cancelReason\":\"%s\"}", cancelReason);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(String.format(TOSS_CANCEL_URL, paymentKey)))
                .header("Authorization", "Basic " + credentials)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = HttpClient.newBuilder()
                .proxy(HttpClient.Builder.NO_PROXY)
                .build()
                .send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("[Toss] 결제 취소 실패 status={} body={}", response.statusCode(), response.body());
            throw new BusinessException(ErrorCode.PAYMENT_CANCEL_FAILED);
        }

        log.info("[Toss] 결제 취소 성공 paymentKey={}", paymentKey);
    }
}
