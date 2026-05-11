CREATE TABLE payments
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id    VARCHAR(100) NOT NULL UNIQUE,
    payment_key VARCHAR(200),
    user_id     BIGINT       NOT NULL,
    amount      BIGINT       NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    course_ids  TEXT         NOT NULL,
    created_at  DATETIME     NOT NULL,
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users (id)
);
