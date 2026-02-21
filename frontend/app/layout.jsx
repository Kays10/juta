import "./globals.css";

export const metadata = {
  title: "LH Open Minded Institute",
  description: "Future-focused IT and Mathematics programmes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

