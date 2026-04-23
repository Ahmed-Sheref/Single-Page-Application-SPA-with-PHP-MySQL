-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 23, 2026 at 07:55 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `book_finder`
--

-- --------------------------------------------------------

--
-- Table structure for table `saved_books`
--

CREATE TABLE `saved_books` (
  `id` int(11) NOT NULL,
  `openlibrary_id` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author_name` varchar(255) DEFAULT NULL,
  `publish_year` int(11) DEFAULT NULL,
  `page_count` int(11) DEFAULT NULL,
  `cover_id` varchar(50) DEFAULT NULL,
  `status` enum('not_read','reading','read') DEFAULT 'not_read',
  `user_note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `saved_books`
--

INSERT INTO `saved_books` (`id`, `openlibrary_id`, `title`, `author_name`, `publish_year`, `page_count`, `cover_id`, `status`, `user_note`, `created_at`, `updated_at`) VALUES
(17, '/works/OL1238284W', 'Exercitia spiritualia', 'Saint Ignatius of Loyola', 1548, 230, '8027976', 'not_read', '', '2026-04-23 17:36:34', '2026-04-23 17:36:34'),
(18, '/works/OL804246W', 'Sonnenfinsternis', 'Arthur Koestler', 1940, 254, '368797', 'reading', '', '2026-04-23 17:36:34', '2026-04-23 17:36:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `saved_books`
--
ALTER TABLE `saved_books`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `openlibrary_id` (`openlibrary_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `saved_books`
--
ALTER TABLE `saved_books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
