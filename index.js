
const categoryFilter = document.getElementById("categoryFilter");
const productGrid = document.getElementById("productGrid");
const viewLikedBtn = document.getElementById("viewLikedBtn");
const backBtn = document.getElementById("backBtn");
const searchInput = document.getElementById("searchInput");

const base_URL = "https://fakestoreapi.com";

let comparisonList = [];
let allLoadedProducts = [];

// Load all the categories
fetch(`${base_URL}/products/categories`)
  .then(res => res.json())
  .then(categories => {
    categories.forEach(category => {
      const button = document.createElement("button");
      button.innerText = category.toUpperCase();
      button.className = "category-btn";
      button.onclick = () => {
        loadProducts(category);
        highlightSelected(button);
      };
      categoryFilter.appendChild(button);
    });

    // Load first category by default
    if (categories.length > 0) {
      loadProducts(categories[0]);
    }
  });

// Load products by category
function loadProducts(category) {
  fetch(`${base_URL}/products/category/${encodeURIComponent(category)}`)
    .then(res => res.json())
    .then(products => {
      allLoadedProducts = products;
      displayProducts(products);
    });

  backBtn.style.display = "none";
  viewLikedBtn.style.display = "inline-block";
}

// Display products
function displayProducts(products) {
  productGrid.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    const likedProducts = JSON.parse(localStorage.getItem("likedProducts")) || [];
    const isLiked = likedProducts.includes(product.id);

    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p class="price">$${product.price}</p>
      <p>⭐ ${product.rating.rate} (${product.rating.count} reviews)</p>
      <p>${product.description.slice(0, 80)}...</p>
      <button class="like-btn" data-id="${product.id}">
        ${isLiked ? '❤️' : '🤍'} Like
      </button>
    `;

    // Like button logic
    const likeBtn = card.querySelector(".like-btn");
    likeBtn.addEventListener("click", () => {
      let likedProducts = JSON.parse(localStorage.getItem("likedProducts")) || [];
      const id = parseInt(likeBtn.dataset.id);

      if (likedProducts.includes(id)) {
        likedProducts = likedProducts.filter(pid => pid !== id);
      } else {
        likedProducts.push(id);
      }

      localStorage.setItem("likedProducts", JSON.stringify(likedProducts));
      displayProducts(products);
    });

    // Compare checkbox
    const compareCheckbox = document.createElement("input");
    compareCheckbox.type = "checkbox";
    compareCheckbox.className = "compare-checkbox";
    compareCheckbox.dataset.id = product.id;
    compareCheckbox.checked = comparisonList.includes(product.id);
    compareCheckbox.style.marginTop = "0.5rem";

    compareCheckbox.addEventListener("change", () => {
      const id = product.id;
      if (compareCheckbox.checked) {
        if (comparisonList.length < 2) {
          comparisonList.push(id);
        } else {
          alert("You can only compare 2 products at a time.");
          compareCheckbox.checked = false;
        }
      } else {
        comparisonList = comparisonList.filter(item => item !== id);
      }

      toggleComparisonView();
    });

    card.appendChild(compareCheckbox);
    const label = document.createElement("label");
    label.innerText = " Compare";
    card.appendChild(label);

    productGrid.appendChild(card);
  });
}

// View liked products
viewLikedBtn.addEventListener("click", () => {
  fetch(`${base_URL}/products`)
    .then(res => res.json())
    .then(allProducts => {
      const liked = JSON.parse(localStorage.getItem("likedProducts")) || [];
      const likedItems = allProducts.filter(p => liked.includes(p.id));
      displayProducts(likedItems);
      backBtn.style.display = "inline-block";
      viewLikedBtn.style.display = "none";
    });
});

// Back to all
backBtn.addEventListener("click", () => {
  fetch(`${base_URL}/products/categories`)
    .then(res => res.json())
    .then(categories => {
      if (categories.length > 0) {
        loadProducts(categories[0]);
      }
    });

  backBtn.style.display = "none";
  viewLikedBtn.style.display = "inline-block";
});

// Comparison logic
function toggleComparisonView() {
  const container = document.getElementById("comparisonContainer");
  const grid = document.getElementById("comparisonGrid");

  if (comparisonList.length === 2) {
    fetch(`${base_URL}/products`)
      .then(res => res.json())
      .then(all => {
        const items = all.filter(p => comparisonList.includes(p.id));
        grid.innerHTML = "";

        items.forEach(item => {
          const div = document.createElement("div");
          div.className = "compare-card";
          div.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <h3>${item.title}</h3>
            <p class="price">$${item.price}</p>
            <p>⭐ ${item.rating.rate} (${item.rating.count})</p>
            <p>${item.description.slice(0, 100)}...</p>
          `;
          grid.appendChild(div);
        });

        container.style.display = "block";
      });
  } else {
    container.style.display = "none";
  }
}

// Clear comparison
document.getElementById("clearCompareBtn").addEventListener("click", () => {
  comparisonList = [];
  toggleComparisonView();
  const selectedCategory = document.querySelector(".category-btn.selected");
  if (selectedCategory) {
    loadProducts(selectedCategory.innerText.toLowerCase());
  } else {
    fetch(`${base_URL}/products/categories`)
      .then(res => res.json())
      .then(categories => {
        loadProducts(categories[0]);
      });
  }
});

// Search functionality
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = allLoadedProducts.filter(product =>
    product.title.toLowerCase().includes(query)
  );
  displayProducts(filtered);
});

// Highlight selected category
function highlightSelected(button) {
  document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("selected"));
  button.classList.add("selected");
}
