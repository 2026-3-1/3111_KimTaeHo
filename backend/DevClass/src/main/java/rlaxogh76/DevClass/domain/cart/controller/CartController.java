package rlaxogh76.DevClass.domain.cart.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rlaxogh76.DevClass.domain.cart.dto.CartAddRequest;
import rlaxogh76.DevClass.domain.cart.dto.CartCheckoutResponse;
import rlaxogh76.DevClass.domain.cart.dto.CartItemResponse;
import rlaxogh76.DevClass.domain.cart.service.CartService;

import java.util.List;

@Tag(name = "Cart", description = "장바구니 API")
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @Operation(summary = "장바구니 목록 조회")
    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getMyCart(@RequestParam Long userId) {
        return ResponseEntity.ok(cartService.getMyCart(userId));
    }

    @Operation(summary = "장바구니 담기")
    @PostMapping("/items")
    public ResponseEntity<CartItemResponse> add(@Valid @RequestBody CartAddRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cartService.add(request));
    }

    @Operation(summary = "장바구니 항목 삭제")
    @DeleteMapping("/items/{courseId}")
    public ResponseEntity<Void> remove(@RequestParam Long userId, @PathVariable Long courseId) {
        cartService.remove(userId, courseId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "장바구니 전체 비우기")
    @DeleteMapping
    public ResponseEntity<Void> clear(@RequestParam Long userId) {
        cartService.clear(userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "장바구니 일괄 수강 신청")
    @PostMapping("/checkout")
    public ResponseEntity<CartCheckoutResponse> checkout(@RequestParam Long userId) {
        return ResponseEntity.ok(cartService.checkout(userId));
    }
}
