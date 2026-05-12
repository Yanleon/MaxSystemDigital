<?php

require_once __DIR__ . '/../Models/SeoModel.php';

class SeoController
{
    public function show()
    {
        $model = new SeoModel();
        $seo = $model->get();
        echo json_encode([
            'status' => 'OK',
            'seo' => $seo
        ]);
    }

    public function update()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) {
            http_response_code(400);
            echo json_encode(['error' => 'Payload invalido']);
            return;
        }

        $data = [
            'meta_title' => trim($input['meta_title'] ?? ''),
            'meta_description' => trim($input['meta_description'] ?? ''),
            'meta_keywords' => trim($input['meta_keywords'] ?? ''),
            'og_title' => trim($input['og_title'] ?? ''),
            'og_description' => trim($input['og_description'] ?? ''),
            'canonical_url' => trim($input['canonical_url'] ?? ''),
            'robots' => trim($input['robots'] ?? 'index,follow'),
            'schema_json' => trim($input['schema_json'] ?? '')
        ];

        if (strlen($data['meta_title']) > 160) {
            http_response_code(400);
            echo json_encode(['error' => 'El meta title no puede superar 160 caracteres']);
            return;
        }

        if (!empty($data['schema_json'])) {
            json_decode($data['schema_json'], true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode(['error' => 'Schema JSON invalido']);
                return;
            }
        }

        $model = new SeoModel();
        $model->saveOrUpdate($data);

        echo json_encode([
            'status' => 'OK',
            'message' => 'Configuracion SEO actualizada'
        ]);
    }
}
