import { Card, CardContent } from "@repo/ui/components/ui/card";
import Image from "next/image";

import { LoginForm } from "./LoginForm";

const LOGO_WIDTH_PX = 160;
const LOGO_HEIGHT_PX = 48;

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <Image
          src="/logo.svg"
          alt="SIGAS"
          width={LOGO_WIDTH_PX}
          height={LOGO_HEIGHT_PX}
          priority
        />

        <Card className="dark w-full">
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
