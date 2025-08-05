import { createClient } from "@/lib/supabase/client";
import { UserPermissions } from "@/types/user_permissions";

const supabase = createClient();

export const userPermissionService = {
    async getUserPermissions(): Promise<UserPermissions[]> {
        const { data, error } = await supabase.from("user_permissions").select("*, profile:profiles(*)");
        if (error) throw error;
        return data;
    },

    async getUserPermissionsByProfileId(profileId: string): Promise<UserPermissions> {
        const { data, error } = await supabase.from("user_permissions").select("*").eq("profile_id", profileId);
        if (error) throw error;
        return data[0];
    },

    async getUserPermissionsById(id: string): Promise<UserPermissions> {
        const { data, error } = await supabase.from("user_permissions").select("*").eq("id", id);
        if (error) throw error;
        return data[0];
    }
}