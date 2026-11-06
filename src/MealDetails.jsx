import { useEffect, useState } from "react";
import axios from "axios";
const API = import.meta.env.VITE_API_URL || "";

export default function MealDetails({ meal, onClose }) {
  const [detail, setDetail] = useState(meal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const id = meal.id || meal.recipe_id || meal.sku;
  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    axios.get(`${API}/api/recipes/${encodeURIComponent(id)}/detail`)
      .then(({data}) => { if (active) setDetail(data.recipe || data.result || data); })
      .catch(() => { if (active) setError("التفاصيل الإضافية غير متاحة؛ المعروض هو ملخص الوصفة."); })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const title = detail.name || detail.title || detail.recipe_name || meal.name || meal.title || "Recipe";
  const image = detail.image_url || detail.image || detail.thumbnail || meal.image_url || meal.image || "";
  const ingredients = detail.ingredients || detail.ingredient_list || [];
  const steps = detail.instructions || detail.steps || detail.method || [];
  const list = Array.isArray(steps) ? steps : String(steps || "").split(/\n+/).filter(Boolean);
  const ingredientText = item => typeof item === "string" ? item : [item.name || item.ingredient, item.quantity || item.amount, item.unit].filter(Boolean).join(" — ");

  return <div className="detail-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section className="detail-modal">
      <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
      {image && <img className="detail-image" src={image} alt={title}/>}
      <div className="detail-content"><span className="eyebrow">FROM AROUND THE WORLD</span><h2>{title}</h2>
        <p className="detail-origin">{detail.subcuisine || detail.cuisine || detail.macro_region || meal.country || "World cuisine"}</p>
        {loading && <p className="text-muted">Loading full recipe...</p>}
        {error && <p className="small text-muted">{error}</p>}
        {ingredients.length > 0 && <><h3>Ingredients</h3><ul>{ingredients.map((x,i)=><li key={i}>{ingredientText(x)}</li>)}</ul></>}
        {list.length > 0 && <><h3>Instructions</h3><ol>{list.map((x,i)=><li key={i}>{typeof x === "string" ? x : x.text || x.instruction || JSON.stringify(x)}</li>)}</ol></>}
        {!ingredients.length && !list.length && <p className="text-muted">The API returned the dish information, but did not include a complete ingredient list or cooking method for this result.</p>}
      </div>
    </section>
  </div>;
}