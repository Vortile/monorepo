import { UserProfile } from "@clerk/nextjs";

const AccountPage = () => (
  <div className="flex flex-1 items-start justify-center p-6">
    <UserProfile />
  </div>
);

export default AccountPage;
