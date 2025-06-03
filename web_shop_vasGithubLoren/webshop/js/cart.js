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
            if (emptyMessage) emptyMessage.style.display = 'block';
            if (clearCartBtn) clearCartBtn.style.display = 'none';
            // Also hide the table and checkout button if cart is empty on cart page
            const cartContainer = document.querySelector('.cart-container table');
            const checkoutButton = document.querySelector('.cart-container .checkout-button');
            if (cartContainer) cartContainer.style.display = 'none';
            if (checkoutButton) checkoutButton.style.display = 'none';
            if (cartTotal) cartTotal.textContent = '0.00'; // Ensure total is reset
            return;
        } else {
            if (emptyMessage) emptyMessage.style.display = 'none';
            if (clearCartBtn) clearCartBtn.style.display = 'inline-block';
            const cartContainerTable = document.querySelector('.cart-container table');
            const checkoutButton = document.querySelector('.cart-container .checkout-button');
            if (cartContainerTable) cartContainerTable.style.display = 'table'; // Or 'block' if you changed display
            if (checkoutButton) checkoutButton.style.display = 'inline-block'; // Or 'block'
        }

        cart.forEach((item, index) => {
            const row = document.createElement('tr');
            let optionsHtml = '';
            if (item.size && item.size !== 'N/A') {
                optionsHtml += `<small>Veličina: ${item.size}</small><br>`;
            }

            row.innerHTML = `
             <td data-label="Product">
                <strong>${item.name}</strong><br>
                    <small>${item.description || ''}</small><br>
                    ${optionsHtml}
            </td>
            <td data-label="Image"><img src="${item.image || '../img/placeholder.png'}" alt="${item.name}" style="max-width: 60px; height: auto;"></td>
            <td data-label="Quantity">${item.quantity}</td>
            <td data-label="Price">$${item.price.toFixed(2)}</td>
            <td data-label="Subtotal">$${(item.price * item.quantity).toFixed(2)}</td>
            <td data-label="Remove"><button class="remove-btn" data-index="${index}">✖</button></td>
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
            // To prevent multiple listeners, remove old one if any, or ensure it's added once.
            // A simple way is to replace the button or rely on the cart re-render clearing old ones.
            // For now, assuming re-render handles it.
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

    function updateCartCountDisplay() {
        const cartCountElements = document.querySelectorAll('#cart-count'); // Target all elements with this ID
        if (cartCountElements.length > 0) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElements.forEach(el => el.textContent = totalItems);
        }
    }
    updateCartCountDisplay();

    // Universal Add to Cart button handler using EVENT DELEGATION
    document.body.addEventListener('click', function (e) {
        const addToCartButton = e.target.closest('.add-to-cart');

        if (addToCartButton) {
            e.preventDefault();

            let product = {};
            let isDetailsPage = false;

            const productForm = addToCartButton.closest('#productForm');
            if (productForm) {
                isDetailsPage = true;
                const name = productForm.querySelector('#hidden-product-name').value;
                const price = parseFloat(productForm.querySelector('#hidden-product-price').value);
                const image = productForm.querySelector('#hidden-product-image').value;
                const quantity = parseInt(productForm.querySelector('#quantity').value) || 1;
                const size = productForm.querySelector('#size') ? productForm.querySelector('#size').value : 'N/A';

                // Try to get description more specifically from the details page structure
                const shortDescriptionElement = document.querySelector('main#proizvodi .product-info .short-description');
                const description = shortDescriptionElement ? shortDescriptionElement.textContent : '';

                product = { name, price, quantity, image, description, size };

            } else {
                const productCard = addToCartButton.closest('.product-card') || addToCartButton.closest('.product-card2');
                if (!productCard) {
                    console.warn("Add to Cart button clicked, but no product card found.", addToCartButton);
                    return;
                }

                const name = productCard.dataset.name || productCard.querySelector('h4, h3')?.textContent.trim();
                const priceText = productCard.dataset.price || productCard.querySelector('p:not([class])')?.textContent.trim(); // Target price P specifically
                const price = parseFloat(String(priceText).replace('$', ''));
                const image = productCard.dataset.image || productCard.querySelector('.product-image')?.src || '';
                const shortDesc = productCard.dataset.shortDescription || '';
                const sku = productCard.dataset.sku || ''; // Get SKU
                const quantity = 1;

                if (!name || isNaN(price)) {
                    console.error("Could not extract product details from card:", productCard);
                    alert("Error: Could not add product to cart. Details missing.");
                    return;
                }
                product = { name, price, quantity, image, description: shortDesc, size: 'N/A', sku };
            }

            let localCart = JSON.parse(localStorage.getItem('cart')) || []; // Use localCart to avoid conflict with global `cart`

            // Use SKU for existing product check if available, otherwise name and size
            const existingProductIndex = localCart.findIndex(p => {
                if (product.sku && p.sku) { // If both current product and cart item have SKU
                    if (isDetailsPage) {
                        return p.sku === product.sku && p.size === product.size;
                    }
                    return p.sku === product.sku; // For cards, SKU should be enough if variants are separate products
                }
                // Fallback to name and size if SKU is not consistently used
                if (isDetailsPage) {
                    return p.name === product.name && p.size === product.size;
                }
                return p.name === product.name;
            });

            if (existingProductIndex > -1) {
                localCart[existingProductIndex].quantity += product.quantity;
            } else {
                localCart.push(product);
            }

            localStorage.setItem('cart', JSON.stringify(localCart));
            cart = localCart; // Update global cart variable used by renderCart on cart page
            updateCartCountDisplay();
            alert(`${product.name} added to cart!`);
        }
    });

    // --- Slideshow script ---
    const slidesContainer = document.querySelector('#hero .slides');
    if (slidesContainer) {
        const slides = slidesContainer.querySelectorAll('img');
        if (slides.length > 0) {
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
            showSlide(currentSlide); // Initial display
            setInterval(nextSlide, 5000); // Change slide every 5 seconds
        }
    }

    // --- Menu Navigation Script ---
    const menuSelect = document.getElementById('menu');
    if (menuSelect) {
        menuSelect.addEventListener('change', function () {
            const selectedValue = this.value;
            if (selectedValue && selectedValue !== "Main menu") { // "Main menu" option might have no value or an empty value
                window.location.href = selectedValue;
            }
        });
    }
});