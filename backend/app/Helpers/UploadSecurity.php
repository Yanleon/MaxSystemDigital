<?php

class UploadSecurity
{
    private const MAX_BYTES = 5 * 1024 * 1024;
    private const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp'];
    private const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

    public static function validateImage(array $file): array
    {
        if (empty($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return ['ok' => false, 'error' => 'Archivo invalido'];
        }

        if (($file['size'] ?? 0) <= 0 || ($file['size'] ?? 0) > self::MAX_BYTES) {
            return ['ok' => false, 'error' => 'Tamano de archivo no permitido'];
        }

        $ext = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION));
        if (!in_array($ext, self::ALLOWED_EXT, true)) {
            return ['ok' => false, 'error' => 'Extension no permitida'];
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime, self::ALLOWED_MIME, true)) {
            return ['ok' => false, 'error' => 'Tipo de archivo no permitido'];
        }

        return ['ok' => true, 'ext' => $ext];
    }
}
