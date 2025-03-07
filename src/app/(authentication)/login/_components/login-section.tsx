import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import LoginForm from './login-form';

export default function LoginSection() {
    return (
        <Card className="mx-auto max-w-md md:min-w-[26rem] sm:border-neutral-600/10 border-black/0 shadow-none sm:shadow-sm">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Login</CardTitle>
                <CardDescription className="text-center">
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <LoginForm />
            </CardContent>
        </Card>
    );
}
