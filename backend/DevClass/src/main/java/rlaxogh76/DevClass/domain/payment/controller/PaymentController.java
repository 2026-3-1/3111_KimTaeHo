package rlaxogh76.DevClass.domain.payment.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rlaxogh76.DevClass.domain.payment.dto.PaymentConfirmRequest;
import rlaxogh76.DevClass.domain.payment.dto.PaymentConfirmResponse;
import rlaxogh76.DevClass.domain.payment.dto.PaymentHistoryResponse;
import rlaxogh76.DevClass.domain.payment.dto.PaymentOrderResponse;

import java.util.List;
import rlaxogh76.DevClass.domain.payment.service.PaymentService;

@Tag(name = "Payment", description = "결제 API")
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "내 결제 내역 조회")
    @GetMapping("/my")
    public ResponseEntity<List<PaymentHistoryResponse>> getMyPayments(@RequestParam Long userId) {
        return ResponseEntity.ok(paymentService.getMyPayments(userId));
    }

    @Operation(summary = "결제 주문 생성 (장바구니 기반)")
    @PostMapping("/orders")
    public ResponseEntity<PaymentOrderResponse> createOrder(@RequestParam Long userId) {
        return ResponseEntity.ok(paymentService.createOrder(userId));
    }

    @Operation(summary = "토스 결제 승인")
    @PostMapping("/confirm")
    public ResponseEntity<PaymentConfirmResponse> confirmPayment(
            @Valid @RequestBody PaymentConfirmRequest request) {
        return ResponseEntity.ok(paymentService.confirmPayment(request));
    }

    @Operation(summary = "결제 환불 (진행률 기준 미만일 때만 가능)")
    @PostMapping("/{orderId}/refund")
    public ResponseEntity<Void> refundPayment(
            @PathVariable String orderId,
            @RequestParam Long userId) {
        paymentService.refundPayment(userId, orderId);
        return ResponseEntity.ok().build();
    }
}
