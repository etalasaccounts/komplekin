import { Profile } from "./profile";

export interface UserPermissions {
    id: string;
    user_id: string;
    profile_id: string;
    cluster_id: string;
    role: string;
    created_at: string;
    updated_at: string;
    user_status: string;
    profile: Profile;
}