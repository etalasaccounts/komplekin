import { Profile } from "@/types/profile";
import { useState, useEffect } from "react";
import { profileService } from "@/services/profileService";

export const useProfiles = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);

    const getProfiles = async () => {
        setLoading(true);
        const profiles = await profileService.getProfiles();
        setProfiles(profiles);
        setLoading(false);
    };

    useEffect(() => {
        getProfiles();
    }, []);

    return { profiles, loading };
}