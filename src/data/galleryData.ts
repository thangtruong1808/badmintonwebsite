import type { Photo, Video } from "../types/gallery.ts";
import SocialEvent1 from "../assets/Social1.jpg";
import SocialEvent2 from "../assets/Social2.jpg";
import SocialEvent3 from "../assets/Social3.jpg";
import SocialEvent4 from "../assets/Social4.jpg";
import SocialEvent5 from "../assets/Social5.jpg";
import SocialEvent6 from "../assets/Social6.jpg";
import TournamentMatch1 from "../assets/chibitournament1.jpg";
import TournamentMatch2 from "../assets/chibitournament2.jpg";
import VeteranTournament1 from "../assets/veterantournament1.jpg";
import ChibiBattleRoyalThumbnail from "../assets/ChibiBattleRoyal1.png";
import Kilsyth2025Thumbnail from "../assets/Kilsyth2025.jpg";
import WednesdayBadmintonSocialsThumbnail from "../assets/WednesdayBadmintonSocials.jpg";
import FridayBadmintonSocialsThumbnail from "../assets/FridayBadmintonSocials.jpg";
import AltonaVeterans2025Thumbnail from "../assets/AltonaVeterans2025.jpg";

export const photos: Photo[] = [
  {
    id: 1,
    src: VeteranTournament1,
    alt: "Tournament Match 1",
    type: "veteran-tournament",
  },
  {
    id: 2,
    src: SocialEvent1,
    alt: "Social Event1",
    type: "social",
  },
  {
    id: 3,
    src: TournamentMatch1,
    alt: "Social Event2",
    type: "chibi-tournament",
  },
  {
    id: 4,
    src: SocialEvent3,
    alt: "Social Event3",
    type: "social",
  },
  {
    id: 5,
    src: SocialEvent4,
    alt: "Social Event4",
    type: "social",
  },
  {
    id: 6,
    src: SocialEvent5,
    alt: "Social Event5",
    type: "social",
  },
  {
    id: 7,
    src: SocialEvent6,
    alt: "Social Event6",
    type: "social",
  },
  {
    id: 8,
    src: SocialEvent2 ,
    alt: "Social Event 2",
    type: "social",
  },
  {
    id: 9,
    src: TournamentMatch2,
    alt: "Tournament Match 2",
    type: "chibi-tournament",
  },
];

export const videos: Video[] = [
  {
    id: 1,
    title: "Chibi Wednesday Playtime",
    embedId: "cmh7Eilcg0k",
    thumbnail: "https://img.youtube.com/vi/cmh7Eilcg0k/0.jpg",
    category: "Wednesday",
  },
  {
    id: 2,
    title: "Chibi Friday Playtime",
    embedId: "xrVX-8j3LiU",
    thumbnail: "https://img.youtube.com/vi/xrVX-8j3LiU/0.jpg",
    category: "Friday",
  },
  {
    id: 3,
    title: "Chibi Battle Royale #1",
    embedId: "cDn4hZ3pWFU",
    thumbnail:
      ChibiBattleRoyalThumbnail,
    category: "tournament",
  },
  {
    id: 4,
    title: "Badminton Veteran Tournament 2025 (Kilsyth)",
    embedId: "5Uq_Sv-b1K0",
    thumbnail:
      Kilsyth2025Thumbnail,
    category: "tournament",
  },
  {
    id: 5,
    title: "Chibi Wednesday Playlists",
    embedId: "PL9_wYoxgAnQiSNtLldFJBBL1yt4oQHC9q",
    thumbnail:
      WednesdayBadmintonSocialsThumbnail,
    category: "playlists",
  },
  {
    id: 6,
    title: "Chibi Friday Playlists",
    embedId: "PL9_wYoxgAnQhbxaCNsDD2ff-K1U2oKONc",
    thumbnail:
      FridayBadmintonSocialsThumbnail,
    category: "playlists",
  },
  {
    id: 7,
    title: "Badminton Veteran Tournament 2025 (Altona)",
    embedId: "5Uq_Sv-b1K0",
    thumbnail:
      AltonaVeterans2025Thumbnail,
    category: "tournament",
  },
];
