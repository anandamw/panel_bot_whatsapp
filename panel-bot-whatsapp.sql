-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 20, 2026 at 11:41 AM
-- Server version: 8.0.30
-- PHP Version: 8.3.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `panel-bot-whatsapp`
--

-- --------------------------------------------------------

--
-- Table structure for table `bots`
--

CREATE TABLE `bots` (
  `id` int NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `status` enum('disconnected','scanning','connected','busy') DEFAULT 'disconnected',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bots`
--

INSERT INTO `bots` (`id`, `session_id`, `phone_number`, `status`, `created_at`, `updated_at`) VALUES
(19, 'ab648e59-fb68-4198-91e0-c4e1555aa451', '6283138314600', 'connected', '2026-01-20 01:05:50', '2026-01-20 01:06:33');

-- --------------------------------------------------------

--
-- Table structure for table `bot_groups`
--

CREATE TABLE `bot_groups` (
  `id` int NOT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `group_id` varchar(255) DEFAULT NULL,
  `group_name` varchar(255) DEFAULT NULL,
  `group_link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bot_groups`
--

INSERT INTO `bot_groups` (`id`, `session_id`, `group_id`, `group_name`, `group_link`, `created_at`) VALUES
(3, 'ab648e59-fb68-4198-91e0-c4e1555aa451', '120363405454464509@g.us', 'bot 3', 'https://chat.whatsapp.com/CAEbms82kNMJRhMpm0Wg1P', '2026-01-20 01:08:36'),
(4, 'ab648e59-fb68-4198-91e0-c4e1555aa451', '120363405454464509@g.us', 'bot 3', 'https://chat.whatsapp.com/CAEbms82kNMJRhMpm0Wg1P', '2026-01-20 01:15:14');

-- --------------------------------------------------------

--
-- Table structure for table `lists`
--

CREATE TABLE `lists` (
  `id` int NOT NULL,
  `group_id` varchar(255) NOT NULL DEFAULT 'default',
  `keyword` varchar(50) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `content` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int NOT NULL,
  `group_id` varchar(255) NOT NULL DEFAULT 'default',
  `type` varchar(50) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `caption` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int NOT NULL,
  `group_id` varchar(255) NOT NULL,
  `bot_open` tinyint(1) DEFAULT '1',
  `anti_ch` tinyint(1) DEFAULT '0',
  `anti_wame` tinyint(1) DEFAULT '0',
  `anti_link` tinyint(1) DEFAULT '0',
  `anti_pl` tinyint(1) DEFAULT '0',
  `anti_toxic_1` tinyint(1) DEFAULT '0',
  `anti_toxic_2` tinyint(1) DEFAULT '0',
  `anti_link_tt` tinyint(1) DEFAULT '0',
  `anti_link_yt` tinyint(1) DEFAULT '0',
  `anti_link_gc_1` tinyint(1) DEFAULT '0',
  `anti_link_gc_2` tinyint(1) DEFAULT '0',
  `anti_asing` tinyint(1) DEFAULT '0',
  `anti_bot` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `group_id`, `bot_open`, `anti_ch`, `anti_wame`, `anti_link`, `anti_pl`, `anti_toxic_1`, `anti_toxic_2`, `anti_link_tt`, `anti_link_yt`, `anti_link_gc_1`, `anti_link_gc_2`, `anti_asing`, `anti_bot`) VALUES
(4, '120363405454464509@g.us', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `unauthorized_logs`
--

CREATE TABLE `unauthorized_logs` (
  `id` int NOT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `group_id` varchar(255) DEFAULT NULL,
  `group_name` varchar(255) DEFAULT NULL,
  `sender_number` varchar(50) DEFAULT NULL,
  `action` varchar(50) DEFAULT 'message_received',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bots`
--
ALTER TABLE `bots`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_id` (`session_id`);

--
-- Indexes for table `bot_groups`
--
ALTER TABLE `bot_groups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lists`
--
ALTER TABLE `lists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `group_keyword` (`group_id`,`keyword`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `group_type` (`group_id`,`type`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `group_id` (`group_id`);

--
-- Indexes for table `unauthorized_logs`
--
ALTER TABLE `unauthorized_logs`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bots`
--
ALTER TABLE `bots`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `bot_groups`
--
ALTER TABLE `bot_groups`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `lists`
--
ALTER TABLE `lists`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `unauthorized_logs`
--
ALTER TABLE `unauthorized_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
