<?php

require_once __DIR__ . '/../Models/AboutModel.php';
require_once __DIR__ . '/../database/Connection.php';
require_once __DIR__ . '/../Helpers/UploadSecurity.php';

class AboutController
{
    public function show()
    {
        $model = new AboutModel();
        $about = $model->get();
        echo json_encode([
            'status' => 'OK',
            'about' => $about
        ]);
    }

    public function update()
    {
        // Soporta JSON o multipart
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }

        $image = $input['image'] ?? '';
        if (!empty($_FILES['image_file']['tmp_name'])) {
            $upload = $this->handleImageUpload($_FILES['image_file']);
            if ($upload['ok']) {
                $image = $upload['path'];
            } else {
                http_response_code(400);
                echo json_encode(['error' => $upload['error']]);
                return;
            }
        }

        $required = ['title', 'paragraph1', 'paragraph2'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Falta campo: $field"]);
                return;
            }
        }

        $data = [
            'title' => $input['title'],
            'paragraph1' => $input['paragraph1'],
            'paragraph2' => $input['paragraph2'],
            'image' => $image,
            'feature1_icon' => $input['feature1_icon'] ?? '',
            'feature1_title' => $input['feature1_title'] ?? '',
            'feature2_icon' => $input['feature2_icon'] ?? '',
            'feature2_title' => $input['feature2_title'] ?? '',
            'feature3_icon' => $input['feature3_icon'] ?? '',
            'feature3_title' => $input['feature3_title'] ?? '',
            'feature4_icon' => $input['feature4_icon'] ?? '',
            'feature4_title' => $input['feature4_title'] ?? ''
        ];

        $model = new AboutModel();
        $model->saveOrUpdate($data);

        echo json_encode(['status' => 'OK', 'message' => 'Sobre Nosotros actualizado']);
    }

    private function handleImageUpload($file)
    {
        if (empty($file['tmp_name'])) {
            return ['ok' => false, 'error' => 'Archivo de imagen inválido'];
        }

        $uploadDir = __DIR__ . '/../../public/uploads/about';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $check = UploadSecurity::validateImage($file);
        if (!$check['ok']) {
            return $check;
        }
        $ext = $check['ext'];
        $filename = uniqid('about_', true) . '.' . $ext;
        $dest = $uploadDir . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            return ['ok' => false, 'error' => 'No se pudo guardar la imagen'];
        }

        $publicPath = '/uploads/about/' . $filename;
        return ['ok' => true, 'path' => $publicPath];
    }
}
