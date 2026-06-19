import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Dumbbell, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login or Join — SRGYM" },
      { name: "description", content: "Login or create an account at SRGYM AND FITNESS CENTRE." },
    ],
  }),
  component: Auth,
});

const signupSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(20),
  address: z.string().trim().min(2).max(300),
  emergency_contact: z.string().trim().min(2).max(150),
  password: z.string().min(8, "Min 8 characters").max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(72),
});

function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <div className="relative isolate min-h-screen bg-background">
      <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-50" />
      <div className="absolute inset-0 -z-10 grid-bg opacity-30" />

      <Link to="/" className="absolute left-4 top-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground sm:left-8 sm:top-8">
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>

      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary">
            <Dumbbell className="h-3 w-3" /> SRGYM
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold">Welcome to <span className="text-gradient-red">SRGYM</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">Members area — track your fitness journey.</p>
        </div>

        <div className="glass-strong rounded-2xl p-6 shadow-card">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-5"><LoginForm /></TabsContent>
            <TabsContent value="signup" className="mt-5"><SignupForm /></TabsContent>
          </Tabs>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-surface px-2 text-xs text-muted-foreground">OR</span></div>
          </div>

          <Button variant="outline" className="w-full" onClick={async () => {
            const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
            if (r.error) toast.error(r.error.message || "Google sign-in failed");
            else if (!r.redirected) navigate({ to: "/dashboard" });
          }}>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = loginSchema.safeParse({ email, password });
    if (!p.success) { toast.error(p.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(p.data);
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Welcome back!"); navigate({ to: "/dashboard" }); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="li-email">Email</Label>
        <Input id="li-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="li-pw">Password</Label>
          <ForgotPasswordDialog />
        </div>
        <div className="relative">
          <Input id="li-pw" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-gradient-red text-primary-foreground shadow-red">
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}

function SignupForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", address: "", emergency_contact: "", password: "",
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = signupSchema.safeParse(form);
    if (!p.success) { toast.error(p.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: p.data.email,
      password: p.data.password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: {
          full_name: p.data.full_name,
          phone: p.data.phone,
          address: p.data.address,
          emergency_contact: p.data.emergency_contact,
        },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Account created! Welcome to SRGYM."); navigate({ to: "/dashboard" }); }
  }

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <Label>Full name</Label>
        <Input value={form.full_name} onChange={setF("full_name")} required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={setF("email")} required />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={setF("phone")} required />
        </div>
      </div>
      <div>
        <Label>Address</Label>
        <Textarea rows={2} value={form.address} onChange={setF("address")} required />
      </div>
      <div>
        <Label>Emergency contact</Label>
        <Input placeholder="Name & phone" value={form.emergency_contact} onChange={setF("emergency_contact")} required />
      </div>
      <div>
        <Label>Password</Label>
        <div className="relative">
          <Input type={show ? "text" : "password"} value={form.password} onChange={setF("password")} required minLength={8} />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-gradient-red text-primary-foreground shadow-red">
        {loading ? "Creating..." : "Create account"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">By signing up you agree to our terms & privacy policy.</p>
    </form>
  );
}

function ForgotPasswordDialog() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function submit() {
    if (!email) return toast.error("Enter your email");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Reset link sent. Check your inbox."); setOpen(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="text-xs text-primary hover:underline">Forgot?</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>We'll email you a link to set a new password.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={loading} className="bg-gradient-red text-primary-foreground">
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
