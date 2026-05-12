document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const charCount = document.getElementById('charCount');
    const messageField = document.getElementById('mensaje') || document.getElementById('descripcion');
    const servicesGrid = document.querySelector('.services-grid');
    const clientsGrid = document.querySelector('.clients-grid');
    const portfolioGrid = document.querySelector('.portfolio-grid');
    const aboutSection = document.querySelector('.about');
    const footerSection = document.querySelector('.footer');
    const plansGrid = document.getElementById('plansGrid');
    const testimonialsGrid = document.getElementById('testimonialsGrid');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const themeToggle = document.getElementById('themeToggle');
    const heroImage = document.querySelector('.hero-image');
    let revealObserver = null;

    const baseFromFrontend = window.location.pathname.includes('/frontend/')
        ? window.location.pathname.split('/frontend/')[0]
        : '';
    const API_BASE = `${window.location.origin}${baseFromFrontend}/backend/public`;

    /* =========================
       Visibilidad inicial (animaciones CSS por defecto en 0)
    ========================= */
    document.querySelectorAll('.service-card, .portfolio-item, .client-logo').forEach(el => {
        el.classList.add('animate');
    });

    /* =========================
       Utilidades menú móvil
    ========================= */
    function openMenu() {
        if (!hamburger || !navMenu) return;
        hamburger.classList.add('active');
        navMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        if (!hamburger || !navMenu) return;
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    function toggleMenu() {
        if (!hamburger || !navMenu) return;
        const isActive = hamburger.classList.contains('active');
        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    function applyTheme(theme) {
        const isLight = theme === 'light';
        document.body.classList.toggle('theme-light', isLight);
        if (themeToggle) themeToggle.textContent = isLight ? 'Dark' : 'Light';
    }

    const savedTheme = localStorage.getItem('msd_theme');
    applyTheme(savedTheme === 'light' ? 'light' : 'dark');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const toLight = !document.body.classList.contains('theme-light');
            const nextTheme = toLight ? 'light' : 'dark';
            applyTheme(nextTheme);
            localStorage.setItem('msd_theme', nextTheme);
        });
    }

    if (heroImage) {
        heroImage.addEventListener('mousemove', (e) => {
            const rect = heroImage.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const rotateY = (x - 0.5) * 6;
            const rotateX = (0.5 - y) * 6;
            heroImage.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        heroImage.addEventListener('mouseleave', () => {
            heroImage.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
        });
    }

    /* =========================
       Contador de caracteres
    ========================= */
    if (messageField && charCount) {
        charCount.textContent = messageField.value.length;

        messageField.addEventListener('input', () => {
            charCount.textContent = messageField.value.length;
        });
    }

    /* =========================
       Envío de formulario
    ========================= */
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                nombre: form.nombre?.value.trim() || '',
                correo: form.correo?.value.trim() || '',
                telefono: form.telefono?.value.trim() || '',
                tipo_proyecto: form.tipo_proyecto?.value || '',
                mensaje: form.mensaje?.value.trim() || '',
                // Compatibilidad con backend actual
                pais: form.pais?.value || 'Colombia',
                celular: (form.telefono?.value || form.celular?.value || '').trim(),
                servicio: form.tipo_proyecto?.value || form.servicio?.value || '',
                descripcion: form.mensaje?.value.trim() || form.descripcion?.value.trim() || ''
            };

            if (
                !data.nombre ||
                !data.correo ||
                !data.telefono ||
                !data.tipo_proyecto ||
                !data.mensaje
            ) {
                alert('Por favor completa todos los campos');
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/contacts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok && result.status === 'OK') {
                    alert('✅ Solicitud enviada correctamente');
                    form.reset();
                    if (charCount) charCount.textContent = '0';
                } else {
                    const message = result.error || result.message || 'No se pudo enviar';
                    alert('❌ Error: ' + message);
                }
            } catch (error) {
                console.error(error);
                alert('❌ Error de conexión con el servidor');
            }
        });
    }

    async function loadPlans() {
        if (!plansGrid) return;

        try {
            const res = await fetch(`${API_BASE}/plans?active=1`);
            const data = await res.json();
            if (!res.ok || !Array.isArray(data.plans) || data.plans.length === 0) return;

            plansGrid.innerHTML = '';

            data.plans.forEach((plan, index) => {
                const card = document.createElement('article');
                card.className = index === 1 ? 'plan-card plan-card-popular' : 'plan-card';

                let benefits = [];
                try {
                    const parsed = JSON.parse(plan.benefits || '[]');
                    benefits = Array.isArray(parsed) ? parsed : [];
                } catch (_) {
                    benefits = [];
                }

                card.innerHTML = `
                    ${index === 1 ? '<span class="popular-tag">Mas solicitado</span>' : ''}
                    <h3>${plan.name || ''}</h3>
                    <p>${plan.description || ''}</p>
                    <ul>${benefits.map(b => `<li>${b}</li>`).join('')}</ul>
                    <a href="#contacto" class="btn ${index === 1 ? 'btn-primary' : 'btn-ghost'}">${plan.price_text || 'Solicitar'}</a>
                `;

                plansGrid.appendChild(card);
            });

            observeRevealTargets();
        } catch (err) {
            // fallback estatico
        }
    }

    async function loadTestimonials() {
        if (!testimonialsGrid) return;

        try {
            const res = await fetch(`${API_BASE}/testimonials?active=1`);
            const data = await res.json();
            if (!res.ok || !Array.isArray(data.testimonials) || data.testimonials.length === 0) return;

            testimonialsGrid.innerHTML = '';

            data.testimonials.forEach(item => {
                const card = document.createElement('article');
                card.className = 'testimonial';
                card.innerHTML = `
                    <p>"${item.content || ''}"</p>
                    <strong>${item.author_name || ''}${item.author_role ? ' - ' + item.author_role : ''}</strong>
                `;
                testimonialsGrid.appendChild(card);
            });

            observeRevealTargets();
        } catch (err) {
            // fallback estatico
        }
    }

    async function loadHero() {
        try {
            const res = await fetch(`${API_BASE}/hero`);
            const data = await res.json();
            if (!res.ok || !data.hero) return;

            const h = data.hero;
            const logoText = document.getElementById('logoText');
            const logoImg = document.getElementById('siteLogo');
            const heroBadge = document.getElementById('heroBadge');
            const heroTitle = document.getElementById('heroTitle');
            const heroSubtitle = document.getElementById('heroSubtitle');
            const heroImage = document.getElementById('heroImage');
            const heroPrimaryCta = document.getElementById('heroPrimaryCta');
            const heroSecondaryCta = document.getElementById('heroSecondaryCta');
            const topValue = document.getElementById('heroTopMetricValue');
            const topText = document.getElementById('heroTopMetricText');
            const bottomValue = document.getElementById('heroBottomMetricValue');
            const bottomText = document.getElementById('heroBottomMetricText');

            if (logoText && h.brand_name) logoText.textContent = h.brand_name;
            if (logoImg) {
                if (h.logo) {
                    logoImg.src = resolveImage(h.logo);
                    logoImg.style.display = 'inline-block';
                } else {
                    logoImg.style.display = 'none';
                }
            }

            if (heroBadge && h.badge) heroBadge.textContent = h.badge;
            if (heroTitle && h.title) heroTitle.textContent = h.title;
            if (heroSubtitle && h.subtitle) heroSubtitle.textContent = h.subtitle;
            if (heroImage && h.image) heroImage.src = resolveImage(h.image);

            if (heroPrimaryCta) {
                if (h.cta_primary_text) heroPrimaryCta.textContent = h.cta_primary_text;
                if (h.cta_primary_link) heroPrimaryCta.href = h.cta_primary_link;
            }
            if (heroSecondaryCta) {
                if (h.cta_secondary_text) heroSecondaryCta.textContent = h.cta_secondary_text;
                if (h.cta_secondary_link) heroSecondaryCta.href = h.cta_secondary_link;
            }

            if (topValue && h.metric_top_value) topValue.textContent = h.metric_top_value;
            if (topText && h.metric_top_text) topText.textContent = h.metric_top_text;
            if (bottomValue && h.metric_bottom_value) bottomValue.textContent = h.metric_bottom_value;
            if (bottomText && h.metric_bottom_text) bottomText.textContent = h.metric_bottom_text;
        } catch (_) {
            // fallback estatico
        }
    }

    /* =========================
       Cargar servicios
    ========================= */
    async function loadServices() {
        if (!servicesGrid) return;

        try {
            const res = await fetch(`${API_BASE}/services`);
            const data = await res.json();

            if (!res.ok || !data.services || data.services.length === 0) return;

            servicesGrid.innerHTML = '';

            data.services.forEach(service => {
                const card = document.createElement('div');
                card.className = 'service-card animate';

                const iconHtml = renderServiceIcon(service.icon);

                card.innerHTML = `
                    <div class="service-icon">
                        ${iconHtml}
                    </div>
                    <h3 class="service-title">${service.name}</h3>
                    <p class="service-description">${service.description || ''}</p>
                `;

                servicesGrid.appendChild(card);
            });

            observeRevealTargets();
        } catch (err) {
            // Silencioso, se mantienen los valores estáticos
        }
    }

    /* =========================
       Cargar clientes
    ========================= */
    async function loadClients() {
        if (!clientsGrid) return;

        try {
            const res = await fetch(`${API_BASE}/clients`);
            const data = await res.json();

            if (!res.ok || !data.clients || data.clients.length === 0) return;

            clientsGrid.innerHTML = '';

            data.clients.forEach(client => {
                const item = document.createElement('div');
                item.className = 'client-logo animate';
                item.innerHTML = `<img src="${resolveImage(client.logo)}" alt="${client.name}">`;
                clientsGrid.appendChild(item);
            });

            if (data.section) {
                const clientsKicker = document.getElementById('clientsKicker');
                const clientsTitle = document.getElementById('clientsTitle');
                const clientsSubtitle = document.getElementById('clientsSubtitle');
                if (clientsKicker && data.section.kicker) clientsKicker.textContent = data.section.kicker;
                if (clientsTitle && data.section.title) clientsTitle.textContent = data.section.title;
                if (clientsSubtitle && data.section.subtitle) clientsSubtitle.textContent = data.section.subtitle;
            }

            setupClientsMarquee();

            observeRevealTargets();
        } catch (err) {
            // Silencioso, se mantienen los valores estáticos
        }
    }

    /* =========================
       Cargar portafolio
    ========================= */
    async function loadPortfolio() {
        if (!portfolioGrid) return;

        try {
            const res = await fetch(`${API_BASE}/portfolio`);
            const data = await res.json();

            if (!res.ok || !data.portfolio || data.portfolio.length === 0) return;

            portfolioGrid.innerHTML = '';

            data.portfolio.forEach(p => {
                const item = document.createElement('div');
                item.className = 'portfolio-item animate';

                const imgUrl = resolveImage(p.image);

                item.innerHTML = `
                    <img src="${imgUrl}" alt="${p.title}">
                    <div class="portfolio-overlay">
                        <h3>${p.title}</h3>
                        <p>${p.description || ''}</p>
                    </div>
                `;

                portfolioGrid.appendChild(item);
            });

            observeRevealTargets();
        } catch (err) {
            // Silencioso
        }
    }

    /* =========================
       Cargar About
    ========================= */
    async function loadAbout() {
        if (!aboutSection) return;

        try {
            const res = await fetch(`${API_BASE}/about`);
            const data = await res.json();

            if (!res.ok || !data.about) return;

            const a = data.about;

            const titleEl = aboutSection.querySelector('.section-title');
            const pEls = aboutSection.querySelectorAll('.about-text p');
            const imgEl = aboutSection.querySelector('.about-image img');
            const featureEls = aboutSection.querySelectorAll('.about-features .feature');

            if (titleEl && a.title) titleEl.textContent = a.title;
            if (pEls[0] && a.paragraph1) pEls[0].textContent = a.paragraph1;
            if (pEls[1] && a.paragraph2) pEls[1].textContent = a.paragraph2;
            if (imgEl && a.image) imgEl.src = resolveImage(a.image);

            const features = [
                { icon: a.feature1_icon, title: a.feature1_title },
                { icon: a.feature2_icon, title: a.feature2_title },
                { icon: a.feature3_icon, title: a.feature3_title },
                { icon: a.feature4_icon, title: a.feature4_title }
            ];

            features.forEach((f, idx) => {
                if (!featureEls[idx]) return;

                const iTag = featureEls[idx].querySelector('i');
                const h3 = featureEls[idx].querySelector('h3');

                if (iTag && f.icon) iTag.className = f.icon;
                if (h3 && f.title) h3.textContent = f.title;
            });
        } catch (err) {
            // silencioso
        }
    }

    /* =========================
       Cargar Footer
    ========================= */
    async function loadFooter() {
        if (!footerSection) return;

        try {
            const res = await fetch(`${API_BASE}/footer`);
            const data = await res.json();

            if (!res.ok || !data.footer) return;

            const f = data.footer;

            const logo = footerSection.querySelector('.footer-logo .logo-text');
            const tagline = footerSection.querySelector('.footer-logo p');

            if (logo && f.brand_title) logo.textContent = f.brand_title;
            if (tagline && f.tagline) tagline.textContent = f.tagline;

            const socials = footerSection.querySelectorAll('.social-icons a');
            const socialLinks = [f.facebook, f.instagram, f.twitter, f.whatsapp];

            socials.forEach((a, i) => {
                if (socialLinks[i]) a.href = socialLinks[i];
            });

            const links = footerSection.querySelectorAll('.footer-links a');
            const navLinks = [
                f.link_inicio,
                f.link_nosotros,
                f.link_servicios,
                f.link_trabajos,
                f.link_tienda
            ];

            links.forEach((a, i) => {
                if (navLinks[i]) a.href = navLinks[i];
            });

            const contactItems = footerSection.querySelectorAll('.footer-contact li');

            if (contactItems[0] && f.email) {
                contactItems[0].innerHTML = `<i class="fas fa-envelope"></i> ${f.email}`;
            }

            if (contactItems[1] && f.address) {
                contactItems[1].innerHTML = `<i class="fas fa-map-marker-alt"></i> ${f.address}`;
            }

            if (contactItems[2] && f.phone) {
                contactItems[2].innerHTML = `<i class="fas fa-phone"></i> ${f.phone}`;
            }

            if (contactItems[3] && f.whatsapp) {
                contactItems[3].innerHTML = `<i class="fab fa-whatsapp"></i> ${f.whatsapp}`;
            }

            const bottom = footerSection.querySelector('.footer-bottom p');
            if (bottom && f.footer_note) bottom.textContent = f.footer_note;
        } catch (err) {
            // silencioso
        }
    }

    /* =========================
       Helpers
    ========================= */
    function renderServiceIcon(icon) {
        if (!icon) return '<i class="fas fa-gear"></i>';

        const clean = icon.trim();
        const isPath =
            clean.startsWith('/') ||
            clean.startsWith('uploads') ||
            clean.startsWith('http');

        if (isPath) {
            const url = clean.startsWith('http')
                ? clean
                : `${API_BASE}${clean.startsWith('/') ? '' : '/'}${clean}`;

            return `<img src="${url}" alt="icon" style="width:50px;height:50px;object-fit:cover;border-radius:10px;">`;
        }

        return `<i class="${clean}"></i>`;
    }

    function resolveImage(image) {
        if (!image) return '';

        const clean = image.trim();
        if (clean.startsWith('http')) return clean;

        return `${API_BASE}${clean.startsWith('/') ? '' : '/'}${clean}`;
    }

    function setupClientsMarquee() {
        if (!clientsGrid) return;

        const logos = Array.from(clientsGrid.querySelectorAll('.client-logo'));
        if (logos.length <= 5) {
            clientsGrid.classList.remove('marquee');
            return;
        }

        if (clientsGrid.querySelector('.marquee-track')) return;

        const track = document.createElement('div');
        track.className = 'marquee-track';

        logos.forEach(logo => track.appendChild(logo));
        logos.forEach(logo => track.appendChild(logo.cloneNode(true)));

        clientsGrid.innerHTML = '';
        clientsGrid.appendChild(track);
        clientsGrid.classList.add('marquee');

        const duration = Math.max(20, logos.length * 3.2);
        clientsGrid.style.setProperty('--marquee-duration', `${duration}s`);
    }

    /* =========================
       Menú responsive hamburguesa
    ========================= */
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        document.addEventListener('click', (e) => {
            const clickedInsideMenu = navMenu.contains(e.target);
            const clickedHamburger = hamburger.contains(e.target);

            if (!clickedInsideMenu && !clickedHamburger && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });
    }

    function observeRevealTargets() {
        const revealTargets = document.querySelectorAll(
            '.about, .services, .portfolio, .clients, .plans, .testimonials, .contact-form-section, .cta-band, .footer, .plan-card, .testimonial, .feature, .service-card, .portfolio-item, .client-logo'
        );

        if (!revealObserver) {
            revealObserver = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('in');
                            revealObserver.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.14 }
            );
        }

        revealTargets.forEach((el, idx) => {
            if (!el.classList.contains('reveal')) {
                el.classList.add('reveal');
                el.style.transitionDelay = `${Math.min(idx * 28, 240)}ms`;
                revealObserver.observe(el);
            }
        });
    }

    observeRevealTargets();

    /* =========================
       Inicialización
    ========================= */
    loadServices();
    loadClients();
    loadPortfolio();
    loadAbout();
    loadFooter();
    loadHero();
    loadPlans();
    loadTestimonials();
    setupClientsMarquee();
});
