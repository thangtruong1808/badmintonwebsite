declare module "react-big-calendar" {
  import type { ComponentType } from "react";
  export type View = "month" | "week" | "day" | "agenda";
  export const Calendar: ComponentType<{
    localizer: unknown;
    events: unknown[];
    startAccessor: string;
    endAccessor: string;
    date?: Date;
    view?: View;
    onNavigate?: (date: Date, view?: View) => void;
    onView?: (view: View) => void;
    style?: React.CSSProperties;
    onSelectEvent?: (event: unknown) => void;
    eventPropGetter?: (event: unknown) => { style?: React.CSSProperties };
  }>;
  export function dateFnsLocalizer(config: unknown): unknown;
}
