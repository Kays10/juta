import "./globals.css";

export const metadata = {
  title: "Juta Consulting",
  description: "Future-focused IT programmes",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
