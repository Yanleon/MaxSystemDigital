<?php

require_once __DIR__ . '/../database/Connection.php';

class TestimonialModel
{
    private $db;

    public function __construct()
    {
        $this->db = Connection::connect();
    }

    public function getAll($onlyActive = false)
    {
        $sql = "SELECT id, author_name, author_role, content, is_active FROM testimonials";
        if ($onlyActive) {
            $sql .= " WHERE is_active = 1";
        }
        $sql .= " ORDER BY id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare("SELECT id, author_name, author_role, content, is_active FROM testimonials WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->db->prepare("INSERT INTO testimonials (author_name, author_role, content, is_active) VALUES (:author_name, :author_role, :content, :is_active)");
        return $stmt->execute([
            ':author_name' => $data['author_name'],
            ':author_role' => $data['author_role'],
            ':content' => $data['content'],
            ':is_active' => $data['is_active']
        ]);
    }

    public function update($id, $data)
    {
        $stmt = $this->db->prepare("UPDATE testimonials SET author_name = :author_name, author_role = :author_role, content = :content, is_active = :is_active WHERE id = :id");
        $stmt->execute([
            ':author_name' => $data['author_name'],
            ':author_role' => $data['author_role'],
            ':content' => $data['content'],
            ':is_active' => $data['is_active'],
            ':id' => $id
        ]);
        return $stmt->rowCount() > 0;
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM testimonials WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }
}
