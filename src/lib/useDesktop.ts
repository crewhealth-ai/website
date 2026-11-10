import { useEffect, useState } from "react";

const WIDE = "(min-width: 1024px)";
const TALL = "(min-height: 640px)";

function useMedia(query: string) {
  const [on, setOn] = useState(() => (typeof window === "undefined" ? true : window.matchMedia(query).matches));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setOn(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return on;
}

/** True at the lg breakpoint and above: desktop layout, side rail, four-up grids. */
export function useDesktop() {
  return useMedia(WIDE);
}

/** True when a scene may pin: wide enough for the desktop layout and tall enough that a pinned scene still reads. */
export function usePinnable() {
  const wide = useMedia(WIDE);
  const tall = useMedia(TALL);
  return wide && tall;
}
