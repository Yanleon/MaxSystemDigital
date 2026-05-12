<?php

require_once __DIR__ . '/../Models/Cliente.php';

class ClientController
{
    public function index()
    {
        $model = new Cliente();
        echo json_encode([
            'status' => 'OK',
            'clients' => $model->getAll(),
            'section' => $model->getSection()
        ]);
    }

    public function section()
    {
        $model = new Cliente();
        echo json_encode([
            'status' => 'OK',
            'section' => $model->getSection()
        ]);
    }

    public function saveSection()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }

        if (empty($input['title']) || empty($input['subtitle'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Titulo y subtitulo son requeridos']);
            return;
        }

        $model = new Cliente();
        $ok = $model->saveSection([
            'kicker' => trim($input['kicker'] ?? 'CLIENTES'),
            'title' => trim($input['title']),
            'subtitle' => trim($input['subtitle'])
        ]);

        if ($ok) {
            echo json_encode(['status' => 'OK', 'message' => 'Seccion actualizada']);
            return;
        }

        http_response_code(500);
        echo json_encode(['error' => 'No se pudo guardar la seccion']);
    }

    public function store()
    {
        $input = json_decode(file_get_contents("php://input"), true);

        if (empty($input['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Nombre requerido']);
            return;
        }

        $model = new Cliente();

        if ($model->save($input)) {
            echo json_encode([
                'status' => 'OK',
                'message' => 'Cliente guardado'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Error al guardar cliente']);
        }
    }

    public function update($id)
    {
        $input = json_decode(file_get_contents("php://input"), true);

        if (empty($input['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Nombre requerido']);
            return;
        }

        $model = new Cliente();

        if ($model->update($id, $input)) {
            echo json_encode(['status' => 'OK', 'message' => 'Cliente actualizado']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Cliente no encontrado']);
        }
    }

    public function destroy($id)
    {
        $model = new Cliente();

        if ($model->delete($id)) {
            echo json_encode(['status' => 'OK']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Cliente no encontrado']);
        }
    }
}
