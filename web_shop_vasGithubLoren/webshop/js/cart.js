document.addEventListener('DOMContentLoaded', () => {
    const cartItemsTable = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart');
    const emptyMessage = document.getElementById('empty-message');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function renderCart() {
        if (!cartItemsTable) return; // Only run if on kosarica.html

        cartItemsTable.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            emptyMessage.style.display = 'block';
            if (clearCartBtn) clearCartBtn.style.display = 'none';
            return;
        } else {
            emptyMessage.style.display = 'none';
            if (clearCartBtn) clearCartBtn.style.display = 'inline-block';
        }

        cart.forEach((item, index) => {
            const row = document.createElement('tr');

            // Construct options string (only 'Size' remains)
            let optionsHtml = '';
            if (item.size && item.size !== 'N/A') {
                optionsHtml += `<small>Size: ${item.size}</small><br>`;
            }

            row.innerHTML = `
             <td>
                <strong>${item.name}</strong><br>
                    <small>${item.description || ''}</small><br>
                    ${optionsHtml}
            </td>
            <td><img src="${item.image || '../img/placeholder.png'}" alt="${item.name}" style="max-width: 60px; height: auto;"></td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
            <td><button class="remove-btn" data-index="${index}">✖</button></td>
            `;

            cartItemsTable.appendChild(row);
            total += item.price * item.quantity;
        });

        if (cartTotal) cartTotal.textContent = total.toFixed(2);
        attachRemoveHandlers();
    }

    function attachRemoveHandlers() {
        const removeButtons = document.querySelectorAll('.remove-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = button.getAttribute('data-index');
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
                updateCartCountDisplay();
            });
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to clear your cart?")) {
                cart = [];
                localStorage.removeItem('cart');
                renderCart();
                updateCartCountDisplay();
            }
        });
    }

    renderCart(); // Initial render for the cart page if applicable

    // Function to update the cart count display
    function updateCartCountDisplay() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }
    updateCartCountDisplay(); // Call it initially on all pages with a cart count element

    // Universal Add to Cart button handler
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            let product = {};
            let isDetailsPage = false;

            // Check if it's the product-details page's add to cart button
            const productForm = button.closest('#productForm');
            if (productForm) {
                isDetailsPage = true;
                const name = productForm.querySelector('#hidden-product-name').value;
                const price = parseFloat(productForm.querySelector('#hidden-product-price').value);
                const image = productForm.querySelector('#hidden-product-image').value;
                const quantity = parseInt(productForm.querySelector('#quantity').value);
                const size = productForm.querySelector('#size') ? productForm.querySelector('#size').value : 'N/A';
                const description = document.querySelector('.short-description')?.textContent || '';

                product = { name, price, quantity, image, description, size };

            } else { // This is for product cards on products.html or related products
                const productCard = button.closest('.product-card') || button.closest('.product-card2');
                if (!productCard) return;

                const name = productCard.querySelector('h4, h3')?.textContent.trim();
                const priceText = productCard.querySelector('p')?.textContent.trim();
                const price = parseFloat(priceText.replace('$', ''));
                const image = productCard.querySelector('.product-image')?.src || '';
                const quantity = 1;

                product = { name, price, quantity, image, description: '', size: 'N/A', meat: 'N/A' };
            }

            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingProductIndex = cart.findIndex(p => {
                if (isDetailsPage) {
                    return p.name === product.name && p.size === product.size;
                }
                return p.name === product.name;
            });

            if (existingProductIndex > -1) {
                cart[existingProductIndex].quantity += product.quantity;
            } else {
                cart.push(product);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCountDisplay();
            alert(`${product.name} added to cart!`);
        });
    });

    // --- Slideshow script ---
    const slides = document.querySelectorAll('#hero .slides img');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) slide.classList.add('active');
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // Call slideshow functions outside DOMContentLoaded to ensure they run on index.html
    showSlide(currentSlide);
    setInterval(nextSlide, 5000);

    // --- Menu Navigation Script ---
    document.getElementById('menu').addEventListener('change', function () {
        const selectedValue = this.value;
        if (selectedValue) {
            window.location.href = selectedValue;
        }
    });

}); // End of DOMContentLoaded for cart logic