"use server";

import { prisma } from "@/lib/prisma";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  createdAt: Date;
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
  return categories;
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const category = await prisma.category.findUnique({
    where: { slug },
  });
  return category;
}

/**
 * Get requests by category slug with pagination
 */
export async function getRequestsByCategory(
  slug: string,
  page: number = 1,
  limit: number = 10
) {
  const category = await getCategoryBySlug(slug);
  if (!category) {
    throw new Error(`Category not found: ${slug}`);
  }

  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    prisma.productRequest.findMany({
      where: {
        categoryId: category.id,
        deletedAt: null,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        offers: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            offers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.productRequest.count({
      where: {
        categoryId: category.id,
        deletedAt: null,
      },
    }),
  ]);

  return {
    category,
    requests,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

