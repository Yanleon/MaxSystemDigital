<?php

class Validator
{
    public static function sanitize(string $value): string
    {
        return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
    }

    public static function required(array $data, array $fields): array
    {
        foreach ($fields as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                return [
                    'valid' => false,
                    'error' => "El campo '$field' es obligatorio"
                ];
            }
        }
        return ['valid' => true];
    }
}
