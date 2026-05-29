import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className="container">
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
