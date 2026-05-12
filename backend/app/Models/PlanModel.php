<?php

require_once __DIR__ . '/../database/Connection.php';

class PlanModel
{
    private $db;

    public function __construct()
    {
        $this->db = Connection::connect();
    }

    public function getAll($onlyActive = false)
    {
        $sql = "SELECT id, name, description, benefits, price_text, is_active FROM plans";
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
        $stmt = $this->db->prepare("SELECT id, name, description, benefits, price_text, is_active FROM plans WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->db->prepare("INSERT INTO plans (name, description, benefits, price_text, is_active) VALUES (:name, :description, :benefits, :price_text, :is_active)");
        return $stmt->execute([
            ':name' => $data['name'],
            ':description' => $data['description'],
            ':benefits' => $data['benefits'],
            ':price_text' => $data['price_text'],
            ':is_active' => $data['is_active']
        ]);
    }

    public function update($id, $data)
    {
        $stmt = $this->db->prepare("UPDATE plans SET name = :name, description = :description, benefits = :benefits, price_text = :price_text, is_active = :is_active WHERE id = :id");
        $stmt->execute([
            ':name' => $data['name'],
            ':description' => $data['description'],
            ':benefits' => $data['benefits'],
            ':price_text' => $data['price_text'],
            ':is_active' => $data['is_active'],
            ':id' => $id
        ]);
        return $stmt->rowCount() > 0;
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM plans WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }
}
