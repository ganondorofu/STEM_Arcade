
import AuthGuard from '@/components/auth-guard';

export default function AddGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
