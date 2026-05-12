<?php

require_once __DIR__ . '/../database/Connection.php';

class FooterModel
{
    private $db;

    public function __construct()
    {
        $this->db = Connection::connect();
    }

    public function get()
    {
        $stmt = $this->db->query("SELECT * FROM footer LIMIT 1");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: [];
    }

    public function saveOrUpdate($data)
    {
        $existing = $this->get();
        if ($existing) {
            $sql = "UPDATE footer SET 
                        brand_title = :brand_title,
                        tagline = :tagline,
                        facebook = :facebook,
                        instagram = :instagram,
                        twitter = :twitter,
                        whatsapp = :whatsapp,
                        email = :email,
                        address = :address,
                        phone = :phone,
                        footer_note = :footer_note,
                        link_inicio = :link_inicio,
                        link_nosotros = :link_nosotros,
                        link_servicios = :link_servicios,
                        link_trabajos = :link_trabajos,
                        link_tienda = :link_tienda
                    WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $data['id'] = $existing['id'];
            $stmt->execute($data);
        } else {
            $sql = "INSERT INTO footer (
                        brand_title, tagline, facebook, instagram, twitter, whatsapp,
                        email, address, phone, footer_note,
                        link_inicio, link_nosotros, link_servicios, link_trabajos, link_tienda
                    ) VALUES (
                        :brand_title, :tagline, :facebook, :instagram, :twitter, :whatsapp,
                        :email, :address, :phone, :footer_note,
                        :link_inicio, :link_nosotros, :link_servicios, :link_trabajos, :link_tienda
                    )";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($data);
        }
    }
}
