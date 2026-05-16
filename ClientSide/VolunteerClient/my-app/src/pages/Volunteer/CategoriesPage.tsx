import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import axios from "../../services/axios";
import type { CategoryType } from "../../types/categories.types";
import type { RootState, AppDispatch } from "../../redux/store";
import {
  setCategories,
  setVolunteersCounts,
  addSelected,
  removeSelected,
  setSelected,
  resetSelected,
} from "../../redux/slices/categoriesSlice";
import "../../styles/styleCategories.css";

export const CategoriesPage = () => {
  useDocumentTitle("Categories");
  const dispatch = useDispatch<AppDispatch>();

  const categories = useSelector((state: RootState) => state.categories.list);
  const selected = useSelector((state: RootState) => state.categories.selectedIds);
  const volunteersCounts = useSelector((state: RootState) => state.categories.volunteersCounts);
  const user = useSelector((state: RootState) => state.auth.user);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // מחכה שה־user נטען

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/Categories");
        dispatch(setCategories(res.data));

     const counts: Record<number, number> = {}; // ⬅ צריך להיות כאן
await Promise.all(
  res.data.map(async (c: CategoryType) => {
    const r = await axios.get(`/Categories/${c.id}/usersCount`);
    counts[c.id] = r.data;
  })
);
dispatch(setVolunteersCounts(counts));


        // אתחול selected בהתאם למשתמש החדש
        if (user.categories && user.categories.length > 0) {
          dispatch(setSelected(user.categories.map((c: CategoryType) => c.id)));
        } else {
          dispatch(resetSelected());
        }

      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [dispatch, user]);

  const toggle = async (id: number) => {
    if (!user) return;

    const isSelected = selected.includes(id);
    try {
      if (isSelected) {
        await axios.delete(`/Users/${user.id}/category/${id}`);
        dispatch(removeSelected(id));
        dispatch(setVolunteersCounts({
          ...volunteersCounts,
          [id]: (volunteersCounts[id] ?? 1) - 1
        }));
      } else {
        await axios.post(`/Users/${user.id}/category/${id}`);
        dispatch(addSelected(id));
        dispatch(setVolunteersCounts({
          ...volunteersCounts,
          [id]: (volunteersCounts[id] ?? 0) + 1
        }));
      }
    } catch (err) {
      console.error("Failed to update categories:", err);
    }
  };

  return (
    <div className="cat-root">
      {/* Stats Bar */}
      <div className="cat-bar">
        <div className="cat-bar-stats">
          <div className="cat-bar-stat">
            <span className="cat-bar-n">{selected.length}</span>
            <span className="cat-bar-l">Selected</span>
          </div>
          <div className="cat-bar-stat">
            <span className="cat-bar-n">{categories.length}</span>
            <span className="cat-bar-l">Available</span>
          </div>
        </div>
        <p className="cat-bar-tip">
          The more categories you select, the easier<br />
          it is for us to find the right match for you 🤝
        </p>
      </div>

      {/* Section label */}
      <div className="cat-section-label">CATEGORIES SET BY YOUR ORGANIZATION</div>

      {/* Grid */}
      {loading ? (
        <div className="cat-loading">Loading categories...</div>
      ) : (
        <div className="cat-grid">
          {categories.map(cat => {
            const isOn = selected.includes(cat.id);
            return (
              <div
                key={cat.id}
                className={`cat-card ${isOn ? "cat-card-on" : ""}`}
                onClick={() => toggle(cat.id)}
              >
                <div className="cat-card-top">
                  <span className="cat-card-emoji">{cat.icon}</span>
                  <div className={`cat-card-check ${isOn ? "cat-card-check-on" : ""}`}>
                    {isOn && "✓"}
                  </div>
                </div>
                <div className="cat-card-name">{cat.name}</div>
                <div className="cat-card-desc">{cat.description}</div>
                <div className="cat-card-volunteers">
                  {volunteersCounts[cat.id] ?? 0} volunteers
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Current Selection */}
      {!loading && selected.length > 0 && (
        <>
          <div className="cat-section-label" style={{ marginTop: 40 }}>YOUR CURRENT SELECTION</div>
          <div className="cat-grid">
            {selected.map(id => {
              const cat = categories.find(c => c.id === id);
              if (!cat) return null;
              return (
                <div key={id} className="cat-card cat-card-on">
                  <div className="cat-card-top">
                    <span className="cat-card-emoji">{cat.icon}</span>
                    <button
                      className="cat-sel-remove"
                      onClick={(e) => { e.stopPropagation(); toggle(id); }}
                    >×</button>
                  </div>
                  <div className="cat-card-name">{cat.name}</div>
                  <div className="cat-card-desc">{cat.description}</div>
                  <div className="cat-card-volunteers">
                    {volunteersCounts[cat.id] ?? 0} volunteers
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};


