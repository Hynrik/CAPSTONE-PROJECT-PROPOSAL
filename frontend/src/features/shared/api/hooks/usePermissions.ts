/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    setPermissions(stored ? JSON.parse(stored) : []);
  }, []);

  return permissions;
}