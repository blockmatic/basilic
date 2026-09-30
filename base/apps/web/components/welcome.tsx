export function Welcome({ name }: { name: string }) {
  return (
    <div className="space-y-2" data-testid="welcome">
      <h1 className="font-heading text-2xl font-semibold">
        Welcome to {name}. Your application is ready.
      </h1>
      <p className="text-muted-foreground text-sm">
        Ask for application status or your account.
      </p>
    </div>
  );
}
