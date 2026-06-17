CREATE TABLE questions (
    id         BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    course_id  BIGINT       NOT NULL,
    author_id  BIGINT       NOT NULL,
    title      VARCHAR(200) NOT NULL,
    content    TEXT         NOT NULL,
    created_at DATETIME     NOT NULL,
    CONSTRAINT fk_question_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_question_author FOREIGN KEY (author_id) REFERENCES users (id)
);

CREATE TABLE answers (
    id          BIGINT   NOT NULL AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT   NOT NULL,
    author_id   BIGINT   NOT NULL,
    content     TEXT     NOT NULL,
    created_at  DATETIME NOT NULL,
    CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_author   FOREIGN KEY (author_id)   REFERENCES users (id)
);
