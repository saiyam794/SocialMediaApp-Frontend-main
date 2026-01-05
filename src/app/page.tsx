'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFeeds } from '@/hooks/useFeed';
import { FeedCard } from '@/components/FeedCard';
import CreateFeed from '@/components/CreateFeed';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  LogOut,
  MessageSquare,
  Users,
  Home,
  Video,
  Search,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [page, setPage] = useState(1);
  const [shouldReset, setShouldReset] = useState(false);
  const { data, isLoading, hasNextPage } = useInfiniteFeeds(page, shouldReset);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth');
  }, [user, authLoading, router]);

  const handleFeedDeleted = () => {
    setPage(1);
    setShouldReset(true);
    setTimeout(() => setShouldReset(false), 100);
  };

  if (authLoading || !user) return <FullPageLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100">
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold">
              IG
            </div>
            <span className="font-extrabold tracking-wide">
              Instagram
            </span>
          </div>

          <div className="hidden md:flex items-center bg-white/20 px-4 py-2 rounded-full w-96">
            <Search size={18} className="text-white/80 mr-2" />
            <input
              placeholder="Search vibes..."
              className="bg-transparent outline-none text-sm w-full placeholder-white/70 text-white"
            />
          </div>
          <div className="flex items-center gap-1">
            <NavIcon icon={<Home size={20} />} color="pink" active />
            <NavIcon icon={<Users size={20} />} color="purple" />
            <NavIcon icon={<Video size={20} />} color="indigo" />

            <div className="flex items-center gap-2 ml-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  className="w-9 h-9 rounded-full ring-2 ring-white"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
              )}
              <button
                onClick={logout}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto grid grid-cols-12 gap-6 px-4 py-6">
        <aside className="hidden lg:block col-span-3 space-y-4">
          <SidebarItem
            icon={<Home />}
            label="Home"
            gradient="from-pink-500 to-rose-500"
            active
          />
          <SidebarItem
            icon={<Users />}
            label="Friends"
            gradient="from-purple-500 to-fuchsia-500"
          />
          <SidebarItem
            icon={<MessageSquare />}
            label="Messages"
            gradient="from-indigo-500 to-blue-500"
          />
        </aside>

        <section className="col-span-12 lg:col-span-6 space-y-5">
          <div className="top-[80px] z-10">
            <CreateFeed />
          </div>

          {isLoading && page === 1 ? (
            <Loader />
          ) : data?.length ? (
            <InfiniteScroll
              dataLength={data.length}
              next={() => setPage((p) => p + 1)}
              hasMore={hasNextPage}
              loader={<Loader small />}
            >
              <div className="space-y-5">
                {data.map((feed) => (
                  <div
                    key={feed.id}
                    className="bg-white/80 backdrop-blur rounded-3xl shadow-xl hover:shadow-2xl transition"
                  >
                    <FeedCard feed={feed} onDelete={handleFeedDeleted} />
                  </div>
                ))}
              </div>
            </InfiniteScroll>
          ) : (
            <EmptyState />
          )}
        </section>
      </main>
    </div>
  );
}

function NavIcon({ icon, active, color }: any) {
  const colors: any = {
    pink: 'hover:bg-pink-400/30',
    purple: 'hover:bg-purple-400/30',
    indigo: 'hover:bg-indigo-400/30',
  };

  return (
    <button
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition
        ${active ? 'bg-white/30' : colors[color]}
      `}
    >
      {icon}
    </button>
  );
}

function SidebarItem({ icon, label, gradient, active }: any) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer text-white transition
        bg-gradient-to-r ${gradient}
        ${active ? 'shadow-xl scale-[1.02]' : 'opacity-90 hover:opacity-100'}
      `}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </div>
  );
}

function Loader({ small }: { small?: boolean }) {
  return (
    <div className="flex justify-center py-10">
      <div
        className={`animate-spin rounded-full border-4 border-white border-t-transparent
          ${small ? 'w-7 h-7' : 'w-10 h-10'}
        `}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl p-12 text-center">
      <p className="font-semibold text-purple-600">
        No posts yet 🌈 Start sharing!
      </p>
    </div>
  );
}

function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400">
      <Loader />
    </div>
  );
}

/* ================= HOOK ================= */

function useInfiniteFeeds(page: number, shouldReset: boolean = false) {
  const { data: feedsData, isLoading } = useFeeds(page, 10);
  const [allFeeds, setAllFeeds] = useState<any[]>([]);

  useEffect(() => {
    if (feedsData?.data?.length) {
      setAllFeeds((prev) => {
        // Reset when fetching page 1 or when shouldReset is true (e.g., after deletion)
        if (page === 1 || shouldReset) {
          return feedsData.data;
        }
        // For subsequent pages, append new unique feeds
        const fresh = feedsData.data.filter(
          (f: any) => !prev.find((p) => p.id === f.id)
        );
        return [...prev, ...fresh];
      });
    } else if (page === 1 && feedsData && !feedsData.data.length) {
      // When page 1 returns empty after a delete, reset allFeeds
      setAllFeeds([]);
    }
  }, [feedsData, page, shouldReset]);

  return {
    data: allFeeds,
    isLoading,
    hasNextPage: feedsData?.meta?.hasMore || false,
  };
}
