<?php

require_once __DIR__ . '/../database/Connection.php';

class Cliente
{
    private $db;

    public function __construct()
    {
        $this->db = Connection::connect();
    }

    public function getAll()
    {
        $stmt = $this->db->query("SELECT * FROM clients ORDER BY id DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function save($data)
    {
        $sql = "INSERT INTO clients (name, logo) VALUES (:name, :logo)";
        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':name' => $data['name'],
            ':logo' => $data['logo']
        ]);
    }

    public function update($id, $data)
    {
        $sql = "UPDATE clients SET name = :name, logo = :logo WHERE id = :id";
        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':name' => $data['name'],
            ':logo' => $data['logo'],
            ':id'   => $id
        ]);

        return $stmt->rowCount() > 0;
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM clients WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    public function getSection()
    {
        try {
            $stmt = $this->db->query("SELECT kicker, title, subtitle FROM clients_section LIMIT 1");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row ?: [
                'kicker' => 'CLIENTES',
                'title' => 'Marcas que han crecido con MaxSystemDigital',
                'subtitle' => 'Aliados en diferentes sectores con objetivos medibles'
            ];
        } catch (Throwable $e) {
            return [
                'kicker' => 'CLIENTES',
                'title' => 'Marcas que han crecido con MaxSystemDigital',
                'subtitle' => 'Aliados en diferentes sectores con objetivos medibles'
            ];
        }
    }

    public function saveSection($data)
    {
        try {
            $this->ensureClientsSectionTable();
            $stmt = $this->db->query("SELECT id FROM clients_section LIMIT 1");
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                $sql = "UPDATE clients_section SET kicker = :kicker, title = :title, subtitle = :subtitle WHERE id = :id";
                $st = $this->db->prepare($sql);
                return $st->execute([
                    ':kicker' => $data['kicker'],
                    ':title' => $data['title'],
                    ':subtitle' => $data['subtitle'],
                    ':id' => $existing['id']
                ]);
            }

            $sql = "INSERT INTO clients_section (kicker, title, subtitle) VALUES (:kicker, :title, :subtitle)";
            $st = $this->db->prepare($sql);
            return $st->execute([
                ':kicker' => $data['kicker'],
                ':title' => $data['title'],
                ':subtitle' => $data['subtitle']
            ]);
        } catch (Throwable $e) {
            return false;
        }
    }

    private function ensureClientsSectionTable()
    {
        $this->db->exec("CREATE TABLE IF NOT EXISTS clients_section (
            id INT AUTO_INCREMENT PRIMARY KEY,
            kicker VARCHAR(80) NOT NULL DEFAULT 'CLIENTES',
            title VARCHAR(255) NOT NULL,
            subtitle VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    }
}
