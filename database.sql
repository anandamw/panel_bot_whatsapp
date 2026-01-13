CREATE TABLE IF NOT EXISTS `bots` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(255) NOT NULL UNIQUE,
  `phone_number` VARCHAR(50) DEFAULT NULL,
  `group_link` VARCHAR(255) DEFAULT NULL,
  `group_id` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('disconnected', 'scanning', 'connected', 'busy') DEFAULT 'disconnected',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` VARCHAR(50) NOT NULL UNIQUE,
  `image` VARCHAR(255) DEFAULT NULL,
  `caption` TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS `lists` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `keyword` VARCHAR(100) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL
);

-- [NEW] Per-Group Settings (Gunakan ini untuk SaaS)
CREATE TABLE IF NOT EXISTS `group_settings` (
  `group_id` VARCHAR(100) NOT NULL PRIMARY KEY, -- ID Unik Grup (misal: 12036...@g.us)
  `bot_open` BOOLEAN DEFAULT TRUE,
  
  -- Anti Features
  `anti_ch` BOOLEAN DEFAULT FALSE,
  `anti_wame` BOOLEAN DEFAULT FALSE,
  `anti_link` BOOLEAN DEFAULT FALSE,
  `anti_pl` BOOLEAN DEFAULT FALSE,
  `anti_asing` BOOLEAN DEFAULT FALSE,
  `anti_bot` BOOLEAN DEFAULT FALSE,
  
  -- Anti Toxic
  `anti_toxic_1` BOOLEAN DEFAULT FALSE,
  `anti_toxic_2` BOOLEAN DEFAULT FALSE,
  
  -- Links
  `anti_link_tt` BOOLEAN DEFAULT FALSE,
  `anti_link_yt` BOOLEAN DEFAULT FALSE,
  `anti_link_gc_1` BOOLEAN DEFAULT FALSE,
  `anti_link_gc_2` BOOLEAN DEFAULT FALSE,

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
