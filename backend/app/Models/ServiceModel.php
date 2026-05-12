<?php

require_once __DIR__ . '/../database/Connection.php';

class ServiceModel
{
    private $db;

    public function __construct()
    {
        $this->db = Connection::connect();
    }

    public function getAll()
    {
        $stmt = $this->db->prepare("SELECT id, name, description, icon FROM services ORDER BY id DESC");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare("SELECT id, name, description, icon FROM services WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->db->prepare("INSERT INTO services (name, description, icon) VALUES (:name, :description, :icon)");
        return $stmt->execute([
            ':name' => $data['name'],
            ':description' => $data['description'],
            ':icon' => $data['icon']
        ]);
    }

    public function update($id, $data)
    {
        $stmt = $this->db->prepare("UPDATE services SET name = :name, description = :description, icon = :icon WHERE id = :id");
        $stmt->execute([
            ':name' => $data['name'],
            ':description' => $data['description'],
            ':icon' => $data['icon'],
            ':id' => $id
        ]);
        return $stmt->rowCount() > 0;
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM services WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }
}
