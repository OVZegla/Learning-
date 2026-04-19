import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { IsIn } from "class-validator";
import { Role } from "../common/types";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

class UpdateRoleDto {
  @IsIn(Object.values(Role))
  role!: Role;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list() {
    return this.users.list();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.users.get(id);
  }

  @Patch(":id/role")
  setRole(@Param("id") id: string, @Body() dto: UpdateRoleDto) {
    return this.users.setRole(id, dto.role);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.users.remove(id);
  }
}
