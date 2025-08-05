import { userPermissionService } from "@/services/userPermissionService";
import { UserPermissions } from "@/types/user_permissions";
import { useEffect, useState } from "react";


export const useUserPermission = () => {
    const [userPermissions, setUserPermissions] = useState<UserPermissions[]>([]);

    const getUserPermission = async () => {
        const userPermissions = await userPermissionService.getUserPermissions();
        setUserPermissions(userPermissions);
    }

    const getUserPermissionByProfileId = async (profileId: string) => {
        const userPermission = await userPermissionService.getUserPermissionsByProfileId(profileId);
        return userPermission;
    }

    const getUserPermissionById = async (id: string) => {
        const userPermission = await userPermissionService.getUserPermissionsById(id);
        return userPermission;
    }

    useEffect(() => {
        getUserPermission();
    }, []);

    return { userPermissions, getUserPermissionByProfileId, getUserPermissionById };
}