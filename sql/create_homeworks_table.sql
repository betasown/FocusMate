-- Table pour stocker les devoirs
CREATE TABLE IF NOT EXISTS homeworks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    due_date DATETIME NOT NULL,
    description TEXT,
    created_by VARCHAR(50) NOT NULL,
    created_by_name VARCHAR(100) NOT NULL,
    guild_id VARCHAR(50) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_guild_due_date (guild_id, due_date),
    INDEX idx_guild_completed (guild_id, completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
