<?php

require_once __DIR__ . '/../Models/DashboardModel.php';
require_once __DIR__ . '/../database/Connection.php';

class DashboardController
{
    public function stats()
    {
        $model = new DashboardModel();
        echo json_encode([
            'status' => 'OK',
            'stats' => $model->stats()
        ]);
    }
}
