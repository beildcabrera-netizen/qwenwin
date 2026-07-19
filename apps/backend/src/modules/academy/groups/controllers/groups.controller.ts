import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { GroupsService } from '../services/groups.service';
import { CreateGroupDto, UpdateGroupDto } from '../dto/group.dto';
import { AuthGuard } from '../../../iam/guards/auth.guard';
import { PermissionsGuard } from '../../../iam/guards/permissions.guard';
import { RequirePermissions } from '../../../iam/decorators/permissions.decorator';
import { CurrentUser } from '../../../iam/decorators/current-user.decorator';

@Controller('academy/groups')
@UseGuards(AuthGuard, PermissionsGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @RequirePermissions('academy.groups', 'create')
  create(@Body() createGroupDto: CreateGroupDto, @CurrentUser('id') userId: string) {
    return this.groupsService.create(createGroupDto, userId);
  }

  @Get()
  @RequirePermissions('academy.groups', 'read')
  findAll(@Query() filters?: any) {
    return this.groupsService.findAll(filters);
  }

  @Get('active')
  @RequirePermissions('academy.groups', 'read')
  findActive() {
    return this.groupsService.getActiveGroups();
  }

  @Get(':id')
  @RequirePermissions('academy.groups', 'read')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Get(':id/occupancy')
  @RequirePermissions('academy.groups', 'read')
  getOccupancy(@Param('id') id: string) {
    return this.groupsService.getGroupOccupancy(id);
  }

  @Patch(':id')
  @RequirePermissions('academy.groups', 'update')
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.groupsService.update(id, updateGroupDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('academy.groups', 'delete')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.groupsService.remove(id, userId);
  }
}
