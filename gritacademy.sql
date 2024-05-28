-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Värd: 127.0.0.1:3306
-- Tid vid skapande: 22 maj 2024 kl 14:44
-- Serverversion: 8.3.0
-- PHP-version: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Databas: `gritacademy`
--
CREATE DATABASE IF NOT EXISTS `gritacademy` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_swedish_ci;
USE `gritacademy`;

-- --------------------------------------------------------

--
-- Tabellstruktur `courses`
--

DROP TABLE IF EXISTS `courses`;
CREATE TABLE IF NOT EXISTS `courses` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_swedish_ci NOT NULL,
  `description` text COLLATE utf8mb4_swedish_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_swedish_ci;

--
-- Dumpning av Data i tabell `courses`
--

INSERT INTO `courses` (`id`, `name`, `description`) VALUES
(1, 'Backend Databas', 'Relationsdatabaser och API med Node.js'),
(2, 'UX Design', 'Grunder i User Experience design, principer och verktyg.'),
(3, 'Javascript 2', 'Objektorienterad programmering, Node.js, typescript mm.'),
(4, 'Versionshantering', 'Versionshantering och arbete i grupp med verktyg som Git och github.'),
(5, 'Javascript 1', 'Into till javascript, moduler, asynkron programmering, promises, API/fetch.'),
(6, 'HTML och CSS', 'Grundläggande webbutveckling.'),
(7, 'Konsultrollen', 'Jadu... vad namnet antyder?'),
(9, 'Agil projektledning', 'Introduktion till agil projektledning. Med en rejäl paus mellan första och andra kursveckan så allt hinner sjunka in!');

-- --------------------------------------------------------

--
-- Tabellstruktur `students`
--

DROP TABLE IF EXISTS `students`;
CREATE TABLE IF NOT EXISTS `students` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `firstname` varchar(30) COLLATE utf8mb4_swedish_ci NOT NULL,
  `lastname` varchar(30) COLLATE utf8mb4_swedish_ci NOT NULL,
  `city` varchar(40) COLLATE utf8mb4_swedish_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_swedish_ci;

--
-- Dumpning av Data i tabell `students`
--

INSERT INTO `students` (`id`, `firstname`, `lastname`, `city`) VALUES
(1, 'John', 'Doe', 'Nowhere'),
(2, 'Jane', 'Doe', 'Somewhere'),
(3, 'Torsten', 'Testare', 'Ingalunda'),
(4, 'Tess', 'Testare', 'Hultarpinge'),
(5, 'Terese', 'Testarossa', 'Malmö'),
(6, 'Kristoffer', 'Bengtsson', 'Malmö'),
(7, 'Anders', 'Andersson', 'Lound'),
(8, 'Nån', 'Annan', 'Trelleborg'),
(9, 'Liam', 'Nilsson', NULL),
(10, 'Testy', 'Student', 'Fiktiva staden'),
(13, 'Inga', 'Kurser', 'Malö'),
(18, 'Test', 'Testare', 'Malmö'),
(19, 'Val', 'Validated', 'Testville');

-- --------------------------------------------------------

--
-- Tabellstruktur `students_courses`
--

DROP TABLE IF EXISTS `students_courses`;
CREATE TABLE IF NOT EXISTS `students_courses` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` int UNSIGNED NOT NULL,
  `course_id` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_swedish_ci;

--
-- Dumpning av Data i tabell `students_courses`
--

INSERT INTO `students_courses` (`id`, `student_id`, `course_id`) VALUES
(1, 1, 1),
(3, 3, 1),
(4, 4, 1),
(5, 2, 2),
(6, 3, 2),
(7, 4, 2),
(8, 5, 2),
(10, 5, 3),
(12, 7, 3),
(13, 8, 3),
(14, 9, 4),
(18, 1, 5),
(19, 2, 5),
(20, 5, 5),
(21, 3, 5),
(23, 1, 3),
(29, 6, 3),
(30, 6, 5),
(31, 2, 1),
(33, 7, 9),
(34, 8, 9),
(37, 5, 1),
(39, 4, 9),
(40, 6, 1),
(41, 1, 2),
(42, 1, 4),
(49, 19, 9);

--
-- Restriktioner för dumpade tabeller
--

--
-- Restriktioner för tabell `students_courses`
--
ALTER TABLE `students_courses`
  ADD CONSTRAINT `students_courses_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `students_courses_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
