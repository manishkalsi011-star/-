"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PlaylistPlayerProps = {
  playlistId: string;
};

type PlayerState = {
  title: string;
  artist: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  thumbnail: string | null;
};

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  getCurrentTime?: () => number;
  getDuration?: () => number;
  getVideoData?: () => { title?: string; author?: string; video_id?: string };
  seekTo?: (seconds: number, allowSeekAhead: boolean) => void;
  destroy?: () => void;
};

type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      playerVars: Record<string, string | number>;
      events: {
        onReady: (event: { target: YTPlayer }) => void;
        onStateChange: (event: { data: number; target: YTPlayer }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: {
    PLAYING: number;
    PAUSED: number;
    ENDED: number;
  };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const initialState: PlayerState = {
  title: "Tapri Radio Playlist",
  artist: "YouTube Music",
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  thumbnail: null,
};

let youtubeApiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API requires a browser."));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        if (window.YT) {
          resolve(window.YT);
        }
      };

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function getThumbnail(videoId?: string) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
}

export function PlaylistPlayer({ playlistId }: PlaylistPlayerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const pendingPlayRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState(initialState);

  const progress = useMemo(() => {
    if (playerState.duration <= 0) {
      return 0;
    }

    return Math.min(100, (playerState.currentTime / playerState.duration) * 100);
  }, [playerState.currentTime, playerState.duration]);

  const syncVideoData = useCallback((eventPlayer?: YTPlayer) => {
    const player = eventPlayer || playerRef.current;
    if (!player) {
      return;
    }

    const data = player.getVideoData?.() || {};
    const duration = player.getDuration?.() || 0;
    const currentTime = player.getCurrentTime?.() || 0;

    setPlayerState((currentState) => ({
      ...currentState,
      title: data.title || currentState.title,
      artist: data.author || currentState.artist,
      currentTime,
      duration,
      thumbnail: getThumbnail(data.video_id) || currentState.thumbnail,
    }));
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadYouTubeApi().then((YT) => {
      if (!isMounted || !hostRef.current || playerRef.current) {
        return;
      }

      playerRef.current = new YT.Player(hostRef.current, {
        playerVars: {
          listType: "playlist",
          list: playlistId,
          controls: 0,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (!isMounted) {
              return;
            }

            playerRef.current = event.target;
            setIsReady(true);
            syncVideoData(event.target);
            if (pendingPlayRef.current) {
              playerRef.current?.playVideo();
              pendingPlayRef.current = false;
            }
          },
          onStateChange: (event) => {
            if (!isMounted) {
              return;
            }

            playerRef.current = event.target;
            setPlayerState((currentState) => ({
              ...currentState,
              isPlaying: event.data === YT.PlayerState.PLAYING,
            }));
            syncVideoData(event.target);
          },
        },
      });
    });

    return () => {
      isMounted = false;
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [playlistId, syncVideoData]);

  useEffect(() => {
    const intervalId = window.setInterval(syncVideoData, 500);
    return () => window.clearInterval(intervalId);
  }, [syncVideoData]);

  const togglePlayback = () => {
    const player = playerRef.current;
    if (!player || !isReady) {
      pendingPlayRef.current = true;
      return;
    }

    if (playerState.isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const playPrevious = () => {
    playerRef.current?.previousVideo();
    window.setTimeout(syncVideoData, 300);
  };

  const playNext = () => {
    playerRef.current?.nextVideo();
    window.setTimeout(syncVideoData, 300);
  };

  const seekFromProgress = (event: React.MouseEvent<HTMLDivElement>) => {
    const player = playerRef.current;
    if (!player?.seekTo || playerState.duration <= 0) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    player.seekTo(Math.max(0, Math.min(playerState.duration, ratio * playerState.duration)), true);
    window.setTimeout(syncVideoData, 200);
  };

  return (
    <section className="music-player" aria-label="Music player with embedded playlist">
      <div
        className="cover-art"
        aria-hidden="true"
        style={
          playerState.thumbnail
            ? ({ "--thumbnail": `url(${playerState.thumbnail})` } as React.CSSProperties)
            : undefined
        }
      />

      <div className="song-details">
        <p>{playerState.title}</p>
        <span>{playerState.artist}</span>
        <div className="progress" aria-hidden="true" onClick={seekFromProgress}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <time>
          {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
        </time>
      </div>

      <div className="player-controls">
        <button
          className="skip previous"
          type="button"
          aria-label="Previous song"
          onClick={playPrevious}
        />
        <button
          className={`play-button ${playerState.isPlaying ? "is-paused" : ""}`}
          type="button"
          aria-label={playerState.isPlaying ? "Pause playlist" : "Play playlist on this site"}
          onClick={togglePlayback}
        >
          <span />
        </button>
        <button className="skip next" type="button" aria-label="Next song" onClick={playNext} />
        <div className="youtube-host" ref={hostRef} aria-hidden="true" />
      </div>
    </section>
  );
}
