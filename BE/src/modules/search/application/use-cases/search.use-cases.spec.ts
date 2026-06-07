import type {
  SearchAllInput,
  SearchAllResult,
  SearchRepository,
} from "@/modules/search/application/ports/search.repository";
import { SearchQueryRequiredError } from "@/modules/search/domain/search.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { SearchAllUseCase } from "./search-all.use-case";

class FakeSearchRepository implements SearchRepository {
  searchInput: SearchAllInput | null = null;

  async searchAll(input: SearchAllInput): Promise<SearchAllResult> {
    this.searchInput = input;

    return {
      groups: input.types.map((type) => ({
        type,
        items: [
          {
            title: `${type} 결과`,
            subtitle: "검색 결과",
            targetId: `${type.toLowerCase()}-1`,
            targetPath: createFakeTargetPath(type),
          },
        ],
      })),
    };
  }
}

const currentUser: CurrentUserContext = {
  id: "user-1",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "테스트 사용자",
  role: "USER",
  status: "ACTIVE",
};

describe("SearchAllUseCase", () => {
  it("normalizes query, types, and limit", async () => {
    const repository = new FakeSearchRepository();
    const useCase = new SearchAllUseCase(repository);

    const result = await useCase.execute(currentUser, {
      q: "  에이컴  ",
      types: "company,deal,company",
      limit: 3,
    });

    expect(repository.searchInput).toEqual({
      userId: "user-1",
      q: "에이컴",
      types: ["COMPANY", "DEAL"],
      limit: 3,
    });
    expect(result.groups).toHaveLength(2);
    expect(result.groups[0]).toEqual({
      type: "COMPANY",
      items: [
        {
          title: "COMPANY 결과",
          subtitle: "검색 결과",
          targetId: "company-1",
          targetPath: "/companies/company-1",
        },
      ],
    });
  });

  it("uses all primary target types and default limit", async () => {
    const repository = new FakeSearchRepository();
    const useCase = new SearchAllUseCase(repository);

    await useCase.execute(currentUser, { q: "검색어" });

    expect(repository.searchInput).toMatchObject({
      userId: "user-1",
      q: "검색어",
      types: [
        "COMPANY",
        "CONTACT",
        "PRODUCT",
        "DEAL",
        "SCHEDULE",
        "MEETING_NOTE",
      ],
      limit: 5,
    });
  });

  it("requires at least 2 trimmed characters", async () => {
    const repository = new FakeSearchRepository();
    const useCase = new SearchAllUseCase(repository);

    await expect(useCase.execute(currentUser, { q: " a " })).rejects.toThrow(
      SearchQueryRequiredError
    );
  });

  it("rejects invalid target types", async () => {
    const repository = new FakeSearchRepository();
    const useCase = new SearchAllUseCase(repository);

    await expect(
      useCase.execute(currentUser, { q: "검색", types: "COMPANY,UNKNOWN" })
    ).rejects.toThrow(ValidationDomainError);
  });
});

function createFakeTargetPath(type: string) {
  switch (type) {
    case "COMPANY":
      return "/companies/company-1";
    case "CONTACT":
      return "/contacts/contact-1";
    case "PRODUCT":
      return "/products/product-1";
    case "DEAL":
      return "/deals/deal-1";
    case "SCHEDULE":
      return "/schedules";
    case "MEETING_NOTE":
      return "/meeting-notes/meeting_note-1";
    default:
      return null;
  }
}
