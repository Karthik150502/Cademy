import LandingText from "@/components/ui/textAnimation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (

    <div className="min-h-screen overflow-hidden relative flex flex-col items-center justify-center gap-y-2">
      <LandingText size={55}>
        Welcome, Cademy | Video streaming Application
      </LandingText>
      <Link href={"/dashboard"} className="flex items-center justify-center gap-x-2 hover:underline">
        to Dashboard
        <ArrowRight strokeWidth={1} />
      </Link>
    </div>
  );
}
