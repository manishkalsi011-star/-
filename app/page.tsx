import { GossipTicker } from "./GossipTicker";
import { IndiaClock } from "./IndiaClock";
import { PlaylistPlayer } from "./PlaylistPlayer";

const playlistId = "PLcBmiDcQHQPM";
const playlistUrl = `https://music.youtube.com/playlist?list=${playlistId}&si=rKNWu30cafQnTk40`;
const title = "\u091f\u092a\u0930\u0940 \u0930\u0947\u0921\u093f\u092f\u094b";

export default function Home() {
  return (
    <main className="frame-screen" aria-labelledby="site-title">
      <div className="scene-bg" aria-hidden="true" />
      <div className="shadow-layer" aria-hidden="true" />

      <header className="top-row" aria-label="Status bar">
        <IndiaClock />
        <a className="yt-link" href={playlistUrl} aria-label="Open YouTube Music playlist">
          <span className="yt-icon" aria-hidden="true" />
          <span>YT Music</span>
        </a>
      </header>

      <h1 id="site-title">{title}</h1>

      <PlaylistPlayer playlistId={playlistId} />

      <GossipTicker />
    </main>
  );
}
