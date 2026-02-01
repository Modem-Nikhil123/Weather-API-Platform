import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "WeatherAPI - Real-time Weather Data for Developers",
  description: "Fast, reliable, and scalable weather API for developers. Get instant access to accurate weather data worldwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
