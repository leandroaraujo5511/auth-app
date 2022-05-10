
type User = {
    permissions: string[];
    roles: string[]
}


type ValidateUsePermissionsParams = {
    user: User;
    permissions: string[];
    roles: string[]
}


export function validateUsePermissions({
    user,
    permissions, 
    roles
}: ValidateUsePermissionsParams){

    if(permissions?.length > 0){

        //permissions.every retorna true se todas as condições for sastifeitas 
        const hasAllPermissions = permissions.every(permission => {
            return user.permissions.includes(permission);
        });
        if(!hasAllPermissions){
            return false;
        }
    }

    if(roles?.length > 0){

        //roles.every retorna true se todas as condições for sastifeitas 
        const hasAllRoles = roles.some(role => {
            return user.roles.includes(role);
        });
        if(!hasAllRoles){
            return false;
        }
    }

    return true;
}

