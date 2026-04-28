import { GraduationCap, LogOut, Moon, Sun, User } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";

export default function DashboardHeader({ user, onLogout, onEditProfile, darkMode, onToggleDark }) {
  return (
    <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-semibold dark:text-white hidden sm:inline">Career Guidance Platform</span>
            <span className="text-xl font-semibold dark:text-white sm:hidden">CGP</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <User className="w-4 h-4 dark:text-gray-300" />
              <span className="text-sm dark:text-gray-300">{user?.name}</span>
              <Badge variant="outline">{user?.role}</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDark}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            {onEditProfile && (
              <Button variant="outline" size="sm" onClick={onEditProfile} className="hidden sm:flex">
                Edit Profile
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
