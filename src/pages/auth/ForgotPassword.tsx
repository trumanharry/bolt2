import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeftCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();
  
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        toast.error(error.message || 'Failed to send reset instructions');
      } else {
        toast.success('Reset instructions sent to your email');
        setSent(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ModernCRM</h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
        
        {sent ? (
          <div className="mt-8 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Email sent</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>We've sent a password reset link to your email address. Please check your inbox.</p>
                </div>
                <div className="mt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center text-sm font-medium text-green-700 hover:text-green-600"
                  >
                    <ArrowLeftCircle className="mr-2 h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 rounded-md shadow-sm">
              <Input
                id="email"
                type="email"
                label="Email address"
                placeholder="Enter your email"
                leftIcon={<Mail size={16} />}
                error={errors.email?.message}
                fullWidth
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
            </div>
            
            <div className="flex flex-col space-y-4">
              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isLoading}
              >
                Send Reset Instructions
              </Button>
              
              <Link to="/login" className="text-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;