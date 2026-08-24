import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateConfirmPassword,
} from '../../utils/validators';
import { normalizeApiError } from '../../api/axios';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    };
  }

  function validate() {
    const next = {
  fullName: validateRequired(form.fullName, 'Full name'),
  username: validateRequired(form.username, 'Username'),
  email: validateEmail(form.email),
  password: validatePassword(form.password),
  confirmPassword: validateConfirmPassword(
      form.password,
      form.confirmPassword
  ),
};
    setErrors(next);
    return !Object.values(next).some(Boolean);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(form);
      // The backend's register endpoint does not issue a token (see
      // authService.js) - there is no auto-login flow to run here, so the
      // correct next step is sending the person to sign in explicitly.
      toast.success('Account created. Sign in to continue.');
      navigate('/login', { replace: true });
    } catch (err) {
      const normalized = normalizeApiError(err);
      if (normalized.isValidationError) {
        const fieldErrors = {};
        normalized.fieldErrors.forEach((fe) => {
          fieldErrors[fe.field] = fe.message;
        });
        setErrors(fieldErrors);
      } else if (normalized.status === 409) {

    if (
        normalized.message.toLowerCase().includes("username")
    ) {

        setErrors((prev) => ({
            ...prev,
            username: normalized.message,
        }));

    } else {

        setErrors((prev) => ({
            ...prev,
            email: normalized.message,
        }));

    }
} else {
        toast.error(normalized.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Set up analyst access to the fraud monitoring platform.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          id="fullName"
          label="Full name"
          icon={User}
          placeholder="Jane Analyst"
          value={form.fullName}
          onChange={handleChange('fullName')}
          error={errors.fullName}
          autoComplete="name"
        />
        <Input
  id="username"
  label="Username"
  icon={User}
  placeholder="ritik_sahu"
  value={form.username}
  onChange={handleChange('username')}
  error={errors.username}
  autoComplete="username"
/>
        <Input
          id="email"
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@company.com"
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          id="password"
          label="Password"
          type="password"
          icon={Lock}
          placeholder="At least 8 characters"
          value={form.password}
          onChange={handleChange('password')}
          error={errors.password}
          autoComplete="new-password"
        />
        <Input
          id="confirmPassword"
          label="Confirm password"
          type="password"
          icon={Lock}
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" className="mt-2 w-full" isLoading={isSubmitting} icon={UserPlus}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-azure hover:text-azure-dim">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
