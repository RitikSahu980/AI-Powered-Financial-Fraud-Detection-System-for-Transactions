import { useState } from "react";
import { Lock } from "lucide-react";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

import { changePassword } from "../../services/userService";
import { normalizeApiError } from "../../api/axios";
import { useToast } from "../../context/ToastContext";

export default function AdminSettings() {
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await changePassword(currentPassword, newPassword);

      toast.success("Password updated successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(normalizeApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Settings
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Update your account password.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-100 bg-surface p-6 shadow-card"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3">
            <Lock className="text-blue-600" size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-ink">Change Password</h2>

            <p className="text-sm text-slate-500">
              Keep your account secure by updating your password.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <Input
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <Input
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button type="submit" isLoading={loading} className="mt-6 w-full">
          Update Password
        </Button>
      </form>
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
  <h2 className="text-lg font-semibold text-amber-700">
    Account Management
  </h2>

  <p className="mt-2 text-sm text-amber-700">
    Administrator accounts cannot be deleted from the application.
    Please contact the system owner if this account needs to be removed.
  </p>
</div>
    </div>
  );
}
