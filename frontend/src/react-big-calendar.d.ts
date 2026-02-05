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
    min?: Date;
    max?: Date;
    scrollToTime?: Date;
    onNavigate?: (date: Date, view?: View, action?: string) => void;
    onView?: (view: View) => void;
    components?: {
      toolbar?: React.ComponentType<unknown>;
      event?: React.ComponentType<unknown>;
      week?: { event?: React.ComponentType<unknown> };
      day?: { event?: React.ComponentType<unknown> };
      work_week?: { event?: React.ComponentType<unknown> };
    };
    style?: React.CSSProperties;
    onSelectEvent?: (event: unknown) => void;
    eventPropGetter?: (event: unknown) => { style?: React.CSSProperties };
  }>;
  export function dateFnsLocalizer(config: unknown): unknown;
}
