"use client";
import React from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter} from "@/components/ui/card";
import {select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "@/components/ui/select";
import { useRouter } from 'next/navigation';

const OnboardingForm = ({industries}) => {
  const [selectedIndustry, setSelectedIndustry] = useState[null];
  const router = useRouter();
  const {register,handleSubmit, formState: {errors},setValue,watch}=
  useForm({
    resolver: zodResolver(onboardingSchema),
  });
  return (
    <div className='fllex flex-col items-center justify-center bg-background'>
      <Card className ={"W-full, max-w-lg,mt-10,mx=2"}>
  <CardHeader>
    <CardTitle text-4xl>Complete Your Profile</CardTitle>
    <CardDescription>Select your industry and know more about it</CardDescription>
  </CardHeader>
  <CardContent>
    <form>
      <div>
        <Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
    <SelectItem value="system">System</SelectItem>
  </SelectContent>
</Select>
      </div>
    </form>
  </CardContent>
</Card>
    </div>
  )
}

export default OnboardingForm;