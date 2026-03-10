import { Roles } from "src/modules/user/enums/user-role.enum"

export type CurrentUser = {
    id:string,
    role:Roles
}