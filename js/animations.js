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
    let throttleCounter = 0;

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

        // Throttle normal exhaust emission to keep it clean and performant
        const speed = Math.sqrt(dx*dx + dy*dy);
        if (speed <= 0.3) return;

        throttleCounter++;
        if (throttleCounter % 3 !== 0) return; // Only emit every 3 frames of flight

        // Calculate thruster blast direction (opposite to robot velocity vector)
        const exhaustVx = -dx * 1.3;
        const exhaustVy = -dy * 1.3;

        // Emit exactly 1 flame/spark particle per throttle tick for a clean trail
        const vx = exhaustVx + (Math.random() - 0.5) * 1.0;
        const vy = exhaustVy + (Math.random() - 0.5) * 1.0;
        
        const isSpark = Math.random() > 0.65; // 35% sparks, 65% flames
        
        particles.push({
            // Emit directly from nozzle (Y-offset +10 matches 40x40 SVG nozzle at y=30 relative to center 20)
            x: x,
            y: y + 10,
            vx: vx,
            vy: vy,
            size: isSpark ? Math.random() * 1.8 + 0.6 : Math.random() * 4.5 + 2.0,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            // Shorter lifespan for a tighter, cleaner trail
            decay: isSpark ? (Math.random() * 0.025 + 0.02) : (Math.random() * 0.06 + 0.04),
            isSpark: isSpark
        });

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


export function initRobotMascot() {
    const robot = document.getElementById('heroRobot');
    if (!robot) return;

    const eyeLeft = robot.querySelector('.eye-left .eye-pupil');
    const eyeRight = robot.querySelector('.eye-right .eye-pupil');
    const head = robot.querySelector('.robot-head');
    const torso = robot.querySelector('.robot-torso');
    const armLeft = robot.querySelector('.arm-left');
    const armRight = robot.querySelector('.arm-right');

    window.addEventListener('mousemove', (e) => {
        const rect = robot.getBoundingClientRect();
        const robotX = rect.left + rect.width / 2;
        const robotY = rect.top + rect.height / 2;

        const deltaX = e.clientX - robotX;
        const deltaY = e.clientY - robotY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Limit pupils movement
        const maxPupilMove = 4; // pixels
        const angle = Math.atan2(deltaY, deltaX);
        const pupilX = Math.cos(angle) * Math.min(maxPupilMove, distance * 0.03);
        const pupilY = Math.sin(angle) * Math.min(maxPupilMove, distance * 0.03);

        if (eyeLeft && eyeRight) {
            eyeLeft.style.transform = `translate3d(${pupilX}px, ${pupilY}px, 0)`;
            eyeRight.style.transform = `translate3d(${pupilX}px, ${pupilY}px, 0)`;
        }

        // Tilt the head towards mouse
        const maxTilt = 12; // degrees
        const tiltX = Math.min(maxTilt, Math.max(-maxTilt, (deltaY / window.innerHeight) * maxTilt));
        const tiltY = Math.min(maxTilt, Math.max(-maxTilt, (deltaX / window.innerWidth) * -maxTilt));

        if (head) {
            head.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        }

        // Counter-tilt the torso for organic balance
        if (torso) {
            torso.style.transform = `rotateX(${-tiltX * 0.4}deg) rotateY(${-tiltY * 0.4}deg)`;
        }

        // Sway arms slightly based on mouse horizontal movement
        if (armLeft) {
            armLeft.style.transform = `rotate(${12 - tiltY * 0.6}deg)`;
        }
        
        // Only apply mouse sway to right arm if robot is not hovered (so it doesn't conflict with wave)
        const isHovered = robot.matches(':hover');
        if (armRight && !isHovered) {
            armRight.style.transform = `rotate(${-12 - tiltY * 0.6}deg)`;
        }
    });

    // Reset right arm transform on hover end to allow transition back to wave/idle state
    robot.addEventListener('mouseleave', () => {
        if (armRight) {
            armRight.style.transform = '';
        }
    });
}

export function initRoadmapAnimations() {
    const roadmapSection = document.querySelector('.roadmap-section');
    const fillLine = document.getElementById('roadmapLineFill');
    const steps = document.querySelectorAll('.roadmap-step');
    if (!roadmapSection || !fillLine || steps.length === 0) return;

    const firstStep = steps[0];
    const lastStep = steps[steps.length - 1];

    // 1. Smooth scroll-linked filling of the vertical timeline line
    const handleScroll = () => {
        const firstRect = firstStep.getBoundingClientRect();
        const lastRect = lastStep.getBoundingClientRect();
        const triggerY = window.innerHeight * 0.6; // Matches the Observer trigger point (60% from top)
        
        const totalDistance = lastRect.top - firstRect.top;
        if (totalDistance <= 0) return;
        
        const currentProgress = triggerY - firstRect.top;
        let percentage = (currentProgress / totalDistance) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        
        fillLine.style.height = `${percentage}%`;
    };

    // Use requestAnimationFrame for smooth execution on scroll
    let scrollTimeout;
    const scrollListener = () => {
        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', scrollListener);
    // Run once on load
    handleScroll();

    // 2. Active status and checkmark toggle on scroll for steps
    // When the step dot crosses 60% of viewport height, mark as active
    const stepObserverOptions = {
        root: null,
        rootMargin: '0px 0px -40% 0px',
        threshold: 0.1
    };

    const stepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                const rect = entry.target.getBoundingClientRect();
                if (rect.top > window.innerHeight * 0.6) {
                    entry.target.classList.remove('active');
                }
            }
        });
    }, stepObserverOptions);

    steps.forEach(step => {
        stepObserver.observe(step);
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
