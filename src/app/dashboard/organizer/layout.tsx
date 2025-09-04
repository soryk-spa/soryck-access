export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6 font-roboto">
      {children}
    </div>
  );
}
