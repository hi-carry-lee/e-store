import { Metadata } from "next";
import { auth } from "@/auth";
import ProfileForm from "./profile-form";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Customer Profile",
};

const Profile = async () => {
  const session = await auth();

  // dubble check if user is logged in
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/profile");
    return;
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="h2-bold">Profile</h2>
      <SessionProvider session={session}>
        <ProfileForm
          initialData={{
            name: session?.user?.name || "",
            email: session?.user?.email || "",
          }}
        />
      </SessionProvider>
    </div>
  );
};

export default Profile;
