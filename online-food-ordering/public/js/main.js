document.addEventListener('DOMContentLoaded', () => {
    // dark mode toggle
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) {
        const saved = localStorage.getItem('darkMode') === 'true';
        toggle.checked = saved;
        setDarkMode(saved);
        toggle.addEventListener('change', () => {
            localStorage.setItem('darkMode', toggle.checked);
            setDarkMode(toggle.checked);
        });
    }

    function setDarkMode(enabled) {
        document.body.classList.toggle('dark-mode', enabled);
    }

    // cart utilities
    function getCart() {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    }
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }
    function updateCartCount() {
        const count = getCart().reduce((acc, i) => acc + i.quantity, 0);
        const badge = document.getElementById('cartCount');
        if (badge) badge.textContent = count;
    }

    updateCartCount();

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            const image = btn.dataset.image;
            let cart = getCart();
            let existing = cart.find(i => i.id == id);
            if (existing) {
                existing.quantity++;
            } else {
                cart.push({ id, name, price, quantity: 1, image });
            }
            saveCart(cart);
            // simple animation
            btn.classList.add('animate__animated', 'animate__bounce');
            setTimeout(() => btn.classList.remove('animate__animated', 'animate__bounce'), 800);
        });
    });

    // populate cart modal
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('show.bs.modal', () => {
            const body = document.getElementById('cartModalBody');
            const cart = getCart();
            if (cart.length === 0) {
                body.innerHTML = '<p>Your cart is empty.</p>';
                return;
            }
            body.innerHTML = '';
            cart.forEach(i => {
                const row = document.createElement('div');
                row.className = 'd-flex justify-content-between align-items-center mb-2';
                row.innerHTML = `<span>${i.name} x${i.quantity}</span><span>$${(i.quantity*i.price).toFixed(2)}</span>`;
                body.appendChild(row);
            });
        });
    }

    // search/filter
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.toLowerCase();
            document.querySelectorAll('.menu-card').forEach(card => {
                const name = card.dataset.name.toLowerCase();
                const cat = card.dataset.category.toLowerCase();
                card.style.display = (name.includes(q) || cat.includes(q)) ? '' : 'none';
            });
        });
    }

    // populate order page with cart
    const orderCart = document.getElementById('orderCart');
    if (orderCart) {
        const cart = getCart();
        if (cart.length === 0) {
            orderCart.innerHTML = '<p>Your cart is empty.</p>';
        } else {
            let total = 0;
            orderCart.innerHTML = '';
            cart.forEach(item => {
                total += item.price * item.quantity;
                const div = document.createElement('div');
                div.className = 'cart-item mb-2';
                div.innerHTML = `${item.name} x${item.quantity} - $${(item.price*item.quantity).toFixed(2)}`;
                orderCart.appendChild(div);
            });
            document.getElementById('totalPrice').value = total.toFixed(2);
            document.getElementById('cartItems').value = JSON.stringify(cart);
            // clear cart after loading
            localStorage.removeItem('cart');
            updateCartCount();
        }
    }

    // button click bounce globally
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => btn.classList.remove('animate__animated', 'animate__pulse'), 600);
        });
    });

    // highlight active nav link
    const path = window.location.pathname;
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        }
    });

    // GSAP entrance animations if available
    if (window.gsap) {
        try {
            // hero animation
            gsap.from('.hero-title', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' });
            gsap.from('.hero-sub', { y: 20, opacity: 0, duration: 0.9, delay: 0.15, ease: 'power3.out' });
            gsap.from('.hero-cta', { scale: 0.95, opacity: 0, duration: 0.9, delay: 0.25 });

            // stagger cards
            gsap.from('.menu-card', { y: 30, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out' });

            // small hover tilt for cards
            document.querySelectorAll('.menu-card .card').forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width - 0.5;
                    const y = (e.clientY - rect.top) / rect.height - 0.5;
                    gsap.to(card, { rotationY: x * 6, rotationX: -y * 6, scale: 1.02, transformPerspective: 1000, duration: 0.3 });
                });
                card.addEventListener('mouseleave', () => {
                    gsap.to(card, { rotationY: 0, rotationX: 0, scale: 1, duration: 0.6, ease: 'power3.out' });
                });
            });
        } catch (err) {
            console.warn('GSAP failed', err);
        }
    }
});