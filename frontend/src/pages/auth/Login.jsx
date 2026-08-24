import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { validateEmail, validatePassword } from "../../utils/validators";
import { normalizeApiError } from "../../api/axios";
import { homeRouteForRole } from "../../utils/roleRouting";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const redirectTo = location.state?.from?.pathname;

  function handleChange(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    };
  }

  function validate() {
    const next = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(next);
    return !Object.values(next).some(Boolean);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const { role } = await login(form);
      toast.success("Welcome back.");
      navigate(homeRouteForRole(role), { replace: true });
    } catch (err) {
      const normalized = normalizeApiError(err);
      if (normalized.isValidationError) {
        const fieldErrors = {};
        normalized.fieldErrors.forEach((fe) => {
          fieldErrors[fe.field] = fe.message;
        });
        setErrors(fieldErrors);
      } else {
        toast.error(normalized.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your fraud monitoring workspace."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@company.com"
          value={form.email}
          onChange={handleChange("email")}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          id="password"
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange("password")}
          error={errors.password}
          autoComplete="current-password"
        />
        <div className="flex justify-end mt-2 mb-4">
    <Link
        to="/forgot-password"
        className="text-sm text-blue-600 hover:underline"
    >
        Forgot Password?
    </Link>
</div>

        <Button
          type="submit"
          className="mt-2 w-full"
          isLoading={isSubmitting}
          icon={LogIn}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&rsquo;t have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-azure hover:text-azure-dim"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
