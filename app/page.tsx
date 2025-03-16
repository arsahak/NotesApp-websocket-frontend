import { auth } from "@/auth";
import Note from "@/component/Note";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await auth();

  // Redirects unauthorized users

  if (!session) {
    return redirect("/sign-in");
  }

  return (
    <div>
      <Note />
    </div>
  );
};

export default page;
