import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import GolemDBConsole from "./pages/console";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="db-manager-theme">
      <Router>
        <div className="flex h-screen bg-background">
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* <main className="flex-1 overflow-auto"> */}
            <main className="flex-1 overflow-auto w-full">
              <Routes>
                <Route path="/" element={<GolemDBConsole />} />
              </Routes>
            </main>
          </div>
        </div>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
