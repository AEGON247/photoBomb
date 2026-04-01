"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, FileScan } from 'lucide-react';

export default function LoginPage() {
    const { user, signIn, loading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-halftone p-4 font-sans">
            <Card className="w-full max-w-md rotate-1 z-10">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto bg-primary border-[3px] border-foreground p-4 shadow-comic-sm w-fit -rotate-3">
                        <Sparkles className="w-12 h-12 text-foreground" />
                    </div>
                    <CardTitle className="text-4xl font-display font-black uppercase tracking-tighter text-foreground" style={{ textShadow: "4px 4px 0 var(--color-primary)" }}>
                        PhotoBomb
                    </CardTitle>
                    <CardDescription className="text-foreground/80 font-medium text-lg leading-tight">
                        Find yourself in thousands of photos instantly.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2 text-center text-sm text-foreground/70 font-display font-bold uppercase tracking-wide">
                        <p>Sign in to save your model feedback.</p>
                        <p>Your photos never leave your browser.</p>
                    </div>
                    <Button
                        onClick={() => signIn()}
                        size="lg"
                        className="w-full text-lg -rotate-1"
                    >
                        <FileScan className="mr-2 w-6 h-6" />
                        Sign in with Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
