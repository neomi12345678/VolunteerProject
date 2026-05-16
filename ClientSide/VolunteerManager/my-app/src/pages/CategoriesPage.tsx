// panels/CategoriesPanel.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import {
  fetchCategories,
  addCategoryAsync,
  updateCategoryAsync,
  deleteCategoryAsync,
} from "../redux/slices/categoriesSlice";
import type { CategoryType } from "../redux/slices/categoriesSlice";
import "../styles/styleAdminCatalog.css";
import { ConfirmDelete } from "./shared/Modal";

type View = "list" | "add" | "edit" | "detail";

const ICONS = [
  "🚗","🍽️","🏥","📚","🔧","💛","🧹","🐾",
  "👶","🎨","💪","🌿","📦","💊","🖥️","🎓"
];

function CategoryForm({
  form,
  onChange,
}: {
  form: { name: string; description: string; icon: string };
  onChange: (f: typeof form) => void;
}) {
  return (
    <div className="form-fields">

      <label className="field-label">Icon</label>
      <div className="icon-picker">
        {ICONS.map((ic) => (
          <button
            key={ic}
            type="button"
            className={`icon-option${form.icon === ic ? " icon-option--active" : ""}`}
            onClick={() => onChange({ ...form, icon: ic })}
          >
            {ic}
          </button>
        ))}
      </div>

      <label className="field-label">Name *</label>
      <input
        className="field-input"
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
      />

      <label className="field-label">Description</label>
      <textarea
        className="field-textarea"
        rows={3}
        value={form.description}
        onChange={(e) => onChange({ ...form, description: e.target.value })}
      />

    </div>
  );
}

export default function CategoriesPanel() {

  const dispatch = useDispatch<AppDispatch>();

  const items = useSelector((state: RootState) => state.categories.items);
  const status = useSelector((state: RootState) => state.categories.status);

  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<CategoryType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryType | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "🚗",
  });

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCategories());
    }
  }, [status, dispatch]);

  const filtered = items.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  function goAdd() {
    setForm({ name: "", description: "", icon: "🚗" });
    setView("add");
  }

  function goEdit(c: CategoryType) {
    setSelected(c);
    setForm({
      name: c.name,
      description: c.description,
      icon: c.icon,
    });
    setView("edit");
  }

  function goDetail(c: CategoryType) {
    setSelected(c);
    setView("detail");
  }

  function goList() {
    setView("list");
    setSelected(null);
  }

  function saveAdd() {
    if (!form.name.trim()) return;

    dispatch(addCategoryAsync(form));
    goList();
  }

  function saveEdit() {
    if (!selected) return;

    dispatch(
      updateCategoryAsync({
        id: selected.id,
        ...form,
      })
    );

    goList();
  }

  function doDelete(c: CategoryType) {
    dispatch(deleteCategoryAsync(c.id));
    setDeleteTarget(null);

    if (view !== "list") {
      goList();
    }
  }

  if (view === "list") {
    return (
      <>
        <div className="top-bar">

          <div>
            <div className="page-eyebrow">Manage</div>
            <h1 className="page-title">Categories</h1>
            <p className="panel-sub">{items.length} categories total</p>
          </div>

          <div className="panel-actions">

            <div className="search-wrap">
              <input
                className="search-input"
                placeholder="Search categories…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="btn-add" onClick={goAdd}>
              + Add Category
            </button>

          </div>

        </div>

        <div className="cat-grid">

          {filtered.map((c) => (
            <div
              key={c.id}
              className="cat-card"
              onClick={() => goDetail(c)}
            >

              <div className="cat-card-top">

                <div className="cat-icon-wrap">
                  <span className="cat-icon">{c.icon}</span>
                </div>

                <div
                  className="cat-card-actions"
                  onClick={(e) => e.stopPropagation()}
                >

                  <button
                    className="icon-btn icon-btn--edit"
                    onClick={() => goEdit(c)}
                  >
                    ✏️
                  </button>

                  <button
                    className="icon-btn icon-btn--del"
                    onClick={() => setDeleteTarget(c)}
                  >
                    🗑️
                  </button>

                </div>

              </div>

              <div className="cat-id">#{c.id}</div>
              <div className="cat-name">{c.name}</div>
              <div className="cat-desc">{c.description}</div>

            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state">
              No categories match your search.
            </div>
          )}

        </div>

        {deleteTarget && (
          <ConfirmDelete
            label={deleteTarget.name}
            onConfirm={() => doDelete(deleteTarget)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </>
    );
  }

  if (view === "detail" && selected) {
    return (
      <>
        <div className="top-bar">

          <div>
            <button className="back-btn" onClick={goList}>
              ← Back to Categories
            </button>

            <h1 className="page-title">
              {selected.icon} {selected.name}
            </h1>

            <p className="panel-sub">Category #{selected.id}</p>
          </div>

          <div className="panel-actions">
            <button onClick={() => goEdit(selected)}>Edit</button>
            <button onClick={() => setDeleteTarget(selected)}>Delete</button>
          </div>

        </div>

        <div className="detail-card">

          <div className="detail-icon-wrap">
            <span style={{ fontSize: 48 }}>
              {selected.icon}
            </span>
          </div>

          <div className="view-grid">

            <div className="view-field">
              <span className="view-label">ID</span>
              <span className="view-val">#{selected.id}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Name</span>
              <span className="view-val">{selected.name}</span>
            </div>

            <div className="view-field view-field--full">
              <span className="view-label">Description</span>
              <p className="view-desc">{selected.description}</p>
            </div>

          </div>

        </div>

        {deleteTarget && (
          <ConfirmDelete
            label={deleteTarget.name}
            onConfirm={() => doDelete(deleteTarget)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </>
    );
  }

  if (view === "add") {
    return (
      <>
        <div className="top-bar">

          <div>
            <button className="back-btn" onClick={goList}>
              ← Back
            </button>

            <h1 className="page-title">
              New Category
            </h1>
          </div>

          <div className="panel-actions">
            <button onClick={goList}>Cancel</button>
            <button onClick={saveAdd}>Create Category</button>
          </div>

        </div>

        <div className="form-page-card">
          <CategoryForm
            form={form}
            onChange={setForm}
          />
        </div>
      </>
    );
  }

  if (view === "edit" && selected) {
    return (
      <>
        <div className="top-bar">

          <div>
            <button className="back-btn" onClick={goList}>
              ← Back
            </button>

            <h1 className="page-title">
              Edit · {selected.name}
            </h1>
          </div>

          <div className="panel-actions">
            <button onClick={goList}>Cancel</button>
            <button onClick={saveEdit}>Save Changes</button>
          </div>

        </div>

        <div className="form-page-card">
          <CategoryForm
            form={form}
            onChange={setForm}
          />
        </div>
      </>
    );
  }

  return null;
}
