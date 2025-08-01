import { userPermissionService } from "@/services/userPermissionService";
import { UserPermissions } from "@/types/user_permissions";
import { useEffect, useState } from "react";


export const useUserPermission = () => {
    const [userPermissions, setUserPermissions] = useState<UserPermissions[]>([]);

    const getUserPermission = async () => {
        const userPermissions = await userPermissionService.getUserPermissions();
        setUserPermissions(userPermissions);
    }

    const getUserPermissionByProfileId = async (profileId: string): Promise<UserPermissions> => {
        const userPermission = await userPermissionService.getUserPermissionsByProfileId(profileId);
        return userPermission;
    }

    useEffect(() => {
        getUserPermission();
    }, []);

    return { userPermissions, getUserPermissionByProfileId };
}