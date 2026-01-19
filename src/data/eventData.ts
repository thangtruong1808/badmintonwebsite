import ChibiBattleRoyal from "../assets/ChibiBattleRoyal.png";
import ChibiBattleRoyale2 from "../assets/ChibiBattle Royale2.png";
import BannerMain from "../assets/BannerMain.png";
import Banner from "../assets/banner.png";
import BattleRoyale1thumbnail from "../assets/BattleRoyale1thumbnail.png";

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: number;
  imageUrl: string;
  status: "completed" | "upcoming";
}

export const events: Event[] = [
  {
    id: 1,
    title: "Chibi Battle Royale #1",
    date: "November 11, 2023",
    time: "9:00 AM - 5:00 PM",
    location: "Altona Meadows Badminton Club",
    description:
      "The first ever ChibiBadminton Battle Royale. 56 players competed for the title of ChibiBadminton Champion. The event was a success and we are looking forward to the next one!",
    attendees: 56,
    imageUrl: BattleRoyale1thumbnail as string,
    status: "completed",
  },
  {
    id: 2,
    title: "Chibi Battle Royale #2",
    date: "December 16, 2024",
    time: "9:00 AM - 5:00 PM",
    location: "Altona Meadows Badminton Club",
    description:
      "The second ever ChibiBadminton Battle Royale. 104 players competed for the title of ChibiBadminton Champion. The event was a success and we are looking forward to the next one!",
    attendees: 68,
    imageUrl: ChibiBattleRoyale2 as string,
    status: "completed",
  },
  {
    id: 3,
    title: "Chibi Battle Royale #3",
    date: "November 12, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Altona Meadows Badminton Club",
    description:
      "The third ever ChibiBadminton Battle Royale. 104 players competed for the title of ChibiBadminton Champion. The event was a success and we are looking forward to the next one!",
    attendees: 68,
    imageUrl: BannerMain as string,
    status: "completed",
  },
  {
    id: 4,
    title: "Chibi Battle Royale #4",
    date: "Expected date: March 2026",
    time: "Expected time: 9:30 AM - 5:00 PM",
    location:
      "Expected location: TBC,
    description:
      "This is a team-based event consisting of 4 players. Tap "Register Now" to find all information about the event",
    attendees: 0,
    imageUrl: Banner as string,
    status: "upcoming",
  },
];
