<?php

require_once __DIR__ . '/../Models/PlanModel.php';

class PlanController
{
    private $model;

    public function __construct()
    {
        $this->model = new PlanModel();
    }

    public function index()
    {
        $onlyActive = isset($_GET['active']) && $_GET['active'] === '1';
        echo json_encode([
            'status' => 'OK',
            'plans' => $this->model->getAll($onlyActive)
        ]);
    }

    public function show($id)
    {
        $plan = $this->model->getById($id);
        if (!$plan) {
            http_response_code(404);
            echo json_encode(['error' => 'Plan no encontrado']);
            return;
        }

        echo json_encode(['status' => 'OK', 'plan' => $plan]);
    }

    public function store()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }

        if (empty($input['name']) || empty($input['description'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Nombre y descripción son requeridos']);
            return;
        }

        $benefits = $input['benefits'] ?? [];
        if (is_array($benefits)) {
            $benefits = json_encode(array_values(array_filter($benefits)), JSON_UNESCAPED_UNICODE);
        }

        $ok = $this->model->create([
            'name' => trim($input['name']),
            'description' => trim($input['description']),
            'benefits' => is_string($benefits) ? $benefits : '[]',
            'price_text' => trim($input['price_text'] ?? 'Cotizacion personalizada'),
            'is_active' => isset($input['is_active']) ? (int) ((bool) $input['is_active']) : 1
        ]);

        if ($ok) {
            echo json_encode(['status' => 'OK', 'message' => 'Plan creado']);
            return;
        }

        http_response_code(500);
        echo json_encode(['error' => 'No se pudo crear el plan']);
    }

    public function update($id)
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }

        if (empty($input['name']) || empty($input['description'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Nombre y descripción son requeridos']);
            return;
        }

        $benefits = $input['benefits'] ?? [];
        if (is_array($benefits)) {
            $benefits = json_encode(array_values(array_filter($benefits)), JSON_UNESCAPED_UNICODE);
        }

        $updated = $this->model->update($id, [
            'name' => trim($input['name']),
            'description' => trim($input['description']),
            'benefits' => is_string($benefits) ? $benefits : '[]',
            'price_text' => trim($input['price_text'] ?? 'Cotizacion personalizada'),
            'is_active' => isset($input['is_active']) ? (int) ((bool) $input['is_active']) : 0
        ]);

        if ($updated) {
            echo json_encode(['status' => 'OK', 'message' => 'Plan actualizado']);
            return;
        }

        http_response_code(404);
        echo json_encode(['error' => 'Plan no encontrado']);
    }

    public function destroy($id)
    {
        if ($this->model->delete($id)) {
            echo json_encode(['status' => 'OK']);
            return;
        }

        http_response_code(404);
        echo json_encode(['error' => 'Plan no encontrado']);
    }
}
