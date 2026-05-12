<?php

require_once __DIR__ . '/../Models/ServiceModel.php';
require_once __DIR__ . '/../Helpers/UploadSecurity.php';

class ServiceController
{
    private $model;

    public function __construct()
    {
        $this->model = new ServiceModel();
    }

    public function index()
    {
        header('Content-Type: application/json');

        echo json_encode([
            'status' => 'OK',
            'services' => $this->model->getAll()
        ]);
        exit;
    }

    public function show($id)
    {
        $service = $this->model->getById($id);

        if (!$service) {
            http_response_code(404);
            echo json_encode(['error' => 'Servicio no encontrado']);
            return;
        }

        echo json_encode(['status' => 'OK', 'service' => $service]);
    }

    public function store()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }

        $icon = $input['icon'] ?? '';
        if (!empty($_FILES['icon_file']['tmp_name'])) {
            $upload = $this->handleIconUpload($_FILES['icon_file']);
            if ($upload['ok']) {
                $icon = $upload['path'];
            } else {
                http_response_code(400);
                echo json_encode(['error' => $upload['error']]);
                return;
            }
        }

        if (empty($input['name']) || empty($input['description']) || empty($icon)) {
            http_response_code(400);
            echo json_encode(['error' => 'Nombre, descripción e ícono son requeridos']);
            return;
        }

        if ($this->model->create([
            'name' => $input['name'],
            'description' => $input['description'],
            'icon' => $icon
        ])) {
            echo json_encode(['status' => 'OK', 'message' => 'Servicio creado']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo crear el servicio']);
        }
    }

    public function update($id)
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }

        $icon = $input['icon'] ?? '';
        if (!empty($_FILES['icon_file']['tmp_name'])) {
            $upload = $this->handleIconUpload($_FILES['icon_file']);
            if ($upload['ok']) {
                $icon = $upload['path'];
            } else {
                http_response_code(400);
                echo json_encode(['error' => $upload['error']]);
                return;
            }
        }

        if (empty($input['name']) || empty($input['description']) || empty($icon)) {
            http_response_code(400);
            echo json_encode(['error' => 'Nombre, descripción e ícono son requeridos']);
            return;
        }

        if ($this->model->update($id, [
            'name' => $input['name'],
            'description' => $input['description'],
            'icon' => $icon
        ])) {
            echo json_encode(['status' => 'OK', 'message' => 'Servicio actualizado']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Servicio no encontrado']);
        }
    }

    public function destroy($id)
    {
        if ($this->model->delete($id)) {
            echo json_encode(['status' => 'OK']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Servicio no encontrado']);
        }
    }

    private function handleIconUpload($file)
    {
        if (empty($file['tmp_name'])) {
            return ['ok' => false, 'error' => 'Archivo de ícono inválido'];
        }

        $uploadDir = __DIR__ . '/../../public/uploads/services';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $check = UploadSecurity::validateImage($file);
        if (!$check['ok']) {
            return $check;
        }
        $ext = $check['ext'];
        $filename = uniqid('icon_', true) . '.' . $ext;
        $dest = $uploadDir . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            return ['ok' => false, 'error' => 'No se pudo guardar el ícono'];
        }

        $publicPath = '/uploads/services/' . $filename;
        return ['ok' => true, 'path' => $publicPath];
    }
}
