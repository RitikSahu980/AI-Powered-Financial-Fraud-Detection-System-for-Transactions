import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { resetPassword } from "../../services/authService";

export default function ResetPassword() {

    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();

 const token = location.state?.token;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

try {

    await resetPassword({

    token,

    newPassword: password

});

    toast.success("Password reset successfully.");

    navigate("/login");

} catch (err) {

    toast.error("Unable to reset password.");

}
    }

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Enter your new password."
        >

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >

                <Input
                    id="password"
                    label="New Password"
                    type="password"
                    icon={Lock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Input
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    icon={Lock}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button
                    type="submit"
                    className="w-full"
                >
                    Reset Password
                </Button>

            </form>

        </AuthLayout>
    );
}