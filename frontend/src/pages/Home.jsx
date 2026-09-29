import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api, { getMediaUrl } from "../api/api";
import { featuredCollection } from "../data/collection";
import { useShop } from "../context/ShopContext";

const defaultCategories = ["Pieces de monnaie", "Poupees anciennes", "Photographie vintage", "Vinyles & musique", "Objets anciens", "Arts decoratifs", "Ceramique", "Design & mobilier", "Publicite vintage"];

function keepTwentyFivePerCategory(items) {
  const categoryCounts = new Map();

  return items.filter((item) => {
    const category = item.category_name || "Sans catégorie";
    const count = categoryCounts.get(category) || 0;

    if (count >= 25) {
      return false;
    }

    categoryCounts.set(category, count + 1);
    return true;
  });
}

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tout");
  const [sort, setSort] = useState("recent");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const { addToCart, toggleFavorite, isFavorite } = useShop();

  useEffect(() => {
    api.get("products/")
      .then((response) => setProducts(keepTwentyFivePerCategory(response.data.length ? response.data : featuredCollection)))
      .catch(() => setProducts(featuredCollection))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const availableCategories = products.map((product) => product.category_name).filter(Boolean);
    return ["Tout", ...new Set([...defaultCategories, ...availableCategories])];
  }, [products]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();
    const filtered = products.filter((product) => {
      const price = Number(product.price);
      const matchesCategory = category === "Tout" || product.category_name === category;
      const matchesSearch = !normalizedSearch || `${product.title} ${product.category_name} ${product.description}`.toLowerCase().includes(normalizedSearch);
      const matchesMin = !minPrice || price >= Number(minPrice);
      const matchesMax = !maxPrice || price <= Number(maxPrice);
      return matchesCategory && matchesSearch && matchesMin && matchesMax;
    });

    return [...filtered].sort((first, second) => sort === "price-low" ? Number(first.price) - Number(second.price) : sort === "price-high" ? Number(second.price) - Number(first.price) : 0);
  }, [category, maxPrice, minPrice, products, search, sort]);

  function resetFilters() {
    setCategory("Tout");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setSort("recent");
  }

  if (loading) return <p className="page-loading">Le catalogue s'ouvre...</p>;

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <div><p className="eyebrow">Collector.shop / Catalogue</p><h1>Objets de collection</h1></div>
        <p>{visibleProducts.length} article{visibleProducts.length > 1 ? "s" : ""}</p>
      </header>

      <div className="catalog-layout">
        <aside className="filter-panel" aria-label="Filtres du catalogue">
          <div className="filter-heading"><h2>Filtres</h2><button className="reset-filter" onClick={resetFilters}>Réinitialiser</button></div>

          <div className="filter-group">
            <h3>Catégorie</h3>
            <div className="category-filter">
              {categories.map((option) => <button className={category === option ? "filter-option active" : "filter-option"} key={option} onClick={() => setCategory(option)}><span>{option}</span><span className="filter-check">{category === option ? "✓" : ""}</span></button>)}
            </div>
          </div>

          <div className="filter-group">
            <h3>Prix</h3>
            <div className="price-fields"><label>Minimum<input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="0 €" /></label><label>Maximum<input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Sans limite" /></label></div>
          </div>
        </aside>

        <section className="catalog-results" id="catalogue">
          <div className="catalogue-tools"><label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une pièce, une marque..." aria-label="Rechercher dans les objets" /></label><label className="sort-box"><span>Trier par</span><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Trier les objets"><option value="recent">Pertinence</option><option value="price-low">Prix croissant</option><option value="price-high">Prix décroissant</option></select></label></div>

          {visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.id}>
            <div className="product-image">
              <Link to={`/products/${product.id}`} aria-label={`Voir ${product.title}`}>
                {product.image ? <img src={getMediaUrl(product.image)} alt={product.title} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = getMediaUrl(product.fallbackImage || "/collection/objects.jpg"); }} /> : <span className="image-placeholder">✦</span>}
              </Link>
              <button className={isFavorite(product.id) ? "favorite-button active" : "favorite-button"} onClick={() => toggleFavorite(product)} aria-label="Ajouter aux favoris">{isFavorite(product.id) ? "♥" : "♡"}</button>
            </div>
            <div className="product-card-body"><p className="product-category">{product.category_name}</p><h3>{product.title}</h3><p className="product-seller">@{product.seller_username}</p><div className="product-footer"><strong className="product-price">{product.price} €</strong><button className="card-cart-button" onClick={() => addToCart(product)}>+ Panier</button><Link className="product-link" to={`/products/${product.id}`}>Voir</Link></div></div>
          </article>)}</div> : <div className="empty-state">Aucun objet ne correspond à vos filtres.</div>}
        </section>
      </div>
    </div>
  );
}

export default Home;
