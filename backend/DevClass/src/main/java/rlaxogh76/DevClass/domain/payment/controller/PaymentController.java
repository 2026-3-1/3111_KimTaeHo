package rlaxogh76.DevClass.domain.payment.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rlaxogh76.DevClass.domain.payment.dto.PaymentConfirmRequest;
import rlaxogh76.DevClass.domain.payment.dto.PaymentConfirmResponse;
import rlaxogh76.DevClass.domain.payment.dto.PaymentOrderResponse;
import rlaxogh76.DevClass.domain.payment.service.PaymentService;

@Tag(name = "Payment", description = "결제 API")
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

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
}
