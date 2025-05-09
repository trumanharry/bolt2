import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

const SignUp: React.FC = () => {
  const { signUp } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>();
  
  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await signUp(data.email, data.password, data.fullName);
      
      if (error) {
        toast.error(error.message || 'Failed to create account');
      } else {
        toast.success('Account created successfully! Please check your email to confirm your registration.');
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
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create a new account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <Input
              id="fullName"
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              leftIcon={<User size={16} />}
              error={errors.fullName?.message}
              fullWidth
              {...register('fullName', {
                required: 'Full name is required',
              })}
            />
            
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
            
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Create a password"
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
              label="Confirm Password"
              placeholder="Confirm your password"
              leftIcon={<Lock size={16} />}
              error={errors.confirmPassword?.message}
              fullWidth
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === watch('password') || 'Passwords do not match',
              })}
            />
          </div>
          
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            leftIcon={<UserPlus size={16} />}
          >
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;