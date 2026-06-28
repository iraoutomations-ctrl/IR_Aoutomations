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



// Shared module-level function for custom robot exhaust
let emitExhaust = null;

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

    // Fire and Spark colors
    const colors = [
        'rgba(239, 68, 68, 0.85)',   // Red
        'rgba(249, 115, 22, 0.95)',  // Orange
        'rgba(245, 158, 11, 0.95)',  // Gold
        'rgba(226, 183, 85, 0.9)',   // Yellow-gold
        'rgba(255, 223, 120, 0.95)'  // White-hot sparks
    ];

    function createParticles(x, y, dx, dy, isClick = false) {
        if (isClick) {
            // Click explosion - radial burst
            for (let i = 0; i < 18; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4.5 + 2;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: Math.random() * 3 + 1,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 1,
                    decay: Math.random() * 0.035 + 0.02,
                    isSpark: true
                });
            }
            return;
        }

        // Calculate thruster blast direction (opposite to robot velocity vector)
        const exhaustVx = -dx * 1.5;
        const exhaustVy = -dy * 1.5;

        // Number of flame particles scales with robot speed
        const speed = Math.sqrt(dx*dx + dy*dy);
        
        // Spawn particles only when the robot is actively flying
        const count = speed > 0.3 ? Math.min(Math.max(Math.floor(speed * 0.5), 1), 5) : 0;

        for (let i = 0; i < count; i++) {
            const vx = exhaustVx + (Math.random() - 0.5) * 1.5;
            const vy = exhaustVy + (Math.random() - 0.5) * 1.5;
            
            const isSpark = Math.random() > 0.65; // 35% sparks, 65% flames
            
            particles.push({
                // Adjust starting position to nozzle (offset y by +16)
                x: x,
                y: y + 16,
                vx: vx,
                vy: vy,
                size: isSpark ? Math.random() * 2 + 0.8 : Math.random() * 5.5 + 2.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: isSpark ? (Math.random() * 0.02 + 0.015) : (Math.random() * 0.045 + 0.03),
                isSpark: isSpark
            });
        }

        if (count > 0 && !animationFrameId) {
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

            // Apply gravity to sparks, drag to flame particles
            if (!p.isSpark) {
                p.vy += 0.03; // hot gas floats down and spreads
                p.vx *= 0.97;
            } else {
                p.vy += 0.08; // spark gravity
            }

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            
            // Flames shrink as they fade
            const size = p.isSpark ? p.size : p.size * p.alpha;
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            
            ctx.fillStyle = p.color;
            ctx.shadowBlur = p.isSpark ? 8 : 4;
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

    // Assign the shared helper so initCustomCursor can call it
    emitExhaust = (x, y, dx, dy) => {
        createParticles(x, y, dx, dy);
        if (!animationFrameId && particles.length > 0) {
            animate();
        }
    };

    window.addEventListener('click', (e) => {
        createParticles(e.clientX, e.clientY, 0, 0, true);
    });
}

export function initCustomCursor() {
    const cursor = document.getElementById('customCursor');
    if (!cursor) return;
    const robot = cursor.querySelector('.mini-robot');

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    
    // Track robot's last frame coordinates to compute actual velocity vector
    let lastRobotX = 0;
    let lastRobotY = 0;
    
    const speed = 0.12; // LERP speed

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        cursor.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });

    function updateCursor() {
        // Calculate difference to target
        let diffX = targetX - currentX;
        let diffY = targetY - currentY;
        
        // Update current LERP coordinates
        currentX += diffX * speed;
        currentY += diffY * speed;
        
        // Calculate robot's actual displacement (velocity) in this frame
        let dx = currentX - lastRobotX;
        let dy = currentY - lastRobotY;
        
        lastRobotX = currentX;
        lastRobotY = currentY;
        
        cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        
        // Tilt robot based on displacement velocity
        if (robot) {
            let tilt = Math.min(Math.max(dx * 1.5, -20), 20); // Limit tilt to [-20, 20] degrees
            robot.style.transform = `rotate(${tilt}deg)`;
        }
        
        // Emit flame particles directly from the robot thruster location
        if (emitExhaust) {
            emitExhaust(currentX, currentY, dx, dy);
        }
        
        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover effect on interactive elements via delegation
    document.addEventListener('mouseover', (e) => {
        const interactive = e.target.closest('a, button, .chat-chip, .carousel-item, .service-card, input[type="range"]');
        if (interactive) {
            cursor.classList.add('hover');
        } else {
            cursor.classList.remove('hover');
        }
    });
}
