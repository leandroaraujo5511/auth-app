import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { validateUsePermissions } from "../ultils/validadeUsePermissions";

type UseCanParams = {
    permissions: string[];
    roles: string[]

}

export function useCan({permissions, roles}:UseCanParams){
    const {user, isAuthenticated} = useContext(AuthContext)



    if(!isAuthenticated){
        return false;
    }

    const userHasValidPermissions = validateUsePermissions({
        user,
        permissions, 
        roles
    })
    
    return userHasValidPermissions;
}