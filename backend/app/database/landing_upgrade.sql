-- Ejecutar en la BD: compu_yan

ALTER TABLE contacts
    ADD COLUMN IF NOT EXISTS email VARCHAR(120) NULL AFTER name,
    ADD COLUMN IF NOT EXISTS project_type VARCHAR(120) NULL AFTER service,
    ADD COLUMN IF NOT EXISTS message TEXT NULL AFTER description;

CREATE TABLE IF NOT EXISTS plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    benefits TEXT NULL,
    price_text VARCHAR(120) NOT NULL DEFAULT 'Cotizacion personalizada',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_name VARCHAR(120) NOT NULL,
    author_role VARCHAR(160) NULL,
    content TEXT NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO plans (name, description, benefits, price_text, is_active)
VALUES
('Landing Inicial', 'Ideal para validar una oferta y captar clientes rapido.', '["1 pagina optimizada","Formulario de contacto","Boton de WhatsApp"]', 'Solicitar', 1),
('Web Profesional', 'Para empresas que quieren presencia solida y escalable.', '["Hasta 6 secciones","SEO base y metricas","Integraciones comerciales"]', 'Cotizar ahora', 1),
('Tienda Virtual', 'Catalogo en linea y acompanamiento para vender mejor.', '["Configuracion de catalogo","Integracion de pagos","Soporte de lanzamiento"]', 'Solicitar', 1);

INSERT INTO testimonials (author_name, author_role, content, is_active)
VALUES
('Andrea M.', 'Sector salud', 'El equipo entendio nuestro negocio y transformo la web en un canal real de ventas.', 1),
('Carlos R.', 'Comercio retail', 'Pasamos de una pagina lenta a una plataforma clara, rapida y enfocada en conversion.', 1),
('Laura G.', 'Servicios B2B', 'Muy ordenados en el proceso y con soporte real despues de publicar.', 1);

CREATE TABLE IF NOT EXISTS hero_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(120) NOT NULL,
    logo VARCHAR(255) NULL,
    favicon VARCHAR(255) NULL,
    badge VARCHAR(180) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT NOT NULL,
    image VARCHAR(255) NULL,
    cta_primary_text VARCHAR(120) NOT NULL DEFAULT 'Solicitar cotizacion',
    cta_primary_link VARCHAR(255) NOT NULL DEFAULT '#contacto',
    cta_secondary_text VARCHAR(120) NOT NULL DEFAULT 'Ver servicios',
    cta_secondary_link VARCHAR(255) NOT NULL DEFAULT '#servicios',
    metric_top_value VARCHAR(60) NOT NULL DEFAULT '+120%',
    metric_top_text VARCHAR(180) NOT NULL DEFAULT 'Mejoras en alcance digital',
    metric_bottom_value VARCHAR(60) NOT NULL DEFAULT '24/7',
    metric_bottom_text VARCHAR(180) NOT NULL DEFAULT 'Canales de atencion activa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO hero_sections (
    brand_name, logo, favicon, badge, title, subtitle, image,
    cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link,
    metric_top_value, metric_top_text, metric_bottom_value, metric_bottom_text
)
SELECT
    'MAXSYSTEMDIGITAL',
    '',
    '',
    'Soluciones digitales para crecer tu negocio',
    'Creamos experiencias web que convierten visitas en clientes',
    'Diseno, desarrollo, soporte tecnico y estrategia para que tu empresa tenga una presencia solida, rapida y preparada para vender.',
    'assets/images/hero-digital.svg',
    'Solicitar cotizacion',
    '#contacto',
    'Ver servicios',
    '#servicios',
    '+120%',
    'Mejoras en alcance digital',
    '24/7',
    'Canales de atencion activa'
WHERE NOT EXISTS (SELECT 1 FROM hero_sections);

CREATE TABLE IF NOT EXISTS clients_section (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kicker VARCHAR(80) NOT NULL DEFAULT 'CLIENTES',
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO clients_section (kicker, title, subtitle)
SELECT
    'CLIENTES',
    'Marcas que han crecido con MaxSystemDigital',
    'Aliados en diferentes sectores con objetivos medibles'
WHERE NOT EXISTS (SELECT 1 FROM clients_section);
