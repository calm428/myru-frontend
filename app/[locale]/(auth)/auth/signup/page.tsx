import { SignUpCard } from '@/components/auth/signup-card';

export default function SignupPage() {
  return (
    <section className='flex flex-col items-center lg:flex-row'>
      <div className="flex h-0 max-h-screen w-full items-center justify-center a-bg  bg-cover bg-center !bg-no-repeat lg:h-screen lg:w-1/2 xl:w-[50%]"></div>
      <div className='h-screen px-3 py-24 lg:w-1/2 xl:w-[40%]'>
        <SignUpCard></SignUpCard>
      </div>
    </section>
  );
}
