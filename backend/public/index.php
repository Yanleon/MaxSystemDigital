<?php

ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once __DIR__ . '/../app/autoload.php';

AuthMiddleware::sendNoCacheHeaders();

// Obtener método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Obtener URI limpia
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Detectar path base automaticamente (sirve en localhost y hosting)
$basePath = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');
$route = trim(str_replace($basePath, '', $uri), '/');

// Ruta por defecto
if ($route === '') {
    echo json_encode([
        'status' => 'OK',
        'service' => 'API MaxSystemDigital',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// ROUTES
switch ($route) {

    case 'services':
        $controller = new ServiceController();
        if ($method === 'GET') {
            $controller->index();
            exit;
        } elseif ($method === 'POST') {
            $controller->store();
            exit;
        }
        break;

    case 'contacts':
        $controller = new ContactController();
        if ($method === 'GET') {
            $controller->index();
            exit;
        } elseif ($method === 'POST') {
            $controller->store();
            exit;
        }
        break;
        
    case 'clients':
        $controller = new ClientController();
        if ($method === 'GET') {
            $controller->index();
            exit;
        } elseif ($method === 'POST') {
            $controller->store();
            exit;
        }
        break;

    case 'clients-section':
        $controller = new ClientController();
        if ($method === 'GET') {
            $controller->section();
            exit;
        } elseif ($method === 'POST') {
            $controller->saveSection();
            exit;
        } elseif ($method === 'PUT') {
            $controller->saveSection();
            exit;
        }
        break;

    case 'portfolio':
        $controller = new PortfolioController();
        if ($method === 'GET') {
            $controller->index();
            exit;
        } elseif ($method === 'POST') {
            $controller->store();
            exit;
        }
        break;

    case 'about':
        $controller = new AboutController();
        if ($method === 'GET') {
            $controller->show();
            exit;
        } elseif ($method === 'POST') {
            // se acepta JSON o multipart; se usa POST con override para PUT
            if (isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']) && $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] === 'PUT') {
                $controller->update();
                exit;
            }
            $controller->update();
            exit;
        } elseif ($method === 'PUT') {
            $controller->update();
            exit;
        }
        break;

    case 'footer':
        $controller = new FooterController();
        if ($method === 'GET') {
            $controller->show();
            exit;
        } elseif ($method === 'POST') {
            if (isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']) && $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] === 'PUT') {
                $controller->update();
                exit;
            }
            $controller->update();
            exit;
        } elseif ($method === 'PUT') {
            $controller->update();
            exit;
        }
        break;

    case 'hero':
        $controller = new HeroController();
        if ($method === 'GET') {
            $controller->show();
            exit;
        } elseif ($method === 'POST') {
            if (isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']) && $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] === 'PUT') {
                $controller->update();
                exit;
            }
            $controller->update();
            exit;
        } elseif ($method === 'PUT') {
            $controller->update();
            exit;
        }
        break;

    case 'dashboard':
        if ($method === 'GET') {
            $controller = new DashboardController();
            $controller->stats();
            exit;
        }
        break;

    case 'seo':
        $controller = new SeoController();
        if ($method === 'GET') {
            $controller->show();
            exit;
        } elseif ($method === 'POST' || $method === 'PUT') {
            $controller->update();
            exit;
        }
        break;

    case 'plans':
        $controller = new PlanController();
        if ($method === 'GET') {
            $controller->index();
            exit;
        } elseif ($method === 'POST') {
            $controller->store();
            exit;
        }
        break;

    case 'testimonials':
        $controller = new TestimonialController();
        if ($method === 'GET') {
            $controller->index();
            exit;
        } elseif ($method === 'POST') {
            $controller->store();
            exit;
        }
        break;

    case 'login':
        if ($method === 'POST') {
            $controller = new AuthController();
            $controller->login();
            exit;
        }
        break;

    case 'logout':
        if ($method === 'POST') {
            $controller = new AuthController();
            $controller->logout();
            exit;
        }
        break;

    case 'me':
        if ($method === 'GET') {
            $controller = new AuthController();
            $controller->me();
            exit;
        }
        break;

    case 'users':
        $controller = new UserController();
        if ($method === 'GET') {
            $controller->index();
            exit;
        } elseif ($method === 'POST') {
            $controller->store();
            exit;
        }
        break;
}

function isAdminProtectedRoute(string $route, string $method): bool
{
    $method = strtoupper($method);

    // Public routes for landing and auth
    if ($route === 'me') {
        return false;
    }

    if ($route === 'login' || $route === 'logout' || $route === 'hero' || $route === 'about' || $route === 'footer' || $route === 'services' || $route === 'plans' || $route === 'testimonials' || $route === 'portfolio' || $route === 'clients' || $route === 'clients-section') {
        return !($method === 'GET' || ($route === 'login' && $method === 'POST') || ($route === 'logout' && $method === 'POST'));
    }

    // Public contact form submit
    if ($route === 'contacts' && $method === 'POST') {
        return false;
    }

    // Public API root
    if ($route === '') {
        return false;
    }

    return true;
}

if (isAdminProtectedRoute($route, $method)) {
    AuthMiddleware::requireAdmin();
}

if (preg_match('/^contacts\/(\d+)$/', $route, $matches)) {
    AuthMiddleware::requireAdmin();
    $controller = new ContactController();
    if ($method === 'GET') {
        $controller->show($matches[1]);
        exit;
    } elseif ($method === 'PUT') {
        $controller->updateStatus($matches[1]);
        exit;
    } elseif ($method === 'DELETE') {
        $controller->destroy($matches[1]);
        exit;
    }
}

if (preg_match('/^contacts\/(\d+)\/support$/', $route, $matches)) {
    AuthMiddleware::requireAdmin();
    $controller = new ContactController();
    if ($method === 'PUT' || ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']) && $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] === 'PUT')) {
        $controller->assignSupport($matches[1]);
        exit;
    }
}

if (preg_match('/^users\/(\d+)$/', $route, $matches)) {
    AuthMiddleware::requireAdmin();
    $controller = new UserController();
    if ($method === 'DELETE') {
        $controller->destroy($matches[1]);
        exit;
    } elseif ($method === 'PUT') {
        $controller->update($matches[1]);
        exit;
    } elseif ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']) && $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] === 'PUT') {
        $controller->update($matches[1]);
        exit;
    }
}

if (preg_match('/^clients\/(\d+)$/', $route, $matches)) {
    AuthMiddleware::requireAdmin();
    $controller = new ClientController();
    if ($method === 'DELETE') {
        $controller->destroy($matches[1]);
        exit;
    } elseif ($method === 'PUT') {
        $controller->update($matches[1]);
        exit;
    }
}

if (preg_match('/^services\/(\d+)$/', $route, $matches)) {
    AuthMiddleware::requireAdmin();
    $controller = new ServiceController();
    if ($method === 'DELETE') {
        $controller->destroy($matches[1]);
        exit;
    } elseif ($method === 'PUT') {
        $controller->update($matches[1]);
        exit;
    } elseif ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']) && $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] === 'PUT') {
        $controller->update($matches[1]);
        exit;
    } elseif ($method === 'GET') {
        $controller->show($matches[1]);
        exit;
    }
}

if (preg_match('/^portfolio\/(\d+)$/', $route, $matches)) {
    AuthMiddleware::requireAdmin();
    $controller = new PortfolioController();
    if ($method === 'DELETE') {
        $controller->destroy($matches[1]);
        exit;
    } elseif ($method === 'PUT') {
        $controller->update($matches[1]);
        exit;
    } elseif ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']) && $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] === 'PUT') {
        $controller->update($matches[1]);
        exit;
    } elseif ($method === 'GET') {
        $controller->show($matches[1]);
        exit;
    }
}

if (preg_match('/^plans\/(\d+)$/', $route, $matches)) {
    AuthMiddleware::requireAdmin();
    $controller = new PlanController();
    if ($method === 'DELETE') {
        $controller->destroy($matches[1]);
        exit;
    } elseif ($method === 'PUT') {
        $controller->update($matches[1]);
        exit;
    } elseif ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']) && $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] === 'PUT') {
        $controller->update($matches[1]);
        exit;
    } elseif ($method === 'GET') {
        $controller->show($matches[1]);
        exit;
    }
}

if (preg_match('/^testimonials\/(\d+)$/', $route, $matches)) {
    AuthMiddleware::requireAdmin();
    $controller = new TestimonialController();
    if ($method === 'DELETE') {
        $controller->destroy($matches[1]);
        exit;
    } elseif ($method === 'PUT') {
        $controller->update($matches[1]);
        exit;
    } elseif ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']) && $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] === 'PUT') {
        $controller->update($matches[1]);
        exit;
    } elseif ($method === 'GET') {
        $controller->show($matches[1]);
        exit;
    }
}


// Si no existe la ruta
http_response_code(404);
echo json_encode([
    'error' => 'Ruta no encontrada',
    'ruta'  => $route
]);

