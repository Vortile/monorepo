"use client";

import { useState } from "react";
import { X, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal = ({
  isOpen,
  onClose,
}: InviteMemberModalProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Staff");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSuccess(true);

    // Reset after 2 seconds
    setTimeout(() => {
      setEmail("");
      setRole("Staff");
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEmail("");
      setRole("Staff");
      setIsSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            Invite Team Member
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        {!isSuccess ? (
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="team@sharmafoods.com"
                  className="pl-10 border-border"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                An invitation will be sent to this email address
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground disabled:opacity-50"
                disabled={isSubmitting}
              >
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
              </select>
              <p className="text-xs text-muted-foreground">
                {role === "Admin"
                  ? "Full access to all features and settings"
                  : "Can manage products and view orders"}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> An invitation email will be sent to the
                member. They&apos;ll need to click the link to accept and set up
                their account.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-1">
                Invitation Sent!
              </h3>
              <p className="text-sm text-muted-foreground">
                An invitation has been sent to{" "}
                <span className="font-medium">{email}</span>
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        {!isSuccess && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-card">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary"
            >
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
