import { ResourceSort } from "../../enums/resource-sort.enum";

export function buildResourceSort(sort?: ResourceSort) {
  switch (sort) {

    case ResourceSort.OLDEST:
      return { createdAt: 1 };

    case ResourceSort.POPULAR:
      return { downloads: -1 };

    case ResourceSort.DOWNLOADS:
      return { downloads: -1 };

    case ResourceSort.NEWEST:
    default:
      return { createdAt: -1 };
  }
}