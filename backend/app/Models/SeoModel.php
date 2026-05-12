<?php

require_once __DIR__ . '/../database/Connection.php';

class SeoModel
{
    private $db;

    public function __construct()
    {
        $this->db = Connection::connect();
        $this->ensureTable();
    }

    private function ensureTable()
    {
        $sql = "CREATE TABLE IF NOT EXISTS seo_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            meta_title VARCHAR(160) DEFAULT '',
            meta_description TEXT,
            meta_keywords TEXT,
            og_title VARCHAR(160) DEFAULT '',
            og_description TEXT,
            canonical_url VARCHAR(255) DEFAULT '',
            robots VARCHAR(120) DEFAULT 'index,follow',
            schema_json LONGTEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

        $this->db->exec($sql);
    }

    public function get()
    {
        $stmt = $this->db->query("SELECT * FROM seo_settings ORDER BY id ASC LIMIT 1");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: [];
    }

    public function saveOrUpdate($data)
    {
        $existing = $this->get();
        if ($existing) {
            $sql = "UPDATE seo_settings SET
                meta_title = :meta_title,
                meta_description = :meta_description,
                meta_keywords = :meta_keywords,
                og_title = :og_title,
                og_description = :og_description,
                canonical_url = :canonical_url,
                robots = :robots,
                schema_json = :schema_json
                WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $data['id'] = $existing['id'];
            $stmt->execute($data);
            return;
        }

        $sql = "INSERT INTO seo_settings (
            meta_title, meta_description, meta_keywords, og_title,
            og_description, canonical_url, robots, schema_json
        ) VALUES (
            :meta_title, :meta_description, :meta_keywords, :og_title,
            :og_description, :canonical_url, :robots, :schema_json
        )";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($data);
    }
}
