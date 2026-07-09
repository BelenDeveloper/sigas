import { SidebarHeader } from "@repo/ui/components/ui/sidebar";
import Image from "next/image";

const LOGO_WIDTH_PX = 120;
const LOGO_HEIGHT_PX = 36;

export function SidebarBrand() {
  return (
    <SidebarHeader className="items-center py-4 group-data-[collapsible=icon]:hidden">
      <Image
        src="/logo-on-dark.svg"
        alt="SIGAS"
        width={LOGO_WIDTH_PX}
        height={LOGO_HEIGHT_PX}
        priority
      />
    </SidebarHeader>
  );
}
