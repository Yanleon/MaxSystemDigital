<?php

require_once __DIR__ . '/../database/Connection.php';

class AboutModel
{
    private $db;

    public function __construct()
    {
        $this->db = Connection::connect();
    }

    public function get()
    {
        $stmt = $this->db->query("SELECT * FROM about LIMIT 1");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return [];
        }
        return $row;
    }

    public function saveOrUpdate($data)
    {
        $existing = $this->get();
        if ($existing) {
            $sql = "UPDATE about SET 
                        title = :title,
                        paragraph1 = :paragraph1,
                        paragraph2 = :paragraph2,
                        image = :image,
                        feature1_icon = :feature1_icon,
                        feature1_title = :feature1_title,
                        feature2_icon = :feature2_icon,
                        feature2_title = :feature2_title,
                        feature3_icon = :feature3_icon,
                        feature3_title = :feature3_title,
                        feature4_icon = :feature4_icon,
                        feature4_title = :feature4_title
                    WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $data['id'] = $existing['id'];
            $stmt->execute($data);
        } else {
            $sql = "INSERT INTO about (
                        title, paragraph1, paragraph2, image,
                        feature1_icon, feature1_title,
                        feature2_icon, feature2_title,
                        feature3_icon, feature3_title,
                        feature4_icon, feature4_title
                    ) VALUES (
                        :title, :paragraph1, :paragraph2, :image,
                        :feature1_icon, :feature1_title,
                        :feature2_icon, :feature2_title,
                        :feature3_icon, :feature3_title,
                        :feature4_icon, :feature4_title
                    )";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($data);
        }
    }
}
