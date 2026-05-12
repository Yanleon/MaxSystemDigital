<?php

spl_autoload_register(function ($class) {

    $baseDir = __DIR__ . '/';

    $paths = [
        'controllers/',
        'Models/',
        'middlewares/',
        'Helpers/',
        'database/',
    ];

    foreach ($paths as $path) {
        $file = $baseDir . $path . $class . '.php';

        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }

    error_log("Autoload: clase no encontrada → $class");
});
