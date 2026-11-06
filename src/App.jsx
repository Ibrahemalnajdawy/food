import { useEffect, useState } from "react";
import axios from "axios";
import MealDetails from "./MealDetails.jsx";

const API = import.meta.env.VITE_API_URL || "";
const regions = ["All regions", "Africa", "Asia", "Europe", "North America", "South America", "Middle East", "Oceania"];

export default function App() {
  const [meals, setMeals] = useState([]);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMeal, setSelectedMeal] = useState(null);

  const fetchMeals = async (query = search, selectedRegion = region, selectedCountry = country) => {
    setLoading(true); setError("");
    try {
      const { data } = await axios.get(`${API}/api/recipes`, {
        params: { query, region: selectedRegion, country: selectedCountry, number: 24 }
      });
      setMeals(data.results || []);
      if (!(data.results || []).length) setError("ما لقينا نتائج. جرّب اسم أكلة أو دولة ثانية.");
    } catch (e) {
      setMeals([]);
      setError(e.response?.data?.message || "تعذر الاتصال بالخادم. تأكد من إعداد السيرفر ومفتاح API.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMeals("", "", ""); }, []);

  const titleOf = m => m.name || m.title || m.recipe_name || m.strMeal || "Untitled dish";
  const imageOf = m => m.image_url || m.image || m.thumbnail || m.photo || m.strMealThumb || "";
  const idOf = m => m.id || m.recipe_id || m.sku || m.slug || titleOf(m);

  return <main className="page-shell">
    <nav className="topbar container">
      <a className="brand" href="#"><span className="brand-mark">W</span> WorldTable</a>
      <span className="top-note">A world of flavors, one table.</span>
    </nav>
    <section className="hero container">
      <div className="hero-copy">
        <span className="eyebrow">EXPLORE • COOK • ENJOY</span>
        <h1>Discover food<br/><em>without borders.</em></h1>
        <p>Explore dishes and cooking inspiration from cuisines around the world.</p>
      </div>
      <div className="hero-art" aria-hidden="true"><div className="plate">🍲</div><span className="float f1">🥑</span><span className="float f2">🍋</span><span className="float f3">🌶️</span></div>
    </section>

    <section className="container search-panel">
      <div className="search-heading"><div><span className="eyebrow">YOUR NEXT FAVORITE MEAL</span><h2>Find a recipe</h2></div><span className="global-tag">🌍 Global kitchen</span></div>
      <div className="row g-2 align-items-center">
        <div className="col-lg-6"><div className="search-wrap"><span>⌕</span><input className="form-control" value={search} placeholder="Search meals, ingredients..." onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchMeals()}/></div></div>
        <div className="col-lg-3"><select className="form-select" value={region} onChange={e => {setRegion(e.target.value); fetchMeals(search, e.target.value, country);}}><option value="">All regions</option>{regions.slice(1).map(r => <option key={r}>{r}</option>)}</select></div>
        <div className="col-lg-3"><input className="form-control" value={country} placeholder="Country (e.g. Jordan)" onChange={e => setCountry(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchMeals(search, region, country)}/></div>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2"><small className="text-muted">Try: biryani, pasta, ramen, mansaf...</small><button className="btn search-btn" onClick={() => fetchMeals()}>Search recipes <span>→</span></button></div>
    </section>

    <section className="container results-section">
      <div className="section-head"><div><span className="eyebrow">TASTE THE WORLD</span><h2>Recipes to explore</h2></div><span className="result-count">{meals.length} results</span></div>
      {loading && <div className="status"><div className="spinner-border spinner-border-sm me-2"/> Loading delicious ideas...</div>}
      {!loading && error && <div className="alert alert-light border">{error}</div>}
      {!loading && !error && meals.length === 0 && <div className="empty-state">Start by searching for a dish or country.</div>}
      <div className="meal-grid">
        {meals.map((m, i) => <article className="meal-card" key={idOf(m) + i} onClick={() => setSelectedMeal(m)} role="button" tabIndex="0" onKeyDown={e => e.key === "Enter" && setSelectedMeal(m)}>
          <div className="meal-image">{imageOf(m) ? <img src={imageOf(m)} alt={titleOf(m)} loading="lazy"/> : <div className="image-placeholder">🍽️</div>}<span className="card-number">{String(i+1).padStart(2,"0")}</span></div>
          <div className="meal-info"><h3>{titleOf(m)}</h3><p>{m.subcuisine || m.cuisine || m.macro_region || m.country || "World cuisine"}</p><span className="view-recipe">View recipe <b>↗</b></span></div>
        </article>)}
      </div>
    </section>
    <footer className="container footer"><span>WorldTable</span><span>Made for curious food lovers.</span></footer>
    {selectedMeal && <MealDetails meal={selectedMeal} onClose={() => setSelectedMeal(null)}/>}
  </main>;
}