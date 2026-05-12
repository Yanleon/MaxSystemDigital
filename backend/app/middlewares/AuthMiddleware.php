<?php

class AuthMiddleware
{
    public static function startSession(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
        if (PHP_VERSION_ID >= 70300) {
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',
                'secure' => $secure,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
        } else {
            session_set_cookie_params(0, '/; samesite=Lax', '', $secure, true);
        }

        session_start();
    }

    public static function sendNoCacheHeaders(): void
    {
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
    }

    public static function requireAuth(): void
    {
        self::startSession();
        self::sendNoCacheHeaders();

        if (empty($_SESSION['user']) || empty($_SESSION['user']['id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'No autenticado']);
            exit;
        }
    }

    public static function requireAdmin(): void
    {
        self::requireAuth();

        $role = $_SESSION['user']['role'] ?? '';
        $roleNormalized = strtolower(trim((string) $role));
        $allowedRoles = ['admin', 'super admin', 'superadmin'];

        if (!in_array($roleNormalized, $allowedRoles, true)) {
            http_response_code(403);
            echo json_encode(['error' => 'Sin permisos']);
            exit;
        }
    }
}
