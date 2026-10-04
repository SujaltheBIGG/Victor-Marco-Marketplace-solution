'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FieldError, FieldValues, FormProvider, useForm, useFormContext } from 'react-hook-form';

import { Button } from '@/components/atoms';
import { Alert } from '@/components/atoms/Alert/Alert';
import { LabeledInput } from '@/components/cells';
import { login, transferCart } from '@/lib/data/customer';
import { toast } from '@/lib/helpers/toast';

import { LoginFormData, loginFormSchema } from './schema';

export const LoginForm = () => {
  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  return (
    <FormProvider {...methods}>
      <Form />
    </FormProvider>
  );
};

const Form = () => {
  const [isAuthError, setIsAuthError] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting }
  } = useFormContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSessionExpired = searchParams.get('sessionExpired') === 'true';
  const isSessionRequired = searchParams.get('sessionRequired') === 'true';

  const submit = async (data: FieldValues) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const res = await login(formData);

    if (res.success) {
      router.push('/user');
      await transferCart();
    } else {
      toast.error({ title: res.message || 'An error occurred. Please try again.' });
    }

    setIsAuthError(false);
    router.push('/user');
  };

  const clearApiError = () => {
    isAuthError && setIsAuthError(false);
  };

  const getAuthMessage = () => {
    if (isSessionExpired) {
      return 'Your session has expired. Please log in to continue.';
    }
    if (isSessionRequired) {
      return 'Please log in to continue.';
    }
    return null;
  };

  const authMessage = getAuthMessage();

  return (
    <main className="mx-auto w-full max-w-screen-xl px-4 py-16 sm:px-6" data-testid="login-page">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-h2 font-normal text-heading">Your account</h1>
          <p className="mt-2 text-body text-muted">
            Sign in to see your orders, addresses and messages.
          </p>
        </div>
        {authMessage && (
          <Alert
            title={authMessage}
            className="mb-4 w-full"
            icon
            data-testid="login-auth-alert"
          />
        )}
        <div className="border border-border bg-surface-subtle p-6" data-testid="login-form-container">
          <h2 className="mb-6 font-display text-h2 font-normal text-heading">Sign in</h2>
          <form onSubmit={handleSubmit(submit)} data-testid="login-form">
            <div className="space-y-4">
              <LabeledInput
                label="Email"
                placeholder="you@example.com"
                error={
                  (errors.email as FieldError) ||
                  (isAuthError ? ({ message: '' } as FieldError) : undefined)
                }
                data-testid="login-email-input"
                {...register('email', {
                  onChange: clearApiError
                })}
              />
              <LabeledInput
                label="Password"
                placeholder="Your password"
                type="password"
                error={
                  (errors.password as FieldError) ||
                  (isAuthError ? ({ message: '' } as FieldError) : undefined)
                }
                data-testid="login-password-input"
                {...register('password', {
                  onChange: clearApiError
                })}
              />
            </div>
            <Button className="mt-6 h-12 w-full" disabled={isSubmitting} data-testid="login-submit-button">
              Sign in
            </Button>
          </form>
          <div className="mt-6 flex flex-col items-center gap-4">
            <Link
              href="/forgot-password"
              className="ui-label text-eyebrow text-fg hover:underline"
              data-testid="login-forgot-password-link"
            >
              Forgot your password?
            </Link>
            <Link
              href="/register"
              className="ui-label text-eyebrow text-fg hover:underline"
              data-testid="login-register-link"
            >
              No account? Create one
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-small text-fg-secondary">
          You can also{" "}
          <Link href="/cart" className="underline hover:text-fg">
            check out as a guest
          </Link>
          .
        </p>
      </div>
    </main>
  );
};
