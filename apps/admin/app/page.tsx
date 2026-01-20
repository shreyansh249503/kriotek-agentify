import Link from "next/link";

export default async function AdminHome() {
  return (
    <div>
      <h1>Adentify </h1>
      <Link href={"/login"}>Login</Link>
      <br />
      <br />
      <Link href={"/signup"}>SignUp</Link>
    </div>
  );
}
