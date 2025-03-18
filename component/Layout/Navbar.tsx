import { userLogout } from "@/app/action/userAuth";
import { cookies } from "next/headers";
import Link from "next/link";
import { FiLogOut } from "react-icons/fi";

const Navbar: React.FC = async () => {
  const token = (await cookies()).get("accessToken")?.value;

  return (
    <nav className="bg-white shadow my-3">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto py-4">
        {/* Logo */}
        <Link
          href=""
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8"
            alt="Flowbite Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            Note App
          </span>
        </Link>
        {token && (
          <form action={userLogout}>
            <button
              type="submit"
              className="w-full px-5 py-3 text-left text-lg text-gray-800 hover:bg-primary hover:text-blue-700 flex items-center space-x-2"
            >
              <FiLogOut className="size-4" />
              <p> Logout</p>
            </button>
          </form>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
