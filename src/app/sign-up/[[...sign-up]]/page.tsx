import { SignUp } from '@clerk/nextjs'

export default function Page() {
  console.log('[signup-page] Sign-up page accessed at:', new Date().toISOString());
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-primary hover:bg-primary/90 text-primary-foreground",
              card: "bg-card shadow-lg border",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: 
                "bg-background border border-input hover:bg-accent",
              socialButtonsBlockButtonText: "text-foreground",
              formFieldInput: 
                "bg-background border border-input text-foreground",
              formFieldLabel: "text-foreground",
              footerActionLink: "text-primary hover:text-primary/90"
            }
          }}
          afterSignUpUrl="/dashboard"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}