import Note from "@/component/Note";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const page = async () => {
  const token = (await cookies()).get("accessToken")?.value;

  if (!token) {
    return redirect("/sign-in");
  }

  return (
    <div>
      <Note />
    </div>
  );
};

export default page;
