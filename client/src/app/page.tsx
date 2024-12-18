import LandingText from "@/components/ui/textAnimation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (

    <div className="min-h-screen overflow-hidden relative flex flex-col items-center justify-center gap-y-2">
      <LandingText size={55}>
        Welcome, Cademy | Video streaming Application
      </LandingText>
      <p>
        NEXT_PUBLIC_BACKEND_SERVER {process.env.NEXT_PUBLIC_BACKEND_SERVER}
        NEXT_PUBLIC_APP_SERVER {process.env.NEXT_PUBLIC_APP_SERVER}
        AUTH_TRUST_HOST {process.env.AUTH_TRUST_HOST}
        NEXTAUTH_URL {process.env.NEXTAUTH_URL}
        NEXT_PUBLIC_WS_SERVER {process.env.NEXT_PUBLIC_WS_SERVER}
      </p>
      <Link href={"/dashboard"} className="flex items-center justify-center gap-x-2 hover:underline">
        to Dashboard
        <ArrowRight strokeWidth={1} />
      </Link>
    </div>
  );
}
