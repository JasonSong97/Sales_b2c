import type { Company } from "@/features/company";

export type Contact = {
  readonly id: string;
  readonly name: string;
  readonly companyId: string | null;
  readonly companyName: string | null;
  readonly department: string | null;
  readonly position: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly hasMemo: boolean;
  readonly memoCount: number;
  readonly latestMemoAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
};

export type ContactMemo = {
  readonly id: string;
  readonly targetType: "CONTACT";
  readonly targetId: string;
  readonly memoDate: string;
  readonly title: string | null;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly permanentDeleteAt: string | null;
};

export type ContactDetail = {
  readonly contact: Contact;
  readonly company: Company | null;
  readonly memos: ContactMemo[];
  readonly relatedDealCount: number;
  readonly relatedProductCount: number;
};

export type ContactLog = {
  readonly id: string;
  readonly contactId: string;
  readonly loggedAt: string;
  readonly title: string;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt?: string | null;
  readonly permanentDeleteAt?: string | null;
};

export type PaginatedResponse<TItem> = {
  readonly items: TItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly hasNext: boolean;
};

export type ContactListResponse = PaginatedResponse<Contact>;
export type ContactLogListResponse = PaginatedResponse<ContactLog>;

export type DeleteContactResponse = {
  readonly id: string;
  readonly deletedAt: string;
  readonly permanentDeleteAt: string;
};

export type ContactListParams = {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly companyId?: string;
  readonly includeDeleted?: boolean;
};

export type ContactLogListParams = {
  readonly page?: number;
  readonly pageSize?: number;
};

export type CreateContactInput = {
  readonly name: string;
  readonly companyId?: string;
  readonly department?: string;
  readonly position?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly address?: string;
  readonly initialMemo?: string;
};

export type UpdateContactInput = {
  readonly contactId: string;
  readonly name?: string;
  readonly companyId?: string | null;
  readonly department?: string | null;
  readonly position?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly address?: string | null;
};

export type CreateContactLogInput = {
  readonly contactId: string;
  readonly loggedAt: string;
  readonly title: string;
  readonly content?: string;
};

export type UpdateContactLogInput = {
  readonly contactId: string;
  readonly logId: string;
  readonly loggedAt?: string;
  readonly title?: string;
  readonly content?: string;
};
