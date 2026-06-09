/* ==========================================================================
   autoRI-studio - js/animations.js
   ========================================================================== */
export function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px -10px -40px -10px',
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-active');
            } else {
                entry.target.classList.remove('scroll-active');
            }
        });
    }, observerOptions);

    const revealSelectors = [
        '.service-card',
        '.calculator-card-wrapper',
        '.survey-card-wrapper',
        '.contact-card',
        '.hero-content',
        '.hero-mockup',
        '.section-header',
        '.tech-stack-section',
        '.about-content',
        '.about-visual'
    ];

    revealSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.classList.add('scroll-reveal');
            observer.observe(el);
        });
    });
}

export function initMouseGlow() {
    const glow = document.getElementById('mouseGlow');
    if (!glow) return;

    window.addEventListener('mousemove', (e) => {
        window.requestAnimationFrame(() => {
            glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            glow.style.opacity = '1';
        });
    });

    document.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
    });
}

export function initParticleTrail() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let animationFrameId = null;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = ['#8b5cf6', '#06b6d4', '#3b82f6'];

    function createParticles(x, y, count = 2, speedFactor = 1) {
        for (let i = 0; i < count; i++) {
            const vx = count === 1 ? (Math.random() - 0.5) * 1.5 : (Math.random() - 0.5) * 3 * speedFactor;
            const vy = count === 1 ? (Math.random() - 0.5) * 1.5 - 0.6 : (Math.random() - 0.5) * 3 * speedFactor - 0.2;
            particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                size: Math.random() * 2.5 + 1.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: count === 1 ? (Math.random() * 0.02 + 0.015) : (Math.random() * 0.03 + 0.02)
            });
        }
        if (!animationFrameId) {
            animate();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.restore();
        }

        if (particles.length > 0) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            animationFrameId = null;
        }
    }

    window.addEventListener('mousemove', (e) => {
        createParticles(e.clientX, e.clientY, 1, 0.4);
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            createParticles(e.touches[0].clientX, e.touches[0].clientY, 1, 0.4);
        }
    });

    window.addEventListener('click', (e) => {
        createParticles(e.clientX, e.clientY, 15, 1.3);
    });

    document.addEventListener('mouseover', (e) => {
        const interactive = e.target.closest('a, button, .chat-chip, .carousel-item, .service-card, input[type="range"]');
        if (interactive) {
            const now = Date.now();
            const lastHover = interactive.dataset.lastHover || 0;
            if (now - lastHover > 300) {
                interactive.dataset.lastHover = now;
                createParticles(e.clientX, e.clientY, 6, 0.6);
            }
        }
    });
}
