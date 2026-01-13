import DemonSlayerWednesday from "../assets/DemonSlayerW.png";
import MapleStoryFriday from "../assets/MapleStoryF.png";
import ChibiBattleRoyal from "../assets/ChibiBattleRoyal.png";
import BannerMain from "../assets/BannerMain.png";

import type { SocialEvent } from "../types/socialEvent";

// Helper function to get future dates
const getFutureDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
};

// Helper function to get day of week
const getDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

export const socialEvents: SocialEvent[] = [
  {
    id: 1,
    title: "Chibi Wednesday Playtime",
    date: getFutureDate(3), // Next Wednesday
    time: "7:00 PM - 10:00 PM",
    dayOfWeek: getDayOfWeek(getFutureDate(3)),
    location: "Altona Meadows Badminton Club",
    description:
      "Weekly Wednesday social play session. All skill levels welcome! Join us for friendly games and meet fellow badminton enthusiasts.",
    maxCapacity: 20,
    currentAttendees: 15,
    price: 15,
    imageUrl: DemonSlayerWednesday,
    status: "available",
    category: "regular",
    recurring: true,
  },
  {
    id: 2,
    title: "Chibi Friday Playtime",
    date: getFutureDate(5), // Next Friday
    time: "7:00 PM - 10:00 PM",
    dayOfWeek: getDayOfWeek(getFutureDate(5)),
    location: "Altona Meadows Badminton Club",
    description:
      "Weekly Friday social play session. Fun games and friendly matches! Perfect way to end your week with some badminton action.",
    maxCapacity: 20,
    currentAttendees: 20,
    price: 15,
    imageUrl: MapleStoryFriday,
    status: "full",
    category: "regular",
    recurring: true,
  },
  {
    id: 3,
    title: "Chibi Wednesday Playtime",
    date: getFutureDate(10), // Wednesday in 2 weeks
    time: "7:00 PM - 10:00 PM",
    dayOfWeek: getDayOfWeek(getFutureDate(10)),
    location: "Altona Meadows Badminton Club",
    description:
      "Weekly Wednesday social play session. All skill levels welcome!",
    maxCapacity: 20,
    currentAttendees: 8,
    price: 15,
    imageUrl: DemonSlayerWednesday,
    status: "available",
    category: "regular",
    recurring: true,
  },
  {
    id: 4,
    title: "Chibi Friday Playtime",
    date: getFutureDate(12), // Friday in 2 weeks
    time: "7:00 PM - 10:00 PM",
    dayOfWeek: getDayOfWeek(getFutureDate(12)),
    location: "Altona Meadows Badminton Club",
    description:
      "Weekly Friday social play session. Fun games and friendly matches!",
    maxCapacity: 20,
    currentAttendees: 12,
    price: 15,
    imageUrl: MapleStoryFriday,
    status: "available",
    category: "regular",
    recurring: true,
  },
  {
    id: 5,
    title: "Special Tournament Night",
    date: getFutureDate(7),
    time: "6:00 PM - 11:00 PM",
    dayOfWeek: getDayOfWeek(getFutureDate(7)),
    location: "Krisna Badminton Club",
    description:
      "Join us for a special tournament night! Competitive matches with prizes for winners. All skill levels welcome to participate or watch.",
    maxCapacity: 32,
    currentAttendees: 18,
    price: 25,
    imageUrl: ChibiBattleRoyal,
    status: "available",
    category: "tournament",
    recurring: false,
  },
  {
    id: 6,
    title: "Beginner Friendly Session",
    date: getFutureDate(14),
    time: "6:00 PM - 9:00 PM",
    dayOfWeek: getDayOfWeek(getFutureDate(14)),
    location: "Stomers Badminton Club",
    description:
      "Perfect for beginners! Learn the basics, practice with others, and have fun. Experienced players available for guidance.",
    maxCapacity: 16,
    currentAttendees: 6,
    price: 12,
    imageUrl: BannerMain,
    status: "available",
    category: "regular",
    recurring: false,
  },
  // Completed events (past events)
  {
    id: 7,
    title: "Chibi Wednesday Playtime",
    date: "2025-01-08",
    time: "7:00 PM - 10:00 PM",
    dayOfWeek: "Wednesday",
    location: "Altona Meadows Badminton Club",
    description: "Weekly Wednesday social play session.",
    maxCapacity: 20,
    currentAttendees: 18,
    price: 15,
    imageUrl: DemonSlayerWednesday,
    status: "completed",
    category: "regular",
    recurring: true,
  },
  {
    id: 8,
    title: "Chibi Friday Playtime",
    date: "2025-01-10",
    time: "7:00 PM - 10:00 PM",
    dayOfWeek: "Friday",
    location: "Altona Meadows Badminton Club",
    description: "Weekly Friday social play session.",
    maxCapacity: 20,
    currentAttendees: 20,
    price: 15,
    imageUrl: MapleStoryFriday,
    status: "completed",
    category: "regular",
    recurring: true,
  },
  {
    id: 9,
    title: "New Year Tournament",
    date: "2025-01-01",
    time: "9:00 AM - 5:00 PM",
    dayOfWeek: "Wednesday",
    location: "Altona Meadows Badminton Club",
    description:
      "Special New Year tournament with multiple categories. Great way to start the year!",
    maxCapacity: 40,
    currentAttendees: 35,
    price: 30,
    imageUrl: ChibiBattleRoyal,
    status: "completed",
    category: "tournament",
    recurring: false,
  },
];
