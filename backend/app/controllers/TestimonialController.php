<?php

require_once __DIR__ . '/../Models/TestimonialModel.php';

class TestimonialController
{
    private $model;

    public function __construct()
    {
        $this->model = new TestimonialModel();
    }

    public function index()
    {
        $onlyActive = isset($_GET['active']) && $_GET['active'] === '1';
        echo json_encode([
            'status' => 'OK',
            'testimonials' => $this->model->getAll($onlyActive)
        ]);
    }

    public function show($id)
    {
        $item = $this->model->getById($id);
        if (!$item) {
            http_response_code(404);
            echo json_encode(['error' => 'Testimonio no encontrado']);
            return;
        }

        echo json_encode(['status' => 'OK', 'testimonial' => $item]);
    }

    public function store()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }

        if (empty($input['author_name']) || empty($input['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Autor y contenido son requeridos']);
            return;
        }

        $ok = $this->model->create([
            'author_name' => trim($input['author_name']),
            'author_role' => trim($input['author_role'] ?? ''),
            'content' => trim($input['content']),
            'is_active' => isset($input['is_active']) ? (int) ((bool) $input['is_active']) : 1
        ]);

        if ($ok) {
            echo json_encode(['status' => 'OK', 'message' => 'Testimonio creado']);
            return;
        }

        http_response_code(500);
        echo json_encode(['error' => 'No se pudo crear el testimonio']);
    }

    public function update($id)
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }

        if (empty($input['author_name']) || empty($input['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Autor y contenido son requeridos']);
            return;
        }

        $updated = $this->model->update($id, [
            'author_name' => trim($input['author_name']),
            'author_role' => trim($input['author_role'] ?? ''),
            'content' => trim($input['content']),
            'is_active' => isset($input['is_active']) ? (int) ((bool) $input['is_active']) : 0
        ]);

        if ($updated) {
            echo json_encode(['status' => 'OK', 'message' => 'Testimonio actualizado']);
            return;
        }

        http_response_code(404);
        echo json_encode(['error' => 'Testimonio no encontrado']);
    }

    public function destroy($id)
    {
        if ($this->model->delete($id)) {
            echo json_encode(['status' => 'OK']);
            return;
        }

        http_response_code(404);
        echo json_encode(['error' => 'Testimonio no encontrado']);
    }
}
