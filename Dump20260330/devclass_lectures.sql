-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: devclass
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `lectures`
--

DROP TABLE IF EXISTS `lectures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lectures` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `title` varchar(200) NOT NULL,
  `video_url` varchar(500) NOT NULL,
  `duration` int NOT NULL DEFAULT '0' COMMENT '영상 길이(초)',
  `sequence` int NOT NULL DEFAULT '0' COMMENT '재생 순서',
  PRIMARY KEY (`id`),
  KEY `idx_lectures_course_id` (`course_id`),
  CONSTRAINT `fk_lectures_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lectures`
--

LOCK TABLES `lectures` WRITE;
/*!40000 ALTER TABLE `lectures` DISABLE KEYS */;
INSERT INTO `lectures` VALUES (1,1,'React 소개 및 환경 설정','https://video.devclass.com/1/1',600,1),(2,1,'JSX 기초','https://video.devclass.com/1/2',900,2),(3,1,'Props와 State','https://video.devclass.com/1/3',1200,3),(4,1,'useEffect Hook','https://video.devclass.com/1/4',1080,4),(5,1,'컴포넌트 분리 실습','https://video.devclass.com/1/5',1500,5),(6,2,'Spring Boot 프로젝트 생성','https://video.devclass.com/2/1',720,1),(7,2,'REST API 설계 원칙','https://video.devclass.com/2/2',960,2),(8,2,'JPA Entity 설계','https://video.devclass.com/2/3',1140,3),(9,2,'Service & Repository 패턴','https://video.devclass.com/2/4',900,4),(10,3,'시간복잡도와 Big-O','https://video.devclass.com/3/1',600,1),(11,3,'배열과 연결 리스트','https://video.devclass.com/3/2',900,2),(12,3,'스택과 큐','https://video.devclass.com/3/3',780,3),(13,4,'Docker란 무엇인가','https://video.devclass.com/4/1',540,1),(14,4,'Dockerfile 작성법','https://video.devclass.com/4/2',840,2),(15,4,'docker-compose 실습','https://video.devclass.com/4/3',1020,3);
/*!40000 ALTER TABLE `lectures` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-30  9:11:34
