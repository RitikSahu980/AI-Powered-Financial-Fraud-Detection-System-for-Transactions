import { useState } from "react";
import { Lock, Bell } from "lucide-react";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { changePassword } from "../../services/userService";
import { normalizeApiError } from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { deleteProfile } from "../../services/authService";
export default function UserSettings() {
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteBox, setShowDeleteBox] = useState(false);

  const [loading, setLoading] = useState(false);

  async function handleDelete(e) {

    e.preventDefault();
    const userId = localStorage.getItem("userId");

    try {

        await deleteProfile(userId, password);

        toast.success("Account deleted successfully.");

logout();

navigate("/login", { replace: true });

    } catch (err) {

        toast.error("Incorrect password.");

    }

}
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
          Manage your account preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Password */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-100 bg-surface p-6 shadow-card"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3">
              <Lock size={22} className="text-blue-600" />
            </div>

            <div>
              <h2 className="font-semibold text-ink">Change Password</h2>

              <p className="text-sm text-slate-500">
                Update your account password.
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

        {/* Notifications

        <div className="rounded-2xl border border-slate-100 bg-surface p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-3">
              <Bell size={22} className="text-amber-500" />
            </div>

            <div>
              <h2 className="font-semibold text-ink">Notifications</h2>

              <p className="text-sm text-slate-500">
                Manage notification preferences.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <span className="text-sm font-medium text-ink">Fraud Alerts</span>

              <input type="checkbox" defaultChecked disabled />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <span className="text-sm font-medium text-ink">
                Weekly Summary
              </span>

              <input type="checkbox" disabled />
            </label>

            <p className="text-xs text-slate-400">
              Notification preferences will be available in a future update.
            </p>
          </div>
        </div>  */}
        {/* Danger Zone */}

<div className="rounded-2xl border border-red-200 bg-red-50 p-6">

  <h2 className="text-lg font-semibold text-red-600">
    Account Deletion
  </h2>

  <p className="mt-2 text-sm text-red-500">
    Deleting your account is permanent and cannot be undone.
  </p>

  {!showDeleteBox ? (

<Button
  type="button"
  className="mt-6 w-full bg-red-600 hover:bg-red-700"
  onClick={() => setShowDeleteBox(true)}
>
  Delete Account
</Button>

  ) : (

    <div className="mt-6 space-y-4">

      <Input
        type="password"
        label="Confirm Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex gap-3">

<Button
    type="button"
    className="flex-1 bg-red-600 hover:bg-red-700"
    onClick={handleDelete}
>
    Permanently Delete
</Button>

        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => {
            setShowDeleteBox(false);
            setPassword("");
          }}
        >
          Cancel
        </Button>

      </div>

    </div>

  )}

</div>
      </div>
    </div>
  );
}
