import React, { useState, useEffect } from "react";
import { FaPlus, FaSpinner } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import { apiFetch } from "../../../utils/api";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import {
  TextInput,
  Select,
  TextArea,
  Checkbox,
  FormActions,
} from "../Shared/inputs";

interface VetsEventRow {
  id: number;
  title: string;
  location: string;
  eventDate: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VetsInterestRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  playerRating: string | null;
  status: "interested" | "contacted" | "registered" | "cancelled";
  createdAt: string;
  updatedAt: string;
  events?: VetsEventRow[];
}

type TabType = "events" | "interests";

const STATUS_OPTIONS = [
  { value: "interested", label: "Interested" },
  { value: "contacted", label: "Contacted" },
  { value: "registered", label: "Registered" },
  { value: "cancelled", label: "Cancelled" },
];

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const EVENT_COLUMNS: Column<VetsEventRow>[] = [
  {
    key: "seq",
    label: "#",
    render: (_row, index) => (index !== undefined ? index + 1 : ""),
  },
  { key: "title", label: "Title" },
  { key: "location", label: "Location" },
  {
    key: "eventDate",
    label: "Date",
    render: (row) => formatDate(row.eventDate),
  },
  {
    key: "isActive",
    label: "Active",
    render: (row) => (
      <span
        className={`inline-block px-2 py-1 rounded-full text-xs font-calibri ${
          row.isActive
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {row.isActive ? "Yes" : "No"}
      </span>
    ),
  },
  {
    key: "createdAt",
    label: "Created",
    render: (row) => formatDate(row.createdAt),
  },
];

const INTEREST_COLUMNS: Column<VetsInterestRow>[] = [
  {
    key: "seq",
    label: "#",
    render: (_row, index) => (index !== undefined ? index + 1 : ""),
  },
  {
    key: "name",
    label: "Name",
    render: (row) => `${row.firstName} ${row.lastName}`,
  },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone", render: (row) => row.phone || "—" },
  {
    key: "playerRating",
    label: "Rating",
    render: (row) => row.playerRating || "—",
  },
  {
    key: "status",
    label: "Status",
    render: (row) => {
      const colors: Record<string, string> = {
        interested: "bg-blue-100 text-blue-800",
        contacted: "bg-yellow-100 text-yellow-800",
        registered: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
      };
      return (
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-calibri capitalize ${
            colors[row.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {row.status}
        </span>
      );
    },
  },
  {
    key: "events",
    label: "Events",
    render: (row) => (row.events?.length || 0),
  },
  {
    key: "createdAt",
    label: "Signed Up",
    render: (row) => formatDate(row.createdAt),
  },
];

const VetsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("events");
  const [events, setEvents] = useState<VetsEventRow[]>([]);
  const [interests, setInterests] = useState<VetsInterestRow[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingInterests, setLoadingInterests] = useState(true);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<VetsEventRow | null>(null);
  const [deleteEventTarget, setDeleteEventTarget] =
    useState<VetsEventRow | null>(null);
  const [eventFormError, setEventFormError] = useState<string | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);

  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [editingInterest, setEditingInterest] =
    useState<VetsInterestRow | null>(null);
  const [deleteInterestTarget, setDeleteInterestTarget] =
    useState<VetsInterestRow | null>(null);
  const [interestFormError, setInterestFormError] = useState<string | null>(
    null
  );
  const [savingInterest, setSavingInterest] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: "",
    location: "",
    eventDate: "",
    description: "",
    isActive: true,
  });

  const [interestForm, setInterestForm] = useState({
    status: "interested" as string,
  });

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await apiFetch("/api/vets/admin/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch {
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchInterests = async () => {
    setLoadingInterests(true);
    try {
      const res = await apiFetch("/api/vets/admin/interests");
      if (res.ok) {
        const data = await res.json();
        setInterests(Array.isArray(data) ? data : []);
      }
    } catch {
      setInterests([]);
    } finally {
      setLoadingInterests(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchInterests();
  }, []);

  const openCreateEvent = () => {
    setEditingEvent(null);
    setEventFormError(null);
    setEventForm({
      title: "",
      location: "",
      eventDate: new Date().toISOString().slice(0, 10),
      description: "",
      isActive: true,
    });
    setEventModalOpen(true);
  };

  const openEditEvent = (row: VetsEventRow) => {
    setEditingEvent(row);
    setEventFormError(null);
    setEventForm({
      title: row.title,
      location: row.location,
      eventDate:
        typeof row.eventDate === "string"
          ? row.eventDate.slice(0, 10)
          : new Date(row.eventDate).toISOString().slice(0, 10),
      description: row.description || "",
      isActive: row.isActive,
    });
    setEventModalOpen(true);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventFormError(null);
    setSavingEvent(true);

    const payload = {
      title: eventForm.title.trim(),
      location: eventForm.location.trim(),
      eventDate: eventForm.eventDate,
      description: eventForm.description.trim() || undefined,
      isActive: eventForm.isActive,
    };

    try {
      if (editingEvent) {
        const res = await apiFetch(`/api/vets/admin/events/${editingEvent.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setEventFormError(data.message || "Failed to update event.");
          return;
        }
        const updated = await res.json();
        setEvents((prev) =>
          prev.map((r) => (r.id === editingEvent.id ? updated : r))
        );
      } else {
        const res = await apiFetch("/api/vets/admin/events", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setEventFormError(data.message || "Failed to create event.");
          return;
        }
        const created = await res.json();
        setEvents((prev) => [created, ...prev]);
      }
      setEventModalOpen(false);
    } catch {
      setEventFormError("Something went wrong. Please try again.");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (row: VetsEventRow) => {
    try {
      const res = await apiFetch(`/api/vets/admin/events/${row.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((r) => r.id !== row.id));
      }
    } catch {
      // Keep dialog open on error
    }
    setDeleteEventTarget(null);
  };

  const openEditInterest = (row: VetsInterestRow) => {
    setEditingInterest(row);
    setInterestFormError(null);
    setInterestForm({
      status: row.status,
    });
    setInterestModalOpen(true);
  };

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInterest) return;
    setInterestFormError(null);
    setSavingInterest(true);

    try {
      const res = await apiFetch(
        `/api/vets/admin/interests/${editingInterest.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ status: interestForm.status }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setInterestFormError(data.message || "Failed to update status.");
        return;
      }
      const updated = await res.json();
      setInterests((prev) =>
        prev.map((r) => (r.id === editingInterest.id ? updated : r))
      );
      setInterestModalOpen(false);
    } catch {
      setInterestFormError("Something went wrong. Please try again.");
    } finally {
      setSavingInterest(false);
    }
  };

  const handleDeleteInterest = async (row: VetsInterestRow) => {
    try {
      const res = await apiFetch(`/api/vets/admin/interests/${row.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setInterests((prev) => prev.filter((r) => r.id !== row.id));
      }
    } catch {
      // Keep dialog open on error
    }
    setDeleteInterestTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 rounded-lg font-calibri text-sm transition-colors ${
              activeTab === "events"
                ? "bg-rose-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            VETS Events
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("interests")}
            className={`px-4 py-2 rounded-lg font-calibri text-sm transition-colors ${
              activeTab === "interests"
                ? "bg-rose-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Interests ({interests.length})
          </button>
        </div>

        {activeTab === "events" && (
          <button
            type="button"
            onClick={openCreateEvent}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600"
          >
            <FaPlus size={16} />
            Add VETS Event
          </button>
        )}
      </div>

      {activeTab === "events" && (
        <>
          {loadingEvents ? (
            <div className="flex items-center gap-2 py-8">
              <FaSpinner className="animate-spin text-rose-500" size={20} />
              <span className="font-calibri text-gray-600">Loading events...</span>
            </div>
          ) : (
            <DataTable
              columns={EVENT_COLUMNS}
              data={events}
              getRowId={(r) => r.id}
              onEdit={openEditEvent}
              onDelete={(r) => setDeleteEventTarget(r)}
              emptyMessage="No VETS events yet. Click 'Add VETS Event' to create one."
              sortable
              pageSize={10}
              pageSizeOptions={[5, 10, 25, 50]}
            />
          )}
        </>
      )}

      {activeTab === "interests" && (
        <>
          {loadingInterests ? (
            <div className="flex items-center gap-2 py-8">
              <FaSpinner className="animate-spin text-rose-500" size={20} />
              <span className="font-calibri text-gray-600">Loading interests...</span>
            </div>
          ) : (
            <DataTable
              columns={INTEREST_COLUMNS}
              data={interests}
              getRowId={(r) => r.id}
              onEdit={openEditInterest}
              onDelete={(r) => setDeleteInterestTarget(r)}
              emptyMessage="No interest sign-ups yet."
              sortable
              pageSize={10}
              pageSizeOptions={[5, 10, 25, 50]}
            />
          )}
        </>
      )}

      <FormModal
        title={editingEvent ? "Edit VETS Event" : "Add VETS Event"}
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSubmit={handleEventSubmit}
        maxWidth="2xl"
      >
        {eventFormError && (
          <p className="text-sm text-red-600 font-calibri mb-2 col-span-full">
            {eventFormError}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
          <div className="md:col-span-2">
            <TextInput
              label="Event Title"
              name="title"
              value={eventForm.title}
              onChange={(e) =>
                setEventForm((f) => ({ ...f, title: e.target.value }))
              }
              required
            />
          </div>
          <TextInput
            label="Location"
            name="location"
            value={eventForm.location}
            onChange={(e) =>
              setEventForm((f) => ({ ...f, location: e.target.value }))
            }
            required
          />
          <TextInput
            label="Event Date"
            name="eventDate"
            type="date"
            value={eventForm.eventDate}
            onChange={(e) =>
              setEventForm((f) => ({ ...f, eventDate: e.target.value }))
            }
            required
          />
          <div className="md:col-span-2">
            <TextArea
              label="Description"
              name="description"
              value={eventForm.description}
              onChange={(e) =>
                setEventForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div className="md:col-span-2">
            <Checkbox
              label="Active (visible to players)"
              name="isActive"
              checked={eventForm.isActive}
              onChange={(e) =>
                setEventForm((f) => ({ ...f, isActive: e.target.checked }))
              }
            />
          </div>
        </div>
        <FormActions
          onCancel={() => setEventModalOpen(false)}
          submitDisabled={savingEvent}
        />
      </FormModal>

      <FormModal
        title="Update Interest Status"
        open={interestModalOpen}
        onClose={() => setInterestModalOpen(false)}
        onSubmit={handleInterestSubmit}
        maxWidth="lg"
      >
        {interestFormError && (
          <p className="text-sm text-red-600 font-calibri mb-2 col-span-full">
            {interestFormError}
          </p>
        )}
        {editingInterest && (
          <div className="space-y-4 col-span-full">
            <div className="bg-gray-50 rounded-lg p-4 font-calibri">
              <p className="font-semibold text-gray-800">
                {editingInterest.firstName} {editingInterest.lastName}
              </p>
              <p className="text-sm text-gray-600">{editingInterest.email}</p>
              {editingInterest.phone && (
                <p className="text-sm text-gray-600">{editingInterest.phone}</p>
              )}
              {editingInterest.playerRating && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Rating:</span>{" "}
                  {editingInterest.playerRating}
                </p>
              )}
              {editingInterest.events && editingInterest.events.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Interested in:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {editingInterest.events.map((ev) => (
                      <li key={ev.id}>
                        {ev.title} - {ev.location} ({formatDate(ev.eventDate)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Select
              label="Status"
              name="status"
              value={interestForm.status}
              onChange={(e) =>
                setInterestForm((f) => ({ ...f, status: e.target.value }))
              }
              options={STATUS_OPTIONS}
            />
          </div>
        )}
        <FormActions
          onCancel={() => setInterestModalOpen(false)}
          submitDisabled={savingInterest}
        />
      </FormModal>

      <ConfirmDialog
        open={!!deleteEventTarget}
        title="Delete VETS Event"
        message={
          deleteEventTarget
            ? `Delete event "${deleteEventTarget.title}"? This will also remove all associated interest sign-ups for this event.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteEventTarget && handleDeleteEvent(deleteEventTarget)}
        onCancel={() => setDeleteEventTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteInterestTarget}
        title="Delete Interest"
        message={
          deleteInterestTarget
            ? `Delete interest sign-up from "${deleteInterestTarget.firstName} ${deleteInterestTarget.lastName}"?`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() =>
          deleteInterestTarget && handleDeleteInterest(deleteInterestTarget)
        }
        onCancel={() => setDeleteInterestTarget(null)}
      />
    </div>
  );
};

export default VetsSection;
