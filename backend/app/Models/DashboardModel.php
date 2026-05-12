<?php

require_once __DIR__ . '/../database/Connection.php';

class DashboardModel
{
    private $db;

    public function __construct()
    {
        $this->db = Connection::connect();
    }

    public function stats()
    {
        return [
            'contacts' => $this->db->query("SELECT COUNT(*) FROM contacts")->fetchColumn(),
            'services' => $this->db->query("SELECT COUNT(*) FROM services")->fetchColumn(),
            'clients'  => $this->db->query("SELECT COUNT(*) FROM clients")->fetchColumn()
        ];
    }
}
