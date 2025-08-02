import { SignedOut,SignedIn, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "./ui/button";
import { FileTextIcon, GraduationCap, LayoutDashboard, PenBoxIcon, StarsIcon } from 'lucide-react';
import { checkUser } from '../lib/checkUser';

import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Header = async () => {
  await checkUser();

  return (
    <header className='fi xed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50
    supports=[backdrop-filter]:bg-background/80'>
      <nav className='container mx-auto px-4 h-16 flex items-center justify-between'>
        <Link href='/'>
        <Image
          src="/logo.png" alt="Sensai Logo" width={200} height={60} 
          className="h-12 py-1 w-auto object-contain"
           />
        </Link>

        <div className='flex items-center space-x-2 md:space-x-4'>
      <SignedIn>
            <Link href={"/dashboard"}>
            <Button variant="outline" className='hidden md:flex items-center gap-2'>
              <LayoutDashboard className="h-4 w-4" />
              <span className='hidden md:block'>Industry Insights</span>
            </Button>
            </Link>


          <DropdownMenu>
            <DropdownMenuTrigger>
            <Button>
              <StarsIcon className="h-4 w-4" />
              <span className='hidden md:block'>Growth Tools</span>
              <ChevronDown className="h-4 w-4" />
            </Button>             
            </DropdownMenuTrigger>
            <DropdownMenuContent>
            <DropdownMenuItem>
              <Link href={"/resume"} className='flex items-center gap-2'>
      <FileTextIcon className="h-4 w-4" />
      <span>Build Resume</span>
      </Link>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Link href={"/ai-cover-letter"} className='flex items-center gap-2'>
      <PenBoxIcon className="h-4 w-4" />
      <span>CoverLetter</span>
      </Link>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Link href={"/interview"} className='flex items-center gap-2'>
      <GraduationCap className="h-4 w-4" />
      <span>Interview Prep</span>
      </Link>
    </DropdownMenuItem>
    </DropdownMenuContent> 
     </DropdownMenu>
      </SignedIn>

      <SignedOut>
        <SignInButton>
        <Button variant="outline">Sign In</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
           <UserButton appearance={{
            elements: {
             avatarBox: 'h-10 w-10',
              userButtonPopoverCard:'shadow-x1',
              userPreviewMainIdentifier: 'font-semibold text-sm',
            },
           }} 
          afterSignOutUrl='/' />
      </SignedIn>
      
      </div>
    </nav>
  </header>
    
  );
};

export default Header;