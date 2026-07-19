import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PlansService } from '../services/plans.service';
import { CreatePlanDto, UpdatePlanDto } from '../dto/plan.dto';
import { AuthGuard } from '../../../iam/guards/auth.guard';
import { PermissionsGuard } from '../../../iam/guards/permissions.guard';
import { RequirePermissions } from '../../../iam/decorators/permissions.decorator';
import { CurrentUser } from '../../../iam/decorators/current-user.decorator';

@Controller('academy/plans')
@UseGuards(AuthGuard, PermissionsGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @RequirePermissions('academy.plans', 'create')
  create(@Body() createPlanDto: CreatePlanDto, @CurrentUser('id') userId: string) {
    return this.plansService.create(createPlanDto, userId);
  }

  @Get()
  @RequirePermissions('academy.plans', 'read')
  findAll(@Query() filters?: any) {
    return this.plansService.findAll(filters);
  }

  @Get('active')
  @RequirePermissions('academy.plans', 'read')
  findActive() {
    return this.plansService.getActivePlans();
  }

  @Get(':id')
  @RequirePermissions('academy.plans', 'read')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('academy.plans', 'update')
  update(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.plansService.update(id, updatePlanDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('academy.plans', 'delete')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.plansService.remove(id, userId);
  }
}
