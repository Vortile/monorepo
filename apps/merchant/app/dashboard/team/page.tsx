"use client";

import { useState } from "react";
import { TeamPage } from "@/components/dashboard/team-page";
import { InviteMemberModal } from "@/components/dashboard/invite-member-modal";

const Page = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  return (
    <>
      <TeamPage onInviteMember={() => setIsInviteModalOpen(true)} />
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </>
  );
};

export default Page;
