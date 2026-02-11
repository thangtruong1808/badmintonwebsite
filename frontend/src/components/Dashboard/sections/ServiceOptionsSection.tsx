import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { TextInput, NumberInput, FormActions } from "../Shared/inputs";
import { apiFetch } from "../../../utils/api";

type TabId = "strings" | "tensions" | "stencils" | "grips";

interface ServiceStringRow {
  id: number;
  name: string;
  image_url: string | null;
  display_order: number;
  colours: { id: number; string_id: number; colour: string; display_order: number }[];
}

interface ServiceTensionRow {
  id: number;
  label: string;
  display_order: number;
}

interface ServiceStencilRow {
  id: number;
  value: string;
  label: string;
  display_order: number;
}

interface ServiceGripRow {
  id: number;
  value: string;
  label: string;
  display_order: number;
}

interface ColourRow {
  id: number;
  string_id: number;
  colour: string;
  display_order: number;
}

const STRING_COLUMNS: Column<ServiceStringRow>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  {
    key: "image_url",
    label: "Flyer",
    render: (r) => (r.image_url ? "Yes" : "—"),
  },
  { key: "display_order", label: "Order" },
  {
    key: "colours",
    label: "Colours",
    render: (r) =>
      r.colours?.length
        ? r.colours.map((c) => c.colour).join(", ")
        : "—",
  },
];

const TENSION_COLUMNS: Column<ServiceTensionRow>[] = [
  { key: "id", label: "ID" },
  { key: "label", label: "Label" },
  { key: "display_order", label: "Order" },
];

const STENCIL_COLUMNS: Column<ServiceStencilRow>[] = [
  { key: "id", label: "ID" },
  { key: "label", label: "Label" },
  { key: "value", label: "Value", render: (r) => r.value || "—" },
  { key: "display_order", label: "Order" },
];

const GRIP_COLUMNS: Column<ServiceGripRow>[] = [
  { key: "id", label: "ID" },
  { key: "label", label: "Label" },
  { key: "value", label: "Value", render: (r) => r.value || "—" },
  { key: "display_order", label: "Order" },
];

const TABS: { id: TabId; label: string }[] = [
  { id: "strings", label: "Strings" },
  { id: "tensions", label: "Tensions" },
  { id: "stencils", label: "Stencils" },
  { id: "grips", label: "Grips" },
];

const ServiceOptionsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("strings");

  const [strings, setStrings] = useState<ServiceStringRow[]>([]);
  const [tensions, setTensions] = useState<ServiceTensionRow[]>([]);
  const [stencils, setStencils] = useState<ServiceStencilRow[]>([]);
  const [grips, setGrips] = useState<ServiceGripRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [stringModalOpen, setStringModalOpen] = useState(false);
  const [editingString, setEditingString] = useState<ServiceStringRow | null>(null);
  const [stringForm, setStringForm] = useState({
    name: "",
    image_url: "",
    display_order: 0,
  });
  const [stringFormError, setStringFormError] = useState<string | null>(null);
  const [colours, setColours] = useState<ColourRow[]>([]);
  const [newColour, setNewColour] = useState("");
  const [stringDeleteTarget, setStringDeleteTarget] = useState<ServiceStringRow | null>(null);

  const [tensionModalOpen, setTensionModalOpen] = useState(false);
  const [editingTension, setEditingTension] = useState<ServiceTensionRow | null>(null);
  const [tensionForm, setTensionForm] = useState({ label: "", display_order: 0 });
  const [tensionFormError, setTensionFormError] = useState<string | null>(null);
  const [tensionDeleteTarget, setTensionDeleteTarget] = useState<ServiceTensionRow | null>(null);

  const [stencilModalOpen, setStencilModalOpen] = useState(false);
  const [editingStencil, setEditingStencil] = useState<ServiceStencilRow | null>(null);
  const [stencilForm, setStencilForm] = useState({ value: "", label: "", display_order: 0 });
  const [stencilFormError, setStencilFormError] = useState<string | null>(null);
  const [stencilDeleteTarget, setStencilDeleteTarget] = useState<ServiceStencilRow | null>(null);

  const [gripModalOpen, setGripModalOpen] = useState(false);
  const [editingGrip, setEditingGrip] = useState<ServiceGripRow | null>(null);
  const [gripForm, setGripForm] = useState({ value: "", label: "", display_order: 0 });
  const [gripFormError, setGripFormError] = useState<string | null>(null);
  const [gripDeleteTarget, setGripDeleteTarget] = useState<ServiceGripRow | null>(null);

  const fetchStrings = async () => {
    const res = await apiFetch("/api/dashboard/service-options/strings");
    if (res.ok) setStrings((await res.json()) ?? []);
  };
  const fetchTensions = async () => {
    const res = await apiFetch("/api/dashboard/service-options/tensions");
    if (res.ok) setTensions((await res.json()) ?? []);
  };
  const fetchStencils = async () => {
    const res = await apiFetch("/api/dashboard/service-options/stencils");
    if (res.ok) setStencils((await res.json()) ?? []);
  };
  const fetchGrips = async () => {
    const res = await apiFetch("/api/dashboard/service-options/grips");
    if (res.ok) setGrips((await res.json()) ?? []);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStrings(), fetchTensions(), fetchStencils(), fetchGrips()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openStringCreate = () => {
    setEditingString(null);
    setStringForm({ name: "", image_url: "", display_order: 0 });
    setColours([]);
    setNewColour("");
    setStringFormError(null);
    setStringModalOpen(true);
  };

  const openStringEdit = (row: ServiceStringRow) => {
    setEditingString(row);
    setStringForm({
      name: row.name,
      image_url: row.image_url ?? "",
      display_order: row.display_order,
    });
    setColours(row.colours ?? []);
    setNewColour("");
    setStringFormError(null);
    setStringModalOpen(true);
  };

  const fetchColoursForString = async (stringId: number) => {
    const res = await apiFetch(`/api/dashboard/service-options/strings/${stringId}/colours`);
    if (res.ok) setColours((await res.json()) ?? []);
  };

  const handleStringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStringFormError(null);
    if (!stringForm.name.trim()) {
      setStringFormError("Name is required.");
      return;
    }
    try {
      if (editingString) {
        const res = await apiFetch(`/api/dashboard/service-options/strings/${editingString.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: stringForm.name.trim(),
            image_url: stringForm.image_url.trim() || null,
            display_order: stringForm.display_order,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setStringFormError(data.message || "Failed to update.");
          return;
        }
        await fetchStrings();
      } else {
        const res = await apiFetch("/api/dashboard/service-options/strings", {
          method: "POST",
          body: JSON.stringify({
            name: stringForm.name.trim(),
            image_url: stringForm.image_url.trim() || null,
            display_order: stringForm.display_order,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setStringFormError(data.message || "Failed to create.");
          return;
        }
        await fetchStrings();
      }
      setStringModalOpen(false);
    } catch {
      setStringFormError("Something went wrong.");
    }
  };

  const addColour = async () => {
    if (!editingString || !newColour.trim()) return;
    const res = await apiFetch(
      `/api/dashboard/service-options/strings/${editingString.id}/colours`,
      {
        method: "POST",
        body: JSON.stringify({ colour: newColour.trim() }),
      }
    );
    if (res.ok) {
      await fetchColoursForString(editingString.id);
      setNewColour("");
    }
  };

  const removeColour = async (colourId: number) => {
    const res = await apiFetch(`/api/dashboard/service-options/colours/${colourId}`, {
      method: "DELETE",
    });
    if (res.ok && editingString) await fetchColoursForString(editingString.id);
  };

  const handleStringDelete = async (row: ServiceStringRow) => {
    const res = await apiFetch(`/api/dashboard/service-options/strings/${row.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setStrings((prev) => prev.filter((r) => r.id !== row.id));
      setStringDeleteTarget(null);
    }
  };

  const openTensionCreate = () => {
    setEditingTension(null);
    setTensionForm({ label: "", display_order: 0 });
    setTensionFormError(null);
    setTensionModalOpen(true);
  };

  const openTensionEdit = (row: ServiceTensionRow) => {
    setEditingTension(row);
    setTensionForm({ label: row.label, display_order: row.display_order });
    setTensionFormError(null);
    setTensionModalOpen(true);
  };

  const handleTensionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTensionFormError(null);
    if (!tensionForm.label.trim()) {
      setTensionFormError("Label is required.");
      return;
    }
    try {
      if (editingTension) {
        const res = await apiFetch(
          `/api/dashboard/service-options/tensions/${editingTension.id}`,
          { method: "PUT", body: JSON.stringify(tensionForm) }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setTensionFormError(data.message || "Failed to update.");
          return;
        }
      } else {
        const res = await apiFetch("/api/dashboard/service-options/tensions", {
          method: "POST",
          body: JSON.stringify(tensionForm),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setTensionFormError(data.message || "Failed to create.");
          return;
        }
      }
      await fetchTensions();
      setTensionModalOpen(false);
    } catch {
      setTensionFormError("Something went wrong.");
    }
  };

  const handleTensionDelete = async (row: ServiceTensionRow) => {
    const res = await apiFetch(`/api/dashboard/service-options/tensions/${row.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setTensions((prev) => prev.filter((r) => r.id !== row.id));
      setTensionDeleteTarget(null);
    }
  };

  const openStencilCreate = () => {
    setEditingStencil(null);
    setStencilForm({ value: "", label: "", display_order: 0 });
    setStencilFormError(null);
    setStencilModalOpen(true);
  };

  const openStencilEdit = (row: ServiceStencilRow) => {
    setEditingStencil(row);
    setStencilForm({ value: row.value, label: row.label, display_order: row.display_order });
    setStencilFormError(null);
    setStencilModalOpen(true);
  };

  const handleStencilSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStencilFormError(null);
    if (!stencilForm.label.trim()) {
      setStencilFormError("Label is required.");
      return;
    }
    try {
      if (editingStencil) {
        const res = await apiFetch(
          `/api/dashboard/service-options/stencils/${editingStencil.id}`,
          { method: "PUT", body: JSON.stringify(stencilForm) }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setStencilFormError(data.message || "Failed to update.");
          return;
        }
      } else {
        const res = await apiFetch("/api/dashboard/service-options/stencils", {
          method: "POST",
          body: JSON.stringify(stencilForm),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setStencilFormError(data.message || "Failed to create.");
          return;
        }
      }
      await fetchStencils();
      setStencilModalOpen(false);
    } catch {
      setStencilFormError("Something went wrong.");
    }
  };

  const handleStencilDelete = async (row: ServiceStencilRow) => {
    const res = await apiFetch(`/api/dashboard/service-options/stencils/${row.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setStencils((prev) => prev.filter((r) => r.id !== row.id));
      setStencilDeleteTarget(null);
    }
  };

  const openGripCreate = () => {
    setEditingGrip(null);
    setGripForm({ value: "", label: "", display_order: 0 });
    setGripFormError(null);
    setGripModalOpen(true);
  };

  const openGripEdit = (row: ServiceGripRow) => {
    setEditingGrip(row);
    setGripForm({ value: row.value, label: row.label, display_order: row.display_order });
    setGripFormError(null);
    setGripModalOpen(true);
  };

  const handleGripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGripFormError(null);
    if (!gripForm.label.trim()) {
      setGripFormError("Label is required.");
      return;
    }
    try {
      if (editingGrip) {
        const res = await apiFetch(`/api/dashboard/service-options/grips/${editingGrip.id}`, {
          method: "PUT",
          body: JSON.stringify(gripForm),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setGripFormError(data.message || "Failed to update.");
          return;
        }
      } else {
        const res = await apiFetch("/api/dashboard/service-options/grips", {
          method: "POST",
          body: JSON.stringify(gripForm),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setGripFormError(data.message || "Failed to create.");
          return;
        }
      }
      await fetchGrips();
      setGripModalOpen(false);
    } catch {
      setGripFormError("Something went wrong.");
    }
  };

  const handleGripDelete = async (row: ServiceGripRow) => {
    const res = await apiFetch(`/api/dashboard/service-options/grips/${row.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setGrips((prev) => prev.filter((r) => r.id !== row.id));
      setGripDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-2 font-calibri text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-rose-500 text-white"
                  : "bg-white text-gray-700 hover:bg-rose-50 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (activeTab === "strings") openStringCreate();
              else if (activeTab === "tensions") openTensionCreate();
              else if (activeTab === "stencils") openStencilCreate();
              else openGripCreate();
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600"
          >
            <FaPlus size={16} />
            Add {TABS.find((t) => t.id === activeTab)?.label.slice(0, -1) ?? "Item"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="font-calibri text-gray-600">Loading...</p>
      ) : (
        <>
          {activeTab === "strings" && (
            <DataTable
              columns={STRING_COLUMNS}
              data={strings}
              getRowId={(r) => r.id}
              onEdit={openStringEdit}
              onDelete={(r) => setStringDeleteTarget(r)}
              emptyMessage="No strings yet."
            />
          )}
          {activeTab === "tensions" && (
            <DataTable
              columns={TENSION_COLUMNS}
              data={tensions}
              getRowId={(r) => r.id}
              onEdit={openTensionEdit}
              onDelete={(r) => setTensionDeleteTarget(r)}
              emptyMessage="No tensions yet."
            />
          )}
          {activeTab === "stencils" && (
            <DataTable
              columns={STENCIL_COLUMNS}
              data={stencils}
              getRowId={(r) => r.id}
              onEdit={openStencilEdit}
              onDelete={(r) => setStencilDeleteTarget(r)}
              emptyMessage="No stencils yet."
            />
          )}
          {activeTab === "grips" && (
            <DataTable
              columns={GRIP_COLUMNS}
              data={grips}
              getRowId={(r) => r.id}
              onEdit={openGripEdit}
              onDelete={(r) => setGripDeleteTarget(r)}
              emptyMessage="No grips yet."
            />
          )}
        </>
      )}

      {/* String modal */}
      <FormModal
        title={editingString ? "Edit String" : "Add String"}
        open={stringModalOpen}
        onClose={() => setStringModalOpen(false)}
        onSubmit={handleStringSubmit}
        maxWidth="2xl"
      >
        {stringFormError && (
          <p className="text-sm text-red-600 font-calibri mb-2">{stringFormError}</p>
        )}
        <TextInput
          label="Name"
          name="name"
          value={stringForm.name}
          onChange={(e) => setStringForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <TextInput
          label="Flyer (Image URL)"
          name="image_url"
          value={stringForm.image_url}
          onChange={(e) => setStringForm((f) => ({ ...f, image_url: e.target.value }))}
          placeholder="Optional: URL to flyer image"
        />
        <NumberInput
          label="Display order"
          name="display_order"
          value={stringForm.display_order}
          onChange={(e) =>
            setStringForm((f) => ({ ...f, display_order: Number(e.target.value) || 0 }))
          }
        />
        {editingString && (
          <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
            <p className="font-calibri text-sm font-medium text-gray-700">Colours</p>
            <div className="flex flex-wrap gap-2">
              {colours.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-sm font-calibri"
                >
                  {c.colour}
                  <button
                    type="button"
                    onClick={() => removeColour(c.id)}
                    className="text-gray-500 hover:text-red-600"
                    aria-label={`Remove ${c.colour}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newColour}
                onChange={(e) => setNewColour(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColour())}
                placeholder="Add colour"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-calibri text-sm"
              />
              <button
                type="button"
                onClick={addColour}
                disabled={!newColour.trim()}
                className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-calibri text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        )}
        <FormActions onCancel={() => setStringModalOpen(false)} />
      </FormModal>

      {/* Tension modal */}
      <FormModal
        title={editingTension ? "Edit Tension" : "Add Tension"}
        open={tensionModalOpen}
        onClose={() => setTensionModalOpen(false)}
        onSubmit={handleTensionSubmit}
      >
        {tensionFormError && (
          <p className="text-sm text-red-600 font-calibri mb-2">{tensionFormError}</p>
        )}
        <TextInput
          label="Label"
          name="label"
          value={tensionForm.label}
          onChange={(e) => setTensionForm((f) => ({ ...f, label: e.target.value }))}
          placeholder="e.g. 20 lbs"
          required
        />
        <NumberInput
          label="Display order"
          name="display_order"
          value={tensionForm.display_order}
          onChange={(e) =>
            setTensionForm((f) => ({ ...f, display_order: Number(e.target.value) || 0 }))
          }
        />
        <FormActions onCancel={() => setTensionModalOpen(false)} />
      </FormModal>

      {/* Stencil modal */}
      <FormModal
        title={editingStencil ? "Edit Stencil" : "Add Stencil"}
        open={stencilModalOpen}
        onClose={() => setStencilModalOpen(false)}
        onSubmit={handleStencilSubmit}
      >
        {stencilFormError && (
          <p className="text-sm text-red-600 font-calibri mb-2">{stencilFormError}</p>
        )}
        <TextInput
          label="Label"
          name="label"
          value={stencilForm.label}
          onChange={(e) => setStencilForm((f) => ({ ...f, label: e.target.value }))}
          placeholder="e.g. Yonex (+$2)"
          required
        />
        <TextInput
          label="Value (stored value)"
          name="value"
          value={stencilForm.value}
          onChange={(e) => setStencilForm((f) => ({ ...f, value: e.target.value }))}
          placeholder="Same as label or leave empty for None"
        />
        <NumberInput
          label="Display order"
          name="display_order"
          value={stencilForm.display_order}
          onChange={(e) =>
            setStencilForm((f) => ({ ...f, display_order: Number(e.target.value) || 0 }))
          }
        />
        <FormActions onCancel={() => setStencilModalOpen(false)} />
      </FormModal>

      {/* Grip modal */}
      <FormModal
        title={editingGrip ? "Edit Grip" : "Add Grip"}
        open={gripModalOpen}
        onClose={() => setGripModalOpen(false)}
        onSubmit={handleGripSubmit}
      >
        {gripFormError && (
          <p className="text-sm text-red-600 font-calibri mb-2">{gripFormError}</p>
        )}
        <TextInput
          label="Label"
          name="label"
          value={gripForm.label}
          onChange={(e) => setGripForm((f) => ({ ...f, label: e.target.value }))}
          placeholder="e.g. Lingmei thin grip (+$3)"
          required
        />
        <TextInput
          label="Value (stored value)"
          name="value"
          value={gripForm.value}
          onChange={(e) => setGripForm((f) => ({ ...f, value: e.target.value }))}
          placeholder="Same as label or leave empty for None"
        />
        <NumberInput
          label="Display order"
          name="display_order"
          value={gripForm.display_order}
          onChange={(e) =>
            setGripForm((f) => ({ ...f, display_order: Number(e.target.value) || 0 }))
          }
        />
        <FormActions onCancel={() => setGripModalOpen(false)} />
      </FormModal>

      <ConfirmDialog
        open={!!stringDeleteTarget}
        title="Delete String"
        message={
          stringDeleteTarget
            ? `Delete "${stringDeleteTarget.name}"? This will also remove its colours.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => stringDeleteTarget && handleStringDelete(stringDeleteTarget)}
        onCancel={() => setStringDeleteTarget(null)}
      />
      <ConfirmDialog
        open={!!tensionDeleteTarget}
        title="Delete Tension"
        message={tensionDeleteTarget ? `Delete "${tensionDeleteTarget.label}"?` : ""}
        confirmLabel="Delete"
        onConfirm={() => tensionDeleteTarget && handleTensionDelete(tensionDeleteTarget)}
        onCancel={() => setTensionDeleteTarget(null)}
      />
      <ConfirmDialog
        open={!!stencilDeleteTarget}
        title="Delete Stencil"
        message={stencilDeleteTarget ? `Delete "${stencilDeleteTarget.label}"?` : ""}
        confirmLabel="Delete"
        onConfirm={() => stencilDeleteTarget && handleStencilDelete(stencilDeleteTarget)}
        onCancel={() => setStencilDeleteTarget(null)}
      />
      <ConfirmDialog
        open={!!gripDeleteTarget}
        title="Delete Grip"
        message={gripDeleteTarget ? `Delete "${gripDeleteTarget.label}"?` : ""}
        confirmLabel="Delete"
        onConfirm={() => gripDeleteTarget && handleGripDelete(gripDeleteTarget)}
        onCancel={() => setGripDeleteTarget(null)}
      />
    </div>
  );
};

export default ServiceOptionsSection;
