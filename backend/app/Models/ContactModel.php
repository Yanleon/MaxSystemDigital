<?php

require_once __DIR__ . '/../database/Connection.php';

class ContactModel
{
    private $db;
    private $columns;

    public function __construct()
    {
        $this->db = Connection::connect();
    }

    public function save($data)
    {
        try {
            $map = [
                'name' => $data['nombre'] ?? '',
                'email' => $data['correo'] ?? null,
                'country' => $data['pais'] ?? 'Colombia',
                'phone' => $data['telefono'] ?? ($data['celular'] ?? ''),
                'service' => $data['tipo_proyecto'] ?? ($data['servicio'] ?? ''),
                'project_type' => $data['tipo_proyecto'] ?? null,
                'description' => $data['mensaje'] ?? ($data['descripcion'] ?? ''),
                'message' => $data['mensaje'] ?? null,
                'status' => 'abierto',
                'support_id' => null
            ];

            $columns = $this->getTableColumns();
            $available = [];
            foreach ($map as $col => $val) {
                if (in_array($col, $columns, true)) {
                    $available[$col] = $val;
                }
            }

            if (empty($available)) {
                return 'La tabla contacts no tiene columnas compatibles';
            }

            $fieldList = implode(', ', array_keys($available));
            $paramList = ':' . implode(', :', array_keys($available));
            $sql = "INSERT INTO contacts ($fieldList) VALUES ($paramList)";

            $stmt = $this->db->prepare($sql);
            $params = [];
            foreach ($available as $k => $v) {
                $params[':' . $k] = $v;
            }
            $stmt->execute($params);

            return true;
        } catch (PDOException $e) {
            return $e->getMessage();
        }
    }

    public function getAll()
    {
        $columns = $this->getTableColumns();
        $emailExpr = in_array('email', $columns, true) ? 'c.email' : "''";
        $projectExpr = in_array('project_type', $columns, true) ? 'c.project_type' : 'c.service';
        $messageExpr = in_array('message', $columns, true) ? 'c.message' : 'c.description';
        $createdExpr = in_array('created_at', $columns, true) ? 'c.created_at' : 'NULL';

        $stmt = $this->db->query(
            "SELECT c.id, c.name, $emailExpr AS email, c.country, c.phone, c.service, $projectExpr AS project_type,
                    c.description, $messageExpr AS message, c.status, $createdExpr AS created_at,
                    c.support_id, u.name AS support_name
             FROM contacts c
             LEFT JOIN users u ON u.id = c.support_id
             ORDER BY c.id DESC"
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $columns = $this->getTableColumns();
        $emailExpr = in_array('email', $columns, true) ? 'c.email' : "''";
        $projectExpr = in_array('project_type', $columns, true) ? 'c.project_type' : 'c.service';
        $messageExpr = in_array('message', $columns, true) ? 'c.message' : 'c.description';

        $stmt = $this->db->prepare(
            "SELECT c.*, $emailExpr AS email, $projectExpr AS project_type, $messageExpr AS message, u.name AS support_name
             FROM contacts c
             LEFT JOIN users u ON u.id = c.support_id
             WHERE c.id = :id LIMIT 1"
        );
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getTableColumns()
    {
        if (is_array($this->columns)) {
            return $this->columns;
        }

        $stmt = $this->db->query("SHOW COLUMNS FROM contacts");
        $this->columns = array_map(function ($row) {
            return $row['Field'];
        }, $stmt->fetchAll(PDO::FETCH_ASSOC));

        return $this->columns;
    }

    public function updateStatus($id, $status)
    {
        $stmt = $this->db->prepare("UPDATE contacts SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM contacts WHERE id = :id");
        return $stmt->execute([':id' => $id]) && $stmt->rowCount() > 0;
    }

    public function assignSupport($id, $supportId)
    {
        $stmt = $this->db->prepare("UPDATE contacts SET support_id = :support_id WHERE id = :id");
        $stmt->execute([':support_id' => $supportId, ':id' => $id]);
        return $stmt->rowCount() > 0;
    }
}
