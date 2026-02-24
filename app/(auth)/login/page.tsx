"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, HardDrive } from 'lucide-react';

export default function LoginPage() {
    const { user, signIn, loading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <Card className="w-full max-w-md bg-slate-950 border-slate-800 text-slate-100 shadow-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto bg-blue-600/20 p-4 rounded-full w-fit">
                        <Sparkles className="w-12 h-12 text-blue-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        FaceFinder
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                        Find yourself in thousands of photos instantly.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2 text-center text-sm text-slate-500">
                        <p>Securely connects to your Google Drive.</p>
                        <p>Your photos never leave your browser.</p>
                    </div>
                    <Button
                        onClick={() => signIn()}
                        className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                    >
                        <HardDrive className="mr-2 w-5 h-5" />
                        Connect Google Drive
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
