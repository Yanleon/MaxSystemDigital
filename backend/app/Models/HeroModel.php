<?php

require_once __DIR__ . '/../database/Connection.php';

class HeroModel
{
    private $db;

    public function __construct()
    {
        $this->db = Connection::connect();
        $this->ensureSchema();
    }

    public function get()
    {
        $stmt = $this->db->query("SELECT * FROM hero_sections LIMIT 1");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: [];
    }

    public function saveOrUpdate($data)
    {
        $existing = $this->get();

        if ($existing) {
            $sql = "UPDATE hero_sections SET
                brand_name = :brand_name,
                logo = :logo,
                favicon = :favicon,
                badge = :badge,
                title = :title,
                subtitle = :subtitle,
                image = :image,
                cta_primary_text = :cta_primary_text,
                cta_primary_link = :cta_primary_link,
                cta_secondary_text = :cta_secondary_text,
                cta_secondary_link = :cta_secondary_link,
                metric_top_value = :metric_top_value,
                metric_top_text = :metric_top_text,
                metric_bottom_value = :metric_bottom_value,
                metric_bottom_text = :metric_bottom_text
                WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $data['id'] = $existing['id'];
            $stmt->execute($data);
            return;
        }

        $sql = "INSERT INTO hero_sections (
                brand_name, logo, favicon, badge, title, subtitle, image,
                cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link,
                metric_top_value, metric_top_text, metric_bottom_value, metric_bottom_text
            ) VALUES (
                :brand_name, :logo, :favicon, :badge, :title, :subtitle, :image,
                :cta_primary_text, :cta_primary_link, :cta_secondary_text, :cta_secondary_link,
                :metric_top_value, :metric_top_text, :metric_bottom_value, :metric_bottom_text
            )";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($data);
    }

    private function ensureSchema()
    {
        try {
            $stmt = $this->db->query("SHOW COLUMNS FROM hero_sections LIKE 'favicon'");
            $exists = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$exists) {
                $this->db->exec("ALTER TABLE hero_sections ADD COLUMN favicon VARCHAR(255) NULL AFTER logo");
            }
        } catch (Throwable $e) {
            // Ignorar para no bloquear lecturas si la migracion falla.
        }
    }
}
