import { useState } from "react";
import { User, Mail } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { verifyUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

export default function ForgotPassword() {

    const [form, setForm] = useState({
        username: "",
        email: "",
    });
    const navigate = useNavigate();
const toast = useToast();
    
async function handleSubmit(e) {
    e.preventDefault();

    try {

const response = await verifyUser(form);

if (response.verified) {

    toast.success("Verification successful.");

    navigate("/reset-password", {
        state: {
            token: response.token
        }
    });

} else {

    toast.error("Username and email do not match.");

}

    } catch (err) {
        toast.error("Something went wrong.");
    }
}

    return (
        <AuthLayout
            title="Forgot Password"
            subtitle="Verify your username and email."
        >

            <form onSubmit={handleSubmit} className="space-y-4">

                <Input
                    id="username"
                    label="Username"
                    icon={User}
                    value={form.username}
                    onChange={(e)=>
                        setForm({...form,username:e.target.value})
                    }
                />

                <Input
                    id="email"
                    label="Email"
                    icon={Mail}
                    value={form.email}
                    onChange={(e)=>
                        setForm({...form,email:e.target.value})
                    }
                />

                <Button
                    type="submit"
                    className="w-full"
                >
                    Verify
                </Button>

            </form>

        </AuthLayout>
    );
}