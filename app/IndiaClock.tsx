"use client";

import { useEffect, useMemo, useState } from "react";

function formatIndiaTime(formatter: Intl.DateTimeFormat) {
  return formatter.format(new Date()).replace(/\s/g, "").toLowerCase();
}

export function IndiaClock() {
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }),
    [],
  );
  const [time, setTime] = useState(() => formatIndiaTime(formatter));

  useEffect(() => {
    const updateTime = () => setTime(formatIndiaTime(formatter));
    updateTime();
    const intervalId = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(intervalId);
  }, [formatter]);

  return <time>{time}</time>;
}
