# Play Page Implementation Plan

## Overview
The Play Page (`/play`) will allow users to:
1. Register to play on specific social events
2. Search all available and historical social events
3. Book multiple events at once

---

## 1. Data Structure

### Social Event Interface
```typescript
interface SocialEvent {
  id: number;
  title: string;
  date: string; // ISO format or formatted string
  time: string; // e.g., "7:00 PM - 10:00 PM"
  dayOfWeek: string; // e.g., "Wednesday", "Friday"
  location: string;
  description: string;
  maxCapacity: number;
  currentAttendees: number;
  price?: number; // Optional pricing
  imageUrl?: string;
  status: "available" | "full" | "completed" | "cancelled";
  category: "regular" | "special" | "tournament";
  recurring?: boolean; // For weekly sessions like Wednesday/Friday
}
```

### Registration Data Interface
```typescript
interface Registration {
  eventId: number;
  userId?: string; // If user authentication exists
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: "pending" | "confirmed" | "cancelled";
}
```

---

## 2. Component Structure

### Main Components

#### 2.1 PlayPage (Main Container)
- **Location**: `src/components/PlayPage.tsx`
- **Responsibilities**:
  - State management for selected events
  - Search and filter state
  - Cart/bookings state
  - Modal management

#### 2.2 SearchBar Component
- **Location**: `src/components/PlayPage/SearchBar.tsx`
- **Features**:
  - Text search (title, location, description)
  - Date range filter
  - Status filter (available, completed, all)
  - Category filter
  - Day of week filter (for recurring events)

#### 2.3 EventList Component
- **Location**: `src/components/PlayPage/EventList.tsx`
- **Features**:
  - Display events in grid/list view
  - Show event cards with key information
  - Checkbox for multi-selection
  - Quick view/details button
  - Status badges (Available, Full, Completed)

#### 2.4 EventCard Component
- **Location**: `src/components/PlayPage/EventCard.tsx`
- **Displays**:
  - Event image/thumbnail
  - Title and day of week
  - Date and time
  - Location
  - Capacity (X/Y spots available)
  - Price (if applicable)
  - Selection checkbox
  - Quick register button

#### 2.5 BookingCart Component
- **Location**: `src/components/PlayPage/BookingCart.tsx`
- **Features**:
  - Shows selected events count
  - List of selected events
  - Remove from cart functionality
  - Total price calculation
  - "Book All" button
  - Sticky/fixed position on scroll

#### 2.6 RegistrationModal Component
- **Location**: `src/components/PlayPage/RegistrationModal.tsx`
- **Features**:
  - Single event registration form
  - Multi-event registration form (when booking multiple)
  - Form validation
  - EmailJS integration (similar to EventsPage)
  - Success/error messages
  - Confirmation before submission

#### 2.7 EventDetailsModal Component
- **Location**: `src/components/PlayPage/EventDetailsModal.tsx`
- **Features**:
  - Full event information
  - Attendee list (if applicable)
  - Registration button
  - Share functionality

---

## 3. Features & Functionality

### 3.1 Search & Filter System
- **Real-time search**: Filter events as user types
- **Date range picker**: Filter by date range
- **Status tabs**: Available | Completed | All
- **Category filter**: Regular | Special | Tournament
- **Day filter**: Monday | Tuesday | ... | Sunday
- **Sort options**: Date (asc/desc) | Capacity | Price

### 3.2 Multi-Event Selection
- **Checkbox selection**: Each event card has a checkbox
- **Select all**: Option to select all visible events
- **Cart indicator**: Badge showing number of selected events
- **Cart sidebar/drawer**: Shows selected events with ability to remove
- **Bulk registration**: Register for all selected events at once

### 3.3 Registration Flow

#### Single Event Registration:
1. User clicks "Register" on event card
2. Modal opens with pre-filled event details
3. User fills registration form (name, email, phone)
4. Form validation
5. Submit via EmailJS
6. Success confirmation
7. Event capacity updated (if tracking)

#### Multi-Event Registration:
1. User selects multiple events via checkboxes
2. Clicks "Book Selected" button
3. Modal opens showing all selected events
4. User fills single registration form (applies to all events)
5. Form validation
6. Submit all registrations via EmailJS (batch)
7. Success confirmation with list of registered events
8. Clear selection

### 3.4 Event Status Management
- **Available**: Can be registered
- **Full**: Max capacity reached, show waitlist option
- **Completed**: Past events, view-only
- **Cancelled**: Show cancellation notice

---

## 4. UI/UX Design

### 4.1 Layout Structure
```
┌─────────────────────────────────────────┐
│  Header: "Play Sessions"                │
│  Search & Filter Bar                     │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐           │
│  │ Event    │  │ Event    │  [Cart]    │
│  │ Card 1   │  │ Card 2   │  (Sticky) │
│  └──────────┘  └──────────┘           │
│  ┌──────────┐  ┌──────────┐           │
│  │ Event    │  │ Event    │           │
│  │ Card 3   │  │ Card 4   │           │
│  └──────────┘  └──────────┘           │
└─────────────────────────────────────────┘
```

### 4.2 Color Scheme
- **Available events**: Green accent
- **Full events**: Orange/amber accent
- **Completed events**: Gray
- **Selected events**: Rose/pink border (matching site theme)
- **Cart badge**: Red notification badge

### 4.3 Responsive Design
- **Mobile**: Single column, bottom sheet cart
- **Tablet**: 2 columns
- **Desktop**: 3-4 columns

---

## 5. State Management

### 5.1 Local State (useState)
```typescript
const [events, setEvents] = useState<SocialEvent[]>([]);
const [filteredEvents, setFilteredEvents] = useState<SocialEvent[]>([]);
const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
const [searchQuery, setSearchQuery] = useState("");
const [filters, setFilters] = useState({
  status: "all" | "available" | "completed",
  category: "all" | "regular" | "special" | "tournament",
  dayOfWeek: string[],
  dateRange: { start: Date | null, end: Date | null }
});
const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
const [selectedEvent, setSelectedEvent] = useState<SocialEvent | null>(null);
```

### 5.2 Data Storage Options
- **Option 1**: Static data array (like EventsPage)
- **Option 2**: localStorage for user selections
- **Option 3**: Backend API (future enhancement)

---

## 6. Sample Data Structure

```typescript
const socialEvents: SocialEvent[] = [
  {
    id: 1,
    title: "Chibi Wednesday Playtime",
    date: "2025-01-15",
    time: "7:00 PM - 10:00 PM",
    dayOfWeek: "Wednesday",
    location: "Altona Meadows Badminton Club",
    description: "Weekly Wednesday social play session. All skill levels welcome!",
    maxCapacity: 20,
    currentAttendees: 15,
    price: 15,
    imageUrl: DemonSlayerWednesday,
    status: "available",
    category: "regular",
    recurring: true
  },
  {
    id: 2,
    title: "Chibi Friday Playtime",
    date: "2025-01-17",
    time: "7:00 PM - 10:00 PM",
    dayOfWeek: "Friday",
    location: "Altona Meadows Badminton Club",
    description: "Weekly Friday social play session. Fun games and friendly matches!",
    maxCapacity: 20,
    currentAttendees: 20,
    price: 15,
    imageUrl: MapleStoryFriday,
    status: "full",
    category: "regular",
    recurring: true
  },
  // ... more events including completed ones
];
```

---

## 7. Implementation Steps

### Phase 1: Basic Structure
1. ✅ Create PlayPage component with basic layout
2. ✅ Define TypeScript interfaces
3. ✅ Create sample data
4. ✅ Implement EventCard component
5. ✅ Implement EventList component

### Phase 2: Search & Filter
1. ✅ Create SearchBar component
2. ✅ Implement search functionality
3. ✅ Implement filter functionality
4. ✅ Add sort options

### Phase 3: Selection & Cart
1. ✅ Add checkbox selection to EventCard
2. ✅ Implement selectedEvents state
3. ✅ Create BookingCart component
4. ✅ Implement add/remove from cart

### Phase 4: Registration
1. ✅ Create RegistrationModal component
2. ✅ Implement single event registration
3. ✅ Implement multi-event registration
4. ✅ Integrate EmailJS
5. ✅ Add form validation

### Phase 5: Polish & Enhancement
1. ✅ Add loading states
2. ✅ Add error handling
3. ✅ Add success animations
4. ✅ Implement localStorage persistence
5. ✅ Add event details modal
6. ✅ Responsive design refinement

---

## 8. Technical Considerations

### 8.1 EmailJS Integration
- Use same pattern as EventsPage
- For multi-event: Send one email with all event details
- Template should list all registered events

### 8.2 Form Validation
- Required fields: name, email, phone
- Email format validation
- Phone number validation (optional)
- Show inline errors

### 8.3 Performance
- Debounce search input
- Memoize filtered results
- Lazy load event images
- Virtual scrolling for large lists (if needed)

### 8.4 Accessibility
- ARIA labels for checkboxes
- Keyboard navigation
- Screen reader support
- Focus management in modals

---

## 9. Future Enhancements

1. **User Authentication**: Link registrations to user accounts
2. **Payment Integration**: Add payment processing for paid events
3. **Waitlist System**: Allow users to join waitlist for full events
4. **Calendar View**: Toggle between list and calendar view
5. **Recurring Event Management**: Auto-generate weekly events
6. **Email Notifications**: Send confirmation emails
7. **Event Reminders**: Email reminders before event
8. **Rating System**: Allow users to rate completed events
9. **Social Sharing**: Share events on social media
10. **Export to Calendar**: Add to Google Calendar/iCal

---

## 10. File Structure

```
src/
├── components/
│   ├── PlayPage.tsx (main)
│   └── PlayPage/
│       ├── SearchBar.tsx
│       ├── EventList.tsx
│       ├── EventCard.tsx
│       ├── BookingCart.tsx
│       ├── RegistrationModal.tsx
│       └── EventDetailsModal.tsx
├── data/
│   └── socialEvents.ts (sample data)
└── types/
    └── socialEvent.ts (TypeScript interfaces)
```

---

## 11. Success Criteria

✅ Users can search and filter social events
✅ Users can select multiple events
✅ Users can register for single event
✅ Users can register for multiple events at once
✅ Registration form validates input
✅ EmailJS sends registration emails
✅ UI is responsive and accessible
✅ Code is maintainable and well-structured

---

This plan provides a comprehensive roadmap for implementing the Play Page with all requested features. The implementation can be done incrementally, starting with basic functionality and adding advanced features progressively.
