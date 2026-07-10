"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { useAtomValue } from "jotai";

import { useSettings } from "@/hooks/use-settings";
import { authUserAtom } from "@/lib/atoms/auth.atom";

import { CategoriesManager } from "./CategoriesManager";
import { CompanyInfoForm } from "./CompanyInfoForm";
import { MyAccountForm } from "./MyAccountForm";

const ADMIN_ROLE = "admin";

export function SettingsPage() {
  const authUser = useAtomValue(authUserAtom);
  const isAdmin = authUser?.role === ADMIN_ROLE;

  const {
    companyInfo,
    updateCompanyInfo,
    categories,
    subcategories,
    createCategory,
    toggleCategoryActive,
    createSubcategory,
    toggleSubcategoryActive,
    updateMyAccountName,
  } = useSettings();

  return (
    <Tabs defaultValue={isAdmin ? "company" : "account"}>
      <TabsList>
        {isAdmin ? <TabsTrigger value="company">Información de la empresa</TabsTrigger> : null}
        {isAdmin ? <TabsTrigger value="categories">Categorías</TabsTrigger> : null}
        <TabsTrigger value="account">Mi cuenta</TabsTrigger>
      </TabsList>

      {isAdmin ? (
        <TabsContent value="company" className="pt-4">
          <CompanyInfoForm companyInfo={companyInfo} onUpdate={updateCompanyInfo} />
        </TabsContent>
      ) : null}

      {isAdmin ? (
        <TabsContent value="categories" className="pt-4">
          <CategoriesManager
            categories={categories}
            subcategories={subcategories}
            onCreateCategory={createCategory}
            onToggleCategoryActive={toggleCategoryActive}
            onCreateSubcategory={createSubcategory}
            onToggleSubcategoryActive={toggleSubcategoryActive}
          />
        </TabsContent>
      ) : null}

      <TabsContent value="account" className="pt-4">
        {authUser ? (
          <MyAccountForm
            name={authUser.name}
            email={authUser.email}
            onUpdateName={updateMyAccountName}
          />
        ) : null}
      </TabsContent>
    </Tabs>
  );
}
