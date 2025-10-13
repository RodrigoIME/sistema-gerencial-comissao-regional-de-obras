import { useState, useCallback } from "react";

export const useAnnouncement = () => {
  const [announcement, setAnnouncement] = useState("");
  
  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 100);
  }, []);
  
  return { announce, announcement };
};
