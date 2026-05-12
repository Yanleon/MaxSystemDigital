<?php

require_once __DIR__ . '/../database/Connection.php';

class Portafolio
{
    private $db;

    public function __construct()
    {
        $this->db = Connection::connect();
    }

    public function getAll()
    {
        $stmt = $this->db->query("SELECT id, title, image, description, created_at FROM portfolio ORDER BY id DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $sql = "INSERT INTO portfolio (title, image, description)
                VALUES (:title, :image, :description)";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':title' => $data['title'],
            ':image' => $data['image'],
            ':description' => $data['description']
        ]);
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare("SELECT id, title, image, description, created_at FROM portfolio WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function update($id, $data)
    {
        $sql = "UPDATE portfolio SET title = :title, image = :image, description = :description WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':title' => $data['title'],
            ':image' => $data['image'],
            ':description' => $data['description'],
            ':id' => $id
        ]);
        return $stmt->rowCount() > 0;
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM portfolio WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }
}
