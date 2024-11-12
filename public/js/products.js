// For Filtering

document.getElementById("allLink").addEventListener("click", function () {
  filterProducts("All");
});
document.getElementById("paintingsLink").addEventListener("click", function () {
  filterProducts("Paintings");
});
document.getElementById("decorLink").addEventListener("click", function () {
  filterProducts("Decor");
});
document.getElementById("giftsLink").addEventListener("click", function () {
  filterProducts("Gifts");
});

function filterProducts(category) {
  const allProducts = document.querySelectorAll("#productsContainer .col-lg-3");

  allProducts.forEach((product) => {
    const productCategory = product.getAttribute("data-category");
    if (category === "All" || productCategory === category) {
      product.style.display = "block";
    } else {
      product.style.display = "none";
    }
  });

  document.querySelectorAll(".filter-links a").forEach((link) => {
    link.classList.remove("active");
  });
  document
    .querySelector(`#${category.toLowerCase()}Link`)
    .classList.add("active");
}

// For Sorting

document.getElementById("sortOptions").addEventListener("change", function () {
  const productsContainer = document.getElementById("productsContainer");
  const products = Array.from(productsContainer.children);

  const sortOption = this.value;

  if (sortOption === "priceLowToHigh") {
    products.sort(
      (a, b) => a.getAttribute("data-price") - b.getAttribute("data-price")
    );
  } else if (sortOption === "priceHighToLow") {
    products.sort(
      (a, b) => b.getAttribute("data-price") - a.getAttribute("data-price")
    );
  } else if (sortOption === "titleAZ") {
    products.sort((a, b) =>
      a.getAttribute("data-title").localeCompare(b.getAttribute("data-title"))
    );
  } else if (sortOption === "titleZA") {
    products.sort((a, b) =>
      b.getAttribute("data-title").localeCompare(a.getAttribute("data-title"))
    );
  }

  productsContainer.innerHTML = "";
  products.forEach((product) => productsContainer.appendChild(product));
});
