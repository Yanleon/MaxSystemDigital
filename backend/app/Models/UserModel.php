<?php

require_once __DIR__ . '/../database/Connection.php';

class UserModel
{
    private $db;

    public function __construct()
    {
        $this->db = Connection::connect();
    }

    public function findByEmail($email)
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM users WHERE email = :email OR email = :emailLower LIMIT 1"
        );

        $stmt->execute([
            'email' => $email,
            'emailLower' => strtolower($email)
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAll()
    {
        $stmt = $this->db->query("SELECT id, name, email, role, created_at FROM users ORDER BY id DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->db->prepare("INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)");
        return $stmt->execute([
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':password' => $data['password'],
            ':role' => $data['role'] ?? 'admin'
        ]);
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function update($id, $data)
    {
        $stmt = $this->db->prepare(
            "UPDATE users SET name = :name, email = :email, password = :password, role = :role WHERE id = :id"
        );
        return $stmt->execute([
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':password' => $data['password'],
            ':role' => $data['role'],
            ':id' => $id
        ]);
    }

    public function getSupportUsers()
    {
        $stmt = $this->db->query("SELECT id, name, email FROM users WHERE role = 'soporte' ORDER BY name ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function isSupport($id)
    {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE id = :id AND role = 'soporte' LIMIT 1");
        $stmt->execute([':id' => $id]);
        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
