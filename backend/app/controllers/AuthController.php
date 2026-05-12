<?php

require_once __DIR__ . '/../Models/UserModel.php';
require_once __DIR__ . '/../middlewares/AuthMiddleware.php';

class AuthController
{
    private const MAX_LOGIN_ATTEMPTS = 5;
    private const LOGIN_BLOCK_SECONDS = 60;

    public function login()
    {
        AuthMiddleware::startSession();
        $input = json_decode(file_get_contents("php://input"), true);

        $email = isset($input['email']) ? trim($input['email']) : '';
        $password = isset($input['password']) ? trim($input['password']) : '';

        if ($email === '' || $password === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Las credenciales ingresadas no son válidas.']);
            return;
        }

        $key = $this->getRateLimitKey($email);
        $rateLimit = $this->getRateLimitState($key);
        if ($rateLimit['blocked_until'] > time()) {
            http_response_code(429);
            echo json_encode(['error' => 'Demasiados intentos. Intenta nuevamente en 1 minuto.']);
            return;
        }

        $userModel = new UserModel();
        $user = $userModel->findByEmail($email);

        $validPassword = false;

        // Permite hash bcrypt ($2y$/ $2b$) o texto plano durante desarrollo.
        if ($user) {
            $storedOriginal = trim((string) $user['password']);

            // 1) Verificar directamente con lo que haya en la BD (soporta $2y$ y $2b$ en PHP 8)
            if ($storedOriginal !== '' && password_verify($password, $storedOriginal)) {
                $validPassword = true;
            }

            // 2) Si es $2b$, convertir a $2y$ y volver a probar (por compatibilidad)
            if (!$validPassword && substr($storedOriginal, 0, 4) === '$2b$') {
                $converted = '$2y$' . substr($storedOriginal, 4);
                if (password_verify($password, $converted)) {
                    $validPassword = true;
                }
            }

            // 3) Último recurso: comparar texto plano (solo útil si la contraseña se guardó sin hash)
            if (!$validPassword && hash_equals($storedOriginal, $password)) {
                $validPassword = true;
            }
        }

        if (!$validPassword) {
            $this->registerFailedAttempt($key, $rateLimit['attempts']);
            $this->audit('LOGIN_FAIL', ['email' => $email]);
            http_response_code(401);
            echo json_encode(['error' => 'Las credenciales ingresadas no son válidas.']);
            return;
        }

        session_regenerate_id(true);
        $_SESSION['user'] = [
            'id' => $user['id'],
            'name' => $user['name'],
            'role' => $user['role']
        ];
        $_SESSION['admin'] = ($user['role'] === 'admin');
        $this->clearRateLimit($key);
        $this->audit('LOGIN_OK', ['user_id' => (int) $user['id'], 'email' => $email]);

        echo json_encode([
            'status' => 'OK',
            'message' => 'Login exitoso'
        ]);
    }

    public function logout()
    {
        AuthMiddleware::startSession();
        $userId = $_SESSION['user']['id'] ?? null;
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', $params['secure'] ?? false, $params['httponly'] ?? true);
        }
        session_destroy();
        session_start();
        session_regenerate_id(true);
        session_write_close();
        $this->audit('LOGOUT', ['user_id' => $userId]);
        echo json_encode(['status' => 'OK', 'message' => 'Sesión cerrada']);
    }

    public function me()
    {
        AuthMiddleware::requireAuth();
        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode(['error' => 'No autenticado']);
            return;
        }
        echo json_encode([
            'status' => 'OK',
            'user' => $_SESSION['user'],
            'admin' => $_SESSION['admin'] ?? false
        ]);
    }

    private function getRateLimitKey(string $email): string
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        return hash('sha256', strtolower($email) . '|' . $ip);
    }

    private function getRateLimitState(string $key): array
    {
        if (!isset($_SESSION['login_rate_limit'])) {
            $_SESSION['login_rate_limit'] = [];
        }
        $state = $_SESSION['login_rate_limit'][$key] ?? ['attempts' => 0, 'blocked_until' => 0];
        return [
            'attempts' => (int) ($state['attempts'] ?? 0),
            'blocked_until' => (int) ($state['blocked_until'] ?? 0)
        ];
    }

    private function registerFailedAttempt(string $key, int $currentAttempts): void
    {
        $attempts = $currentAttempts + 1;
        $blockedUntil = 0;
        if ($attempts >= self::MAX_LOGIN_ATTEMPTS) {
            $blockedUntil = time() + self::LOGIN_BLOCK_SECONDS;
            $attempts = 0;
        }
        $_SESSION['login_rate_limit'][$key] = [
            'attempts' => $attempts,
            'blocked_until' => $blockedUntil
        ];
    }

    private function clearRateLimit(string $key): void
    {
        unset($_SESSION['login_rate_limit'][$key]);
    }

    private function audit(string $event, array $context = []): void
    {
        $dir = __DIR__ . '/../../storage/logs';
        if (!is_dir($dir)) {
            @mkdir($dir, 0777, true);
        }

        $line = sprintf(
            "[%s] %s ip=%s ctx=%s\n",
            date('Y-m-d H:i:s'),
            $event,
            $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            json_encode($context, JSON_UNESCAPED_UNICODE)
        );
        @file_put_contents($dir . '/security.log', $line, FILE_APPEND);
    }
}
