import { SignUp } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";

export default function SignUpPage() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  return (
    <div className="container">
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        forceRedirectUrl={redirectUrl}
      />
    </div>
  );
}
