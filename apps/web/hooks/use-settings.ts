"use client";

import { useAtom } from "jotai";
import { useState } from "react";

import { authUserAtom } from "@/lib/atoms/auth.atom";
import {
  MOCK_COMPANY_INFO,
  MOCK_SETTINGS_CATEGORIES,
  MOCK_SETTINGS_SUBCATEGORIES,
  type CompanyInfo,
  type SettingsCategory,
  type SettingsSubcategory,
} from "@/lib/mocks/settings.mock";

export interface CategoryInput {
  name: string;
}

export interface SubcategoryInput {
  categoryId: string;
  name: string;
}

export interface MyAccountProfileInput {
  name: string;
}

interface UseSettingsResult {
  companyInfo: CompanyInfo;
  updateCompanyInfo: (input: CompanyInfo) => void;
  categories: SettingsCategory[];
  subcategories: SettingsSubcategory[];
  createCategory: (input: CategoryInput) => void;
  toggleCategoryActive: (categoryId: string) => void;
  createSubcategory: (input: SubcategoryInput) => void;
  toggleSubcategoryActive: (subcategoryId: string) => void;
  updateMyAccountName: (input: MyAccountProfileInput) => void;
}

export function useSettings(): UseSettingsResult {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(MOCK_COMPANY_INFO);
  const [categories, setCategories] = useState<SettingsCategory[]>(MOCK_SETTINGS_CATEGORIES);
  const [subcategories, setSubcategories] = useState<SettingsSubcategory[]>(
    MOCK_SETTINGS_SUBCATEGORIES,
  );
  const [authUser, setAuthUser] = useAtom(authUserAtom);

  const updateCompanyInfo = (input: CompanyInfo) => {
    setCompanyInfo(input);
  };

  const createCategory = (input: CategoryInput) => {
    const newCategory: SettingsCategory = {
      id: crypto.randomUUID(),
      name: input.name,
      isActive: true,
    };

    setCategories((previous) => [...previous, newCategory]);
  };

  const toggleCategoryActive = (categoryId: string) => {
    setCategories((previous) =>
      previous.map((category) =>
        category.id === categoryId ? { ...category, isActive: !category.isActive } : category,
      ),
    );
  };

  const createSubcategory = (input: SubcategoryInput) => {
    const newSubcategory: SettingsSubcategory = {
      id: crypto.randomUUID(),
      categoryId: input.categoryId,
      name: input.name,
      isActive: true,
    };

    setSubcategories((previous) => [...previous, newSubcategory]);
  };

  const toggleSubcategoryActive = (subcategoryId: string) => {
    setSubcategories((previous) =>
      previous.map((subcategory) =>
        subcategory.id === subcategoryId
          ? { ...subcategory, isActive: !subcategory.isActive }
          : subcategory,
      ),
    );
  };

  const updateMyAccountName = (input: MyAccountProfileInput) => {
    if (!authUser) {
      return;
    }

    setAuthUser({ ...authUser, name: input.name });
  };

  return {
    companyInfo,
    updateCompanyInfo,
    categories,
    subcategories,
    createCategory,
    toggleCategoryActive,
    createSubcategory,
    toggleSubcategoryActive,
    updateMyAccountName,
  };
}
