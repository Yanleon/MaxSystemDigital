<?php

require_once __DIR__ . '/../Models/Portafolio.php';
require_once __DIR__ . '/../Helpers/UploadSecurity.php';

class PortfolioController
{
    public function index()
    {
        $model = new Portafolio();
        echo json_encode([
            'status' => 'OK',
            'portfolio' => $model->getAll()
        ]);
    }

    public function store()
    {
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

        if (empty($input['title']) || empty($input['description']) || empty($image)) {
            http_response_code(400);
            echo json_encode(['error' => 'Título, descripción e imagen son requeridos']);
            return;
        }

        $model = new Portafolio();

        if ($model->create([
            'title' => $input['title'],
            'image' => $image,
            'description' => $input['description']
        ])) {
            echo json_encode([
                'status' => 'OK',
                'message' => 'Proyecto guardado'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Error al guardar portafolio']);
        }
    }

    public function show($id)
    {
        $model = new Portafolio();
        $item = $model->getById($id);
        if (!$item) {
            http_response_code(404);
            echo json_encode(['error' => 'Proyecto no encontrado']);
            return;
        }
        echo json_encode(['status' => 'OK', 'project' => $item]);
    }

    public function update($id)
    {
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

        if (empty($input['title']) || empty($input['description'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Título y descripción son requeridos']);
            return;
        }

        if ($this->model()->update($id, [
            'title' => $input['title'],
            'image' => $image,
            'description' => $input['description']
        ])) {
            echo json_encode(['status' => 'OK', 'message' => 'Proyecto actualizado']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Proyecto no encontrado']);
        }
    }

    public function destroy($id)
    {
        if ($this->model()->delete($id)) {
            echo json_encode(['status' => 'OK']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Proyecto no encontrado']);
        }
    }

    private $instance;
    private function model()
    {
        if (!$this->instance) {
            $this->instance = new Portafolio();
        }
        return $this->instance;
    }

    private function handleImageUpload($file)
    {
        if (empty($file['tmp_name'])) {
            return ['ok' => false, 'error' => 'Archivo de imagen inválido'];
        }

        $uploadDir = __DIR__ . '/../../public/uploads/portfolio';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $check = UploadSecurity::validateImage($file);
        if (!$check['ok']) {
            return $check;
        }
        $ext = $check['ext'];
        $filename = uniqid('portfolio_', true) . '.' . $ext;
        $dest = $uploadDir . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            return ['ok' => false, 'error' => 'No se pudo guardar la imagen'];
        }

        $publicPath = '/uploads/portfolio/' . $filename;
        return ['ok' => true, 'path' => $publicPath];
    }
}
