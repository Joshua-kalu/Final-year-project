import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useIsDoctor = () => {
  const { user } = useAuth();
  const [isDoctor, setIsDoctor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDoctorStatus = async () => {
      if (!user) {
        setIsDoctor(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking doctor status:", error);
        setIsDoctor(false);
      } else {
        setIsDoctor(!!data);
      }
      setLoading(false);
    };

    checkDoctorStatus();
  }, [user]);

  return { isDoctor, loading };
};
