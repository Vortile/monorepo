import { RegisterWabaForm } from "@/components/dashboard/register-waba-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const RegisterWabaPage = () => (
  <div className="container mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12 sm:px-8">
    <Card>
      <CardHeader>
        <CardTitle>Register New WABA</CardTitle>
        <CardDescription>
          Add a new WhatsApp Business Account from Gupshup Partner Portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterWabaForm />
      </CardContent>
    </Card>
  </div>
);

export default RegisterWabaPage;
