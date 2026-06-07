import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { SearchAllUseCase } from "@/modules/search/application/use-cases/search-all.use-case";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { SearchQueryDto } from "./dto/search-query.dto";

@UseGuards(AuthGuard)
@Controller("api/search")
export class SearchController {
  constructor(private readonly searchAllUseCase: SearchAllUseCase) {}

  @Get()
  searchAll(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: SearchQueryDto
  ) {
    return this.searchAllUseCase.execute(currentUser, query);
  }
}
