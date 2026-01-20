-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 19, 2026 at 11:10 AM
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
  `group_link` varchar(255) DEFAULT NULL,
  `group_id` varchar(255) DEFAULT NULL,
  `status` enum('disconnected','scanning','connected','busy') DEFAULT 'disconnected',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bots`
--

INSERT INTO `bots` (`id`, `session_id`, `phone_number`, `group_link`, `group_id`, `status`, `created_at`, `updated_at`) VALUES
(10, 'a7b1e8e6-0a29-4598-a15b-9273aa381b94', '6283138314600', 'https://chat.whatsapp.com/Bo2karobnN2GE78T8vWhST', 'Latih BOT 🐱', 'connected', '2026-01-13 10:28:41', '2026-01-13 10:31:19');

-- --------------------------------------------------------

--
-- Table structure for table `lists`
--

CREATE TABLE `lists` (
  `id` int NOT NULL,
  `keyword` varchar(50) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `content` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `lists`
--

INSERT INTO `lists` (`id`, `keyword`, `title`, `content`) VALUES
(2, 'netflix', 'netflix', '🎬 𝑵𝒆𝒕𝒇𝒍𝒊𝒙 𝑷𝒓𝒆𝒎𝒊𝒖𝒎 🍿\n\n⋆｡˚ Sharing 1P2U ⋆｡˚\n🎠 1 hari : Rp. 3.500\n🎠 1 bulan : Rp. 15.000\n\n⋆｡˚ Sharing 1P1U ⋆｡˚\n🎠 1 hari : Rp. 4.000\n🎠 7 hari : Rp. 12.500\n🎠 1 bulan : Rp. 25.000 \n\n⋆｡˚ Semi Private (2 Device) ⋆｡˚\n🎠 7 hari : Rp. 16.500\n🎠 1 bulan : Rp. 35.000\n\n⋆｡˚ Private ⋆｡˚\n🎠 1 bulan : Rp. 113.000\n\n✧ note:\n• tanyakan stok terlebih dahulu\n• fixing 0 – 3 hari\n• tidak menerima komplain limit screen untuk akun sharing\n• wajib ss, no ss no garansi !!\n• garansi 25 hari = 1 bulan\n\n⋆˚｡⋆୨୧˚｡⋆'),
(3, 'bstation', 'bstation', '🎀 𝑩𝒔𝒕𝒂𝒕𝒊𝒐𝒏 𝑷𝒓𝒆𝒎𝒊𝒖𝒎 🎧💙\n\n_⋆｡˚ Sharing ⋆｡˚_\n🎠 1 bulan : 𝑹𝒑. 7.000\n🎠 3 bulan : 𝑹𝒑. 11.000\n🎠 1 tahun : 𝑹𝒑. 15.000\n\n✧ 𝒏𝒐𝒕𝒆:\n* tanyakan stok terlebih dahulu\n* wajib ss, no ss no garansi !!\n* acc seller'),
(4, 'prime video', 'prime video', '🎞️ *𝑨𝒎𝒂𝒛𝒐𝒏 𝑷𝒓𝒊𝒎𝒆 𝑽𝒊𝒅𝒆𝒐* 💙✨\n\n⋆｡˚ _Sharing_ ⋆｡˚\n- 🎠 1 bulan : 𝑹𝒑. 6.000 \n\n⋆｡˚ _Private_ ⋆｡˚\n- 🎠 1 bulan : 𝑹𝒑. 12.300\n\n✧ 𝒏𝒐𝒕𝒆:\n• tanyakan stok terlebih dahulu\n• wajib ss, no ss no garansi !!\n• sharing acc seller\n\n⋆˚｡⋆୨୧˚｡⋆'),
(5, 'disney+', 'disney+', '🤖𝑫𝒊𝒔𝒏𝒆𝒚+ 𝑯𝒐𝒕𝒔𝒕𝒂𝒓 ✨\n\n⋆｡˚ Sharing (6 User) ⋆｡˚\n\n• 🎠 1 hari : 𝑹𝒑. 4.000\n• 🎠 7 hari : 𝑹𝒑. 12.000\n• 🎠 1 bulan : 𝑹𝒑. 18.000\n\n✧ 𝒏𝒐𝒕𝒆:\n• wajib 1 device\n• verif harus janjian\n• tanyakan stok terlebih dahulu\n• wajib ss, no ss no garansi !!'),
(6, 'cek nomor', 'cek nomor', '🐣 𝑪𝒆𝒌 𝑵𝒐𝒎𝒐𝒓 𝑮𝑻𝑪 🎀\n\n_⋆｡˚ services ⋆｡˚_\n🎠 1 nomor : 𝑹𝒑. 1.000\n\n✧\n𝒏𝒐𝒕𝒆:\n• tanyakan stok terlebih dahulu\n• no admin'),
(7, 'spotify', 'spotify', '🎵 𝑺𝒑𝒐𝒕𝒊𝒇𝒚 🎧\n\n_⋆｡˚ famplan ⋆｡˚_\n🌟 1 bulan : Rp. 16.300\n🌟 2 bulan : Rp. 23.100\n\n_⋆｡˚ indplan ⋆｡˚_\n🌟 Rp. 23.500\n\n✧ 𝒏𝒐𝒕𝒆:\n• tanyakan stok terlebih dahulu\n• ind akun b butuh email dan pw'),
(8, 'dramabox', 'dramabox', '💿𝑫𝒓𝒂𝒎𝒂𝒃𝒐𝒙 🎀\n\n_⋆｡˚ sharing ⋆｡˚_\n🎠 1 bulan : 𝑹𝒑. 10.500\n\n✧ 𝒏𝒐𝒕𝒆:\n• tanyakan stok terlebih dahulu\n• cocok buat nonton drama & film kesayangan\n• garansi berlaku untuk yang mematuhi snk'),
(9, 'wetv', 'wetv', '📱 𝑾𝒆𝑻𝑽 𝑷𝒓𝒆𝒎𝒊𝒖𝒎 🍥✨\n\n⋆｡˚ _Sharing (5u)_ ⋆｡˚\n- 🎠 1 bulan : 𝑹𝒑. 9.000\n\n⋆｡˚ _Private_ ⋆｡˚\n- 🎠 1 bulan : 𝑹𝒑. 23.600\n- 🎠 7 hari  : 𝑹𝒑. 14.000\n\n✧ 𝒏𝒐𝒕𝒆:\n• tanyakan stok terlebih dahulu\n• akun dari seller\n• wajib ss, no ss no garansi !!\n• shar gabisa login tv\n\n⋆˚｡⋆୨୧˚｡⋆'),
(10, 'vidio', 'vidio', '📺𝑽𝒊𝒅𝒊𝒐 𝑷𝒓𝒆𝒎𝒊𝒖𝒎🩶✨\n\nPLATINUM💿\n⋆｡˚ _Sharing_ ⋆｡˚\n- 🎠 1 bulan (alldev) : 𝑹𝒑. 19.000\n- 🎠 1 bulan (mobile) : 𝑹𝒑. 13.000\n- 🎠 1 tahun (tv) : 𝑹𝒑. 7.500\n\n⋆｡˚ _Private_ ⋆｡˚\n- 🎠 1 bulan (alldev) : 𝑹𝒑. 30.000\n* 🎠 1 bulan (mobile) : 𝑹𝒑. 21.000\n* 🎠 1 tahun (tv) : 𝑹𝒑. 13.000\n\n✧ 𝒏𝒐𝒕𝒆:\n• tanyakan stok terlebih dahulu\n• wajib ss, no ss no garansi !!\n\n⋆˚｡⋆୨୧˚｡⋆');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int NOT NULL,
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

INSERT INTO `settings` (`id`, `bot_open`, `anti_ch`, `anti_wame`, `anti_link`, `anti_pl`, `anti_toxic_1`, `anti_toxic_2`, `anti_link_tt`, `anti_link_yt`, `anti_link_gc_1`, `anti_link_gc_2`, `anti_asing`, `anti_bot`) VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);

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
-- Indexes for table `lists`
--
ALTER TABLE `lists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `keyword` (`keyword`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `type` (`type`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bots`
--
ALTER TABLE `bots`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
