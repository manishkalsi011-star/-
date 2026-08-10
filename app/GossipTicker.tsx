"use client";

import { useEffect, useRef, useState } from "react";

const gossipLines = [
  "Bhai aaj office mein kya kaand hua pata hai?",
  "Chal na yaar, weekend pe pahadon mein ghoom ke aate hain.",
  "Salary aate hi gayab kaise ho jaati hai bhai?",
  "Usne group mein message dekha... reply abhi tak nahi kiya 👀",
  "Ek cutting chai aur manga, gossip abhi baaki hai.",
  "Boss ne bola 'quick call hai'... 1 ghanta ho gaya.",
  "Bhai uski story dekhi? Kuch toh scene chal raha hai.",
  "Monday ko leave maar ke long weekend bana lete hain?",
  "Ye baat apne group ke bahar nahi jaani chahiye 😂",
  "Chai thandi ho rahi hai, pehle poori story suna.",
];

function getNextIndex(currentIndex: number) {
  if (gossipLines.length <= 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * gossipLines.length);
  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * gossipLines.length);
  }

  return nextIndex;
}

export function GossipTicker() {
  const timeoutRef = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setIsVisible(false);
      timeoutRef.current = window.setTimeout(() => {
        setIndex((currentIndex) => getNextIndex(currentIndex));
        setIsVisible(true);
      }, 260);
    }, 6000);

    return () => {
      window.clearInterval(intervalId);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <p className={`dialogue ${isVisible ? "is-visible" : ""}`}>
      {gossipLines[index]}
    </p>
  );
}
