<?php

class Connection
{
    private static $instance = null;

    public static function connect()
    {
        if (self::$instance === null) {
            try {
                self::$instance = new PDO(
                    "mysql:host=localhost;dbname=compu_yan;charset=utf8mb4",
                    "root",
                    "",
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                    ]
                );
            } catch (PDOException $e) {
                $config = require __DIR__ . '/../../config/app.php';
                $debug = (bool)($config['debug'] ?? false);
                http_response_code(500);
                $payload = ["error" => "Error de conexión a la base de datos"];
                if ($debug) {
                    $payload['detail'] = $e->getMessage();
                }
                echo json_encode($payload);
                exit;
            }
        }

        return self::$instance;
    }
}
