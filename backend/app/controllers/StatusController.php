<?php
// backend/app/Controllers/StatusController.php

class StatusController
{
    public function index()
    {
        return [
            'status' => 'OK',
            'service' => 'API MaxSystemDigital',
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
}
