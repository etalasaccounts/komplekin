import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/profile";

const supabase = createClient();

export const profileService = {
    async getProfiles(): Promise<Profile[]> {
        const { data, error } = await supabase
            .from("profiles")
            .select("*");
        if (error) throw error;
        return data;
    }
}