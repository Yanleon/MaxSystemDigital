<?php
// backend/config/app.php

return [
    'app_name' => 'MaxSystemDigital',
    'environment' => 'production', // development | production
    'debug' => false,

    'timezone' => 'America/Bogota',

    'urls' => [
        'base' => '/',
        'backend' => '/backend/',
        'api' => '/backend/public/'
    ]
];
