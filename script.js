// Ensure preferences are respected
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 0.8,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1.5,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// Integrate Lenis with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// ==========================================
// CUSTOM CURSOR
// ==========================================
const cursor = document.querySelector('.cursor-glow');

if (!prefersReducedMotion && window.innerWidth > 768) {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor follow
    const renderCursor = () => {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        requestAnimationFrame(renderCursor);
    };
    renderCursor();

    // Hover effects
    const interactiveElements = document.querySelectorAll('a, button, .glass-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
}

// ==========================================
// THREE.JS FLOATING BACKGROUND
// ==========================================
const initThreeJS = () => {
    if (prefersReducedMotion) return; // Skip 3D for reduced motion

    const canvas = document.querySelector('#webgl-canvas');
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance

    // Objects
    const material = new THREE.MeshBasicMaterial({
        color: 0x8a2be2,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    const material2 = new THREE.MeshBasicMaterial({
        color: 0x4a90e2,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    const torus = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.4, 16, 50), material);
    const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 0), material2);
    const octahedron = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 0), material);

    // Position objects far apart to add depth
    torus.position.set(-3, 1, -2);
    icosahedron.position.set(3, -1, -5);
    octahedron.position.set(0, -3, -1);

    scene.add(torus, icosahedron, octahedron);

    // Mouse Parallax Effect variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.001;
        mouseY = (event.clientY - windowHalfY) * 0.001;
    });

    // Animation Loop
    const clock = new THREE.Clock();

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        // Base rotation
        torus.rotation.x = elapsedTime * 0.15;
        torus.rotation.y = elapsedTime * 0.1;

        icosahedron.rotation.x = elapsedTime * 0.1;
        icosahedron.rotation.y = elapsedTime * -0.15;

        octahedron.rotation.x = elapsedTime * -0.1;
        octahedron.rotation.y = elapsedTime * 0.2;

        // Mouse parallax easing
        targetX = mouseX * 2;
        targetY = mouseY * 2;

        scene.rotation.x += 0.05 * (targetY - scene.rotation.x);
        scene.rotation.y += 0.05 * (targetX - scene.rotation.y);

        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    };

    tick();

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

initThreeJS();

// ==========================================
// GSAP SCROLL & INTRO ANIMATIONS
// ==========================================
window.addEventListener('load', () => {
    if (prefersReducedMotion) {
        gsap.set('.glass-card', { opacity: 1, y: 0 });
        return;
    }

    // Initial Hero Animation
    const tl = gsap.timeline();

    tl.fromTo('.hero-card',
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power3.out", delay: 0.2 }
    );

    // Parallax Background Image
    gsap.to('.bg-image', {
        yPercent: 20,
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: true
        }
    });

    // Reveal animations for all glass cards
    const cards = document.querySelectorAll('.about-grid .glass-card, .projects-grid .glass-card, .contact-card');

    cards.forEach((card, i) => {
        gsap.fromTo(card,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Animate section titles
    const titles = document.querySelectorAll('.section-title');
    titles.forEach(title => {
        gsap.fromTo(title,
            { opacity: 0, x: -30 },
            {
                opacity: 1, x: 0, duration: 0.8, ease: "power2.out",
                scrollTrigger: {
                    trigger: title,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            }
        )
    });
});