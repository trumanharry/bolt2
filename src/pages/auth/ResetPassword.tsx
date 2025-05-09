import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const { updatePassword } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();
  
  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await updatePassword(data.password);
      
      if (error) {
        toast.error(error.message || 'Failed to reset password');
      } else {
        toast.success('Password reset successfully');
        navigate('/login');
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
            Enter your new password below.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <Input
              id="password"
              type="password"
              label="New Password"
              placeholder="Enter your new password"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              fullWidth
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            
            <Input
              id="confirmPassword"
              type="password"
              label="Confirm New Password"
              placeholder="Confirm your new password"
              leftIcon={<Lock size={16} />}
              error={errors.confirmPassword?.message}
              fullWidth
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === watch('password') || 'Passwords do not match',
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
              Reset Password
            </Button>
            
            <Link to="/login" className="text-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;