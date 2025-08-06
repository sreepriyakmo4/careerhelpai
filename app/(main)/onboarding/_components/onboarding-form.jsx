"use client";
import React from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter} from "@/components/ui/card";
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import { Label } from "@/components/ui/label";
import { useState} from 'react';
import { onboardingSchema } from '@/app/lib/schema';

const onSubmit = async (values) => {};

const OnboardingForm = ({industries}) => {
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const router = useRouter();
  const {register,handleSubmit, formState: {errors},setValue,watch}=
  useForm({
    resolver: zodResolver(onboardingSchema),
  });
  const watchIndustry = watch("industry");
  return (
    <div className='flex items-center justify-center bg-background'>
      <Card className ="W-full max-w-lg mt-10 mx-2">
  <CardHeader>
    <CardTitle classname="text-4xl">Complete Your Profile</CardTitle>
    <CardDescription>Select your industry and know more about it</CardDescription>
  </CardHeader>
  <CardContent>
    <form className='space-y-6'  onSubmit={handleSubmit(onSubmit)}>
      <div className='space-y-2'>
        <Label htmlFor="industry" >Industry</Label>
        <Select 
         onValueChange={(value) => {
                  setValue("industry", value);
                  setSelectedIndustry(
                    industries.find((ind) => ind.id === value)
                  );
                  setValue("subIndustry", "");
                }}>
  <SelectTrigger id="industry">
    <SelectValue placeholder="Select an industry" />
  </SelectTrigger>
  <SelectContent>
    {industries.map((ind)=>{

  return (<SelectItem value={ind.id} key={ind.id}>{ind.name}</SelectItem>);
    })}
    
  </SelectContent>
</Select>
  {errors.industry && (
                <p className="text-sm text-red-500">
                  {errors.industry.message}
                </p>
              )}
      </div>


{watchIndustry && 
      <div className='space-y-2'>
        <Label htmlFor="subIndustry" >subIndustry</Label>
        <Select 
         onValueChange={(value) => {
                  setValue("subIndustry", value);
                }}>
  <SelectTrigger id="subIndustry">
    <SelectValue placeholder="Select an Specialization" />
  </SelectTrigger>
  <SelectContent>
    {selectedIndustry?.subIndustries.map((ind)=>{

  return (<SelectItem value={ind} key={ind}>
    {ind}
  </SelectItem>);
    })}
    
  </SelectContent>
</Select>
  {errors.subIndustry && (
                <p className="text-sm text-red-500">
                  {errors.subIndustry.message}
                </p>
              )}
      </div>}


      <div className='space-y-2'>
        <Label htmlFor="experiance" >YearsOfExperiance</Label>
        <Input 
        id="experiance"
        type="number"
        min="0"
        max="50"  
        placeholder="Enter your years of experience"
        {...register("experience")}
        />

  {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
      </div>



      <div className='space-y-2'>
        <Label htmlFor="skills" >Skills</Label>
        <Input 
        id="skills"
        placeholder="eg)pyjton,javascript,react,html,css"
        {...register("skills")}
        />

  {errors.skills && (
                <p className="text-sm text-red-500">
                  {errors.skills.message}
                </p>
              )}
      </div>
    </form>
  </CardContent>
</Card>
    </div>
  )
}


export default OnboardingForm;