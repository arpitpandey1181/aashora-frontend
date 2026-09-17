'use client';

import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Bell, User, Menu, MapPin, LogOut } from 'lucide-react';
import { useClinicStore } from '@/store/clinic-store';
import { useRouter } from 'next/navigation';

export function Header({ onMenuClick }) {
  const router = useRouter();
  const { currentUser } = useClinicStore();
  const [mounted, setMounted] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('softycare_user');
      if (storedUser) {
        try { setUserInfo(JSON.parse(storedUser)); } catch { }
      }

      const storedLocs = localStorage.getItem('softycare_locations');
      let locList = [];
      if (storedLocs) {
        try {
          const parsed = JSON.parse(storedLocs);
          if (Array.isArray(parsed) && parsed.length > 0) locList = parsed;
        } catch { }
      }

      const defaultLocName = userInfo?.locationname || userInfo?.locationName || 'DEMO SOFTY CARE';
      if (!locList || locList.length === 0) {
        locList = [
          { locationid: userInfo?.locationid || 2, locationname: defaultLocName },
        ];
      }
      setLocations(locList);

      const activeLocStr = localStorage.getItem('softycare_active_location');
      if (activeLocStr) {
        try {
          const parsedActive = JSON.parse(activeLocStr);
          setSelectedLocationId(parsedActive?.locationid || locList[0]?.locationid);
        } catch {
          setSelectedLocationId(locList[0]?.locationid);
        }
      } else {
        setSelectedLocationId(locList[0]?.locationid);
      }
    }
  }, [userInfo?.locationname]);

  const handleLocationChange = (e) => {
    const locId = e.target.value;
    setSelectedLocationId(locId);
    const foundLoc = locations.find((l) => String(l.locationid) === String(locId)) || { locationid: locId, locationname: 'BRANCH ' + locId };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('softycare_active_location', JSON.stringify(foundLoc));
      window.dispatchEvent(new CustomEvent('softycare_location_changed', { detail: foundLoc }));
    }
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('softycare_token');
      const aashoraApiUrl = process.env.NEXT_PUBLIC_AASHORA_API_URL || 'http://localhost:58781/api/Aashora';
      if (token && !token.startsWith('session_active_')) {
        try {
          await fetch(`${aashoraApiUrl}/Logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (e) {
          console.error('[LOGOUT API ERROR]:', e);
        }
      }

      localStorage.removeItem('softycare_user');
      localStorage.removeItem('softycare_token');
      localStorage.removeItem('softycare_active_location');
      localStorage.removeItem('softycare_locations');
    }
    router.push('/login');
  };

  const displayName = userInfo?.empname || userInfo?.empName || userInfo?.drname || userInfo?.drName || userInfo?.doctorname || userInfo?.doctorName || userInfo?.fullname || userInfo?.username || currentUser?.doctorName || 'MR. DEMO CONSULTANT';
  const displayRole = userInfo?.proftype || userInfo?.designation || currentUser?.role || 'CONSULTANT';

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Left: Mobile Hamburger Toggle & Active Multi-Location Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {mounted && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              value={selectedLocationId}
              onChange={handleLocationChange}
              className="bg-transparent text-emerald-900 dark:text-emerald-200 font-bold focus:outline-none cursor-pointer pr-1 border-none"
              title="Select Active Clinic Branch / Location"
            >
              {locations.map((loc, idx) => (
                <option
                  key={loc.locationid || idx}
                  value={loc.locationid || (idx + 1)}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
                >
                  {loc.locationname || loc.locationName || `LOCATION #${loc.locationid || (idx + 1)}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Theme Toggle + Notifications + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <ThemeToggle />

        <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 relative shrink-0">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500" />
        </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 font-semibold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left hidden md:block">
              {mounted ? (
                <>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
                    {displayName.toUpperCase()}
                  </p>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                    {displayRole}
                  </span>
                </>
              ) : (
                <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
              )}
            </div>
          </div>
      </div>
    </header>
  );
}
