<?php

require_once __DIR__ . '/../Models/ContactModel.php';
require_once __DIR__ . '/../Models/UserModel.php';

class ContactController
{
    public function store()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }

        $nombre = trim($input['nombre'] ?? '');
        $correo = trim($input['correo'] ?? '');
        $telefono = trim($input['telefono'] ?? ($input['celular'] ?? ''));
        $tipoProyecto = trim($input['tipo_proyecto'] ?? ($input['servicio'] ?? ''));
        $mensaje = trim($input['mensaje'] ?? ($input['descripcion'] ?? ''));

        $errors = [];
        if ($nombre === '') $errors['nombre'] = 'El nombre es requerido';
        if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) $errors['correo'] = 'Correo invalido';
        if ($telefono === '') $errors['telefono'] = 'El telefono es requerido';
        if ($tipoProyecto === '') $errors['tipo_proyecto'] = 'El tipo de proyecto es requerido';
        if ($mensaje === '') $errors['mensaje'] = 'El mensaje es requerido';

        if (!empty($errors)) {
            http_response_code(422);
            echo json_encode([
                'status' => 'ERROR',
                'errors' => $errors
            ]);
            return;
        }

        $input['nombre'] = $nombre;
        $input['correo'] = $correo;
        $input['telefono'] = $telefono;
        $input['tipo_proyecto'] = $tipoProyecto;
        $input['mensaje'] = $mensaje;
        $input['celular'] = $telefono;
        $input['servicio'] = $tipoProyecto;
        $input['descripcion'] = $mensaje;
        $input['pais'] = trim($input['pais'] ?? 'Colombia');

        $model = new ContactModel();

        $result = $model->save($input);

        if ($result === true) {
            echo json_encode([
                'status' => 'OK',
                'message' => 'Mensaje enviado correctamente'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'ERROR',
                'error' => 'No se pudo guardar el mensaje'
            ]);
        }
    }

 public function index()
{
    $model = new ContactModel();
    echo json_encode([
        'status' => 'OK',
        'contacts' => $model->getAll()
    ]);
}

public function show($id)
{
    $model = new ContactModel();
    $contact = $model->getById($id);

    if (!$contact) {
        http_response_code(404);
        echo json_encode(['error' => 'Contacto no encontrado']);
        return;
    }

    echo json_encode([
        'status' => 'OK',
        'contact' => $contact
    ]);
}

    public function destroy($id)
    {
        $model = new ContactModel();

        if ($model->delete($id)) {
            echo json_encode(['status' => 'OK']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Contacto no encontrado']);
        }
    }

    public function updateStatus($id)
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }

        $status = $input['status'] ?? '';
        $allowed = ['abierto', 'contactado', 'pendiente', 'finalizado'];
        if (!in_array($status, $allowed, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'Estado inválido']);
            return;
        }

        $model = new ContactModel();
        if ($model->updateStatus($id, $status)) {
            echo json_encode(['status' => 'OK']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Contacto no encontrado']);
        }
    }

    public function assignSupport($id)
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }

        $supportId = $input['support_id'] ?? null;
        if (empty($supportId)) {
            http_response_code(400);
            echo json_encode(['error' => 'support_id requerido']);
            return;
        }

        $userModel = new UserModel();
        if (!$userModel->isSupport($supportId)) {
            http_response_code(400);
            echo json_encode(['error' => 'El usuario no es soporte o no existe']);
            return;
        }

        $model = new ContactModel();
        if ($model->assignSupport($id, $supportId)) {
            echo json_encode(['status' => 'OK']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Contacto no encontrado']);
        }
    }

}

