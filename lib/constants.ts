// Centralized event data for the app
// Each event aligns with the props expected by the EventCard component

export type Event = {
  title: string;
  image: string; // path relative to /public
  slug: string; // url-friendly identifier
  location: string;
  date: string; // human-readable date or range
  time: string; // human-readable time window
};

export const events: Event[] = [
  {
    image: "/images/event1.png",
    title: "FOSDEM 2026",
    slug: "fosdem-2026",
    location: "Brussels, Belgium",
    date: "Feb 1–2, 2026",
    time: "09:00–18:00 CET",
  },
  {
    image: "/images/event2.png",
    title: "JSConf EU 2026",
    slug: "jsconf-eu-2026",
    location: "Berlin, Germany",
    date: "May 16–17, 2026",
    time: "10:00–17:30 CEST",
  },
  {
    image: "/images/event3.png",
    title: "KubeCon + CloudNativeCon Europe 2026",
    slug: "kubecon-europe-2026",
    location: "Vienna, Austria",
    date: "Mar 31 – Apr 3, 2026",
    time: "09:00–18:00 CEST",
  },
  {
    image: "/images/event4.png",
    title: "HackZurich 2026",
    slug: "hackzurich-2026",
    location: "Zurich, Switzerland",
    date: "Sep 18–20, 2026",
    time: "48-hour Hackathon",
  },
  {
    image: "/images/event5.png",
    title: "React Summit 2026",
    slug: "react-summit-2026",
    location: "Amsterdam, Netherlands",
    date: "Jun 11–12, 2026",
    time: "09:30–17:30 CEST",
  },
  {
    image: "/images/event6.png",
    title: "ETHGlobal Tokyo 2026",
    slug: "ethglobal-tokyo-2026",
    location: "Tokyo, Japan",
    date: "Oct 9–11, 2026",
    time: "36-hour Hackathon",
  },
];

export default events;
