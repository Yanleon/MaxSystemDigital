<?php

require_once __DIR__ . '/../Models/FooterModel.php';
require_once __DIR__ . '/../database/Connection.php';

class FooterController
{
    public function show()
    {
        $model = new FooterModel();
        $footer = $model->get();
        echo json_encode([
            'status' => 'OK',
            'footer' => $footer
        ]);
    }

    public function update()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }

        $required = ['brand_title', 'tagline', 'email', 'address', 'phone', 'footer_note'];
        foreach ($required as $field) {
            if (!isset($input[$field]) || trim($input[$field]) === '') {
                http_response_code(400);
                echo json_encode(['error' => "Falta campo: $field"]);
                return;
            }
        }

        $model = new FooterModel();
        $model->saveOrUpdate([
            'brand_title' => $input['brand_title'],
            'tagline' => $input['tagline'],
            'facebook' => $input['facebook'] ?? '',
            'instagram' => $input['instagram'] ?? '',
            'twitter' => $input['twitter'] ?? '',
            'whatsapp' => $input['whatsapp'] ?? '',
            'email' => $input['email'],
            'address' => $input['address'],
            'phone' => $input['phone'],
            'footer_note' => $input['footer_note'],
            'link_inicio' => $input['link_inicio'] ?? '#inicio',
            'link_nosotros' => $input['link_nosotros'] ?? '#nosotros',
            'link_servicios' => $input['link_servicios'] ?? '#servicios',
            'link_trabajos' => $input['link_trabajos'] ?? '#trabajos',
            'link_tienda' => $input['link_tienda'] ?? '#tienda'
        ]);

        echo json_encode(['status' => 'OK', 'message' => 'Footer actualizado']);
    }
}
