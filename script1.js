import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://ciqpdavzvndopznczevf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpcXBkYXZ6dm5kb3B6bmN6ZXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NjY1NTEsImV4cCI6MjA1MjU0MjU1MX0.RxLSUcAzgt8G4QprXc-abNW-kecXh17Q6k-xUbaMo_g');

async function fetchProducts() {
  const { data: products, error } = await supabase.from('products').select('*');

  if (error) {
    console.error('Error fetching products:', error.message);
    return;
  }

  const productList = document.getElementById('product-list');
  productList.innerHTML = '';

  products.forEach((product) => {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.dataset.category = product.category;

    productCard.innerHTML = `
      <img src="${product.image_url}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <span>${product.price} ${product.currency}</span>
    `;

    productList.appendChild(productCard);
  });
}

// استدعاء الدالة عند تحميل الصفحة
fetchProducts();
