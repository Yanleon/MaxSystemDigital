<?php

require_once __DIR__ . '/../Models/HeroModel.php';
require_once __DIR__ . '/../Helpers/UploadSecurity.php';

class HeroController
{
    public function show()
    {
        $model = new HeroModel();
        echo json_encode([
            'status' => 'OK',
            'hero' => $model->get()
        ]);
    }

    public function update()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }

        $logo = trim($input['logo'] ?? '');
        if (!empty($_FILES['logo_file']['tmp_name'])) {
            $upload = $this->handleUpload($_FILES['logo_file'], 'logo_', 'logos');
            if (!$upload['ok']) {
                http_response_code(400);
                echo json_encode(['error' => $upload['error']]);
                return;
            }
            $logo = $upload['path'];
        }

        $image = trim($input['image'] ?? '');
        if (!empty($_FILES['image_file']['tmp_name'])) {
            $upload = $this->handleUpload($_FILES['image_file'], 'image_', 'hero');
            if (!$upload['ok']) {
                http_response_code(400);
                echo json_encode(['error' => $upload['error']]);
                return;
            }
            $image = $upload['path'];
        }

        $required = ['brand_name', 'badge', 'title', 'subtitle'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Falta campo: $field"]);
                return;
            }
        }

        $data = [
            'brand_name' => trim($input['brand_name']),
            'logo' => $logo,
            'badge' => trim($input['badge']),
            'title' => trim($input['title']),
            'subtitle' => trim($input['subtitle']),
            'image' => $image,
            'cta_primary_text' => trim($input['cta_primary_text'] ?? 'Solicitar cotizacion'),
            'cta_primary_link' => trim($input['cta_primary_link'] ?? '#contacto'),
            'cta_secondary_text' => trim($input['cta_secondary_text'] ?? 'Ver servicios'),
            'cta_secondary_link' => trim($input['cta_secondary_link'] ?? '#servicios'),
            'metric_top_value' => trim($input['metric_top_value'] ?? '+120%'),
            'metric_top_text' => trim($input['metric_top_text'] ?? 'Mejoras en alcance digital'),
            'metric_bottom_value' => trim($input['metric_bottom_value'] ?? '24/7'),
            'metric_bottom_text' => trim($input['metric_bottom_text'] ?? 'Canales de atencion activa')
        ];

        $model = new HeroModel();
        $model->saveOrUpdate($data);

        echo json_encode([
            'status' => 'OK',
            'message' => 'Hero actualizado'
        ]);
    }

    private function handleUpload($file, $prefix, $folder)
    {
        if (empty($file['tmp_name'])) {
            return ['ok' => false, 'error' => 'Archivo invalido'];
        }

        $uploadDir = __DIR__ . '/../../public/uploads/' . $folder;
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $check = UploadSecurity::validateImage($file);
        if (!$check['ok']) {
            return $check;
        }
        $ext = $check['ext'];

        $filename = uniqid($prefix, true) . '.' . $ext;
        $dest = $uploadDir . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            return ['ok' => false, 'error' => 'No se pudo guardar el archivo'];
        }

        return ['ok' => true, 'path' => '/uploads/' . $folder . '/' . $filename];
    }
}
