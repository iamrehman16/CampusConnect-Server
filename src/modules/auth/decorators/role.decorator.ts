import { SetMetadata } from "@nestjs/common";
import { Roles } from "src/modules/user/enums/user-role.enum";

export const ROLE_KEY = "roles";

export const Role = (...roles:[Roles,...Roles[]])=>SetMetadata(ROLE_KEY,roles);