document.addEventListener('DOMContentLoaded', () => {
    const cartItemsTable = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart');
    const emptyMessage = document.getElementById('empty-message');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function renderCart() {
        cartItemsTable.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            emptyMessage.style.display = 'block';
            clearCartBtn.style.display = 'none';
            return;
        } else {
            emptyMessage.style.display = 'none';
            clearCartBtn.style.display = 'inline-block';
        }

        cart.forEach((item, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>
                    <strong>${item.name}</strong><br>
                    <small>${item.description || ''}</small>
                    <small>Size: ${item.size || 'N/A'}</small><br>
                    <small>Meat: ${item.meat || 'N/A'}</small>
                </td>
                <td><img src="${item.image || '/img/placeholder.png'}" alt="${item.name}" style="max-width: 60px; height: auto;"></td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                <td><button class="remove-btn" data-index="${index}">✖</button></td>
            `;

            cartItemsTable.appendChild(row);
            total += item.price * item.quantity;
        });

        cartTotal.textContent = total.toFixed(2);
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
                updateCartCountDisplay(); // Update the cart icon count after removal
            });
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to clear your cart?")) {
                cart = [];
                localStorage.removeItem('cart');
                renderCart();
                updateCartCountDisplay(); // Update the cart icon count after clearing
            }
        });
    }

    renderCart(); // Initial render for the cart page

    // Function to update the cart count display
    function updateCartCountDisplay() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }
    // Call it initially on the cart page too, in case user navigates back
    updateCartCountDisplay();
});


// Universal Add to Cart button handler
document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('button.add-to-cart, .product-card button');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            let productCard = button.closest('.product-info'); // Target the specific product-info div for extraction
            let relatedProductCard = button.closest('.product-card, .product-card2'); // For related products section

            let product;

            if (productCard) { // This is the main product page "add to cart"
                const name = productCard.querySelector('.product-name')?.textContent.trim();
                const priceText = productCard.querySelector('.product-price')?.textContent.trim();
                const price = parseFloat(priceText.replace('$', ''));
                const quantityInput = productCard.querySelector('#quantity');
                const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
                const description = productCard.querySelector('.short-description')?.textContent || '';

                // Get selected image from the gallery
                const activeImage = document.querySelector('.main-images img:checked, .main-images input[name="gallery"]:checked + img');
                const image = activeImage ? activeImage.src : '/img/placeholder.png'; // Get image source
                // Also get the selected options
                const sizeSelect = productCard.querySelector('#size');
                const selectedSize = sizeSelect ? sizeSelect.value : '';

                const meatSelect = productCard.querySelector('#meat');
                const selectedMeat = meatSelect ? meatSelect.value : '';

                product = { name, price, quantity, image, description, size: selectedSize, meat: selectedMeat };

            } else if (relatedProductCard) { // This is for product cards in the "Related Products" section
                const name = relatedProductCard.querySelector('h3')?.textContent.trim();
                const priceText = relatedProductCard.querySelector('p')?.textContent.trim();
                const price = parseFloat(priceText.replace('$', ''));
                const image = relatedProductCard.querySelector('.product-image')?.src || '';
                const quantity = 1; // Default to 1 for related products, as there's no quantity input

                product = { name, price, quantity, image, description: '' }; // No description for related products in HTML
            } else {
                return; // Should not happen if selectors are correct
            }

            // Add or update product in localStorage
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingProductIndex = cart.findIndex(p => {
                // For main product, match name, size, and meat
                if (productCard) {
                    return p.name === product.name && p.size === product.size && p.meat === product.meat;
                }
                // For related products, just match name
                return p.name === product.name;
            });


            if (existingProductIndex > -1) {
                cart[existingProductIndex].quantity += product.quantity;
            } else {
                cart.push(product);
            }

            localStorage.setItem('cart', JSON.stringify(cart));

            // Update cart count
            const cartCount = document.getElementById('cart-count');
            if (cartCount) {
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                cartCount.textContent = totalItems;
            }

            alert(`${product.name} added to cart!`);
        });
    });
});