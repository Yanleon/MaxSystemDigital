<?php

require_once __DIR__ . '/../Models/UserModel.php';
require_once __DIR__ . '/../database/Connection.php';

class UserController
{
    public function index()
    {
        $model = new UserModel();
        echo json_encode([
            'status' => 'OK',
            'users' => $model->getAll()
        ]);
    }

    public function store()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }

        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'admin';

        if ($name === '' || $email === '' || $password === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Nombre, email y contraseña son requeridos']);
            return;
        }

        $model = new UserModel();

        if ($model->findByEmail($email)) {
            http_response_code(400);
            echo json_encode(['error' => 'El email ya existe']);
            return;
        }

        if ($model->create([
            'name' => $name,
            'email' => $email,
            'password' => password_hash($password, PASSWORD_BCRYPT),
            'role' => $role
        ])) {
            echo json_encode(['status' => 'OK', 'message' => 'Usuario creado']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo crear el usuario']);
        }
    }

    public function destroy($id)
    {
        $model = new UserModel();
        if ($model->delete($id)) {
            echo json_encode(['status' => 'OK']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Usuario no encontrado']);
        }
    }

    public function update($id)
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST ?? [];
        }

        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? null;

        if ($name === '' || $email === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Nombre y email son requeridos']);
            return;
        }

        $model = new UserModel();
        $existing = $model->getById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Usuario no encontrado']);
            return;
        }

        $duplicate = $model->findByEmail($email);
        if ($duplicate && (int)$duplicate['id'] !== (int)$id) {
            http_response_code(400);
            echo json_encode(['error' => 'El email ya existe']);
            return;
        }

        $data = [
            'name' => $name,
            'email' => $email,
            'password' => $existing['password'],
            'role' => $existing['role']
        ];

        if ($password !== '') {
            $data['password'] = password_hash($password, PASSWORD_BCRYPT);
        }
        if ($role !== null) {
            $data['role'] = $role;
        }

        if ($model->update($id, $data)) {
            echo json_encode(['status' => 'OK', 'message' => 'Usuario actualizado']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo actualizar el usuario']);
        }
    }
}
