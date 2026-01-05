'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Feed } from '@/types';
import CommentSection from './CommentSection';
import { useReportFeed } from '@/hooks/useReport';
import { useDeleteFeed } from '@/hooks/useFeed';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import {
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  Share2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const FeedCard: React.FC<{ feed: Feed; onDelete?: () => void }> = ({ feed, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { mutate: reportFeed } = useReportFeed();
  const { mutate: deleteFeed, isPending: isDeleting } = useDeleteFeed();

  const isOwnFeed = feed.userId === user?.id;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    // Optimistically remove from local cache for instant feedback
    queryClient.setQueryData(['feeds', 1, 10], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.filter((f: any) => f.id !== feed.id),
        meta: {
          ...old.meta,
          total: old.meta.total - 1,
        },
      };
    });

    deleteFeed(feed.id, {
      onSuccess: () => {
        // Also invalidate to ensure backend sync
        queryClient.invalidateQueries({
          queryKey: ['feeds'],
          exact: false,
        });
        // Trigger parent component refresh
        onDelete?.();
      },
      onError: () => {
        // Revert cache if delete failed
        queryClient.invalidateQueries({
          queryKey: ['feeds', 1, 10],
        });
        alert('Failed to delete post');
      },
    });
  };

  const onReportClick = (reason: string) => {
    if (!user) {
      alert('You must be logged in to report a post.');
      return;
    }

    reportFeed(
      { feedId: feed.id, reason },
      {
        onSuccess: (data) => {
          alert(data?.message || 'Feed reported successfully');
          setShowMenu(false);
        },
        onError: () => {
          alert('Something went wrong while reporting');
        },
      }
    );
  };

  const renderImages = () => {
    if (!feed.images || feed.images.length === 0) return null;

    return (
      <div className="grid grid-cols-2 gap-1 -mx-4 sm:mx-0 my-3">
        {feed.images.map((img, idx) => (
          <div key={idx} className="w-full aspect-square relative bg-slate-100">
            <img
              src={img}
              alt={`Feed image ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl p-5 relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {feed.user.avatar ? (
            <Image
              src={feed.user.avatar}
              width={44}
              height={44}
              className="rounded-full ring-2 ring-pink-400"
              alt=""
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center font-bold">
              {feed.user.name[0]}
            </div>
          )}

          <div>
            <p className="font-semibold text-indigo-600">
              {feed.user.name}
            </p>
            <p className="text-xs text-gray-500">
              @{feed.user.username} ·{' '}
              {new Date(feed.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <MoreHorizontal />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg z-20 overflow-hidden">
              {isOwnFeed ? (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                </button>
              ) : (
                <button
                  onClick={() => onReportClick('Inappropriate content')}
                  className="flex items-center gap-2 w-full px-4 py-2 text-yellow-600 hover:bg-yellow-50"
                >
                  <AlertTriangle size={16} />
                  Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-800 mb-3 whitespace-pre-wrap">
        {feed.content}
      </p>

      {renderImages()}

      <div className="flex justify-between text-sm text-gray-500 py-2">
        <span>💖 {Math.floor(Math.random() * 1000)}</span>
        <span>💬 {feed._count?.comments || 0}</span>
      </div>

      <hr />

      <div className="flex justify-around pt-2 font-semibold">
        <button className="flex gap-2 items-center px-4 py-2 rounded-xl hover:bg-pink-100 text-pink-600">
          <ThumbsUp /> Like
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex gap-2 items-center px-4 py-2 rounded-xl hover:bg-purple-100 text-purple-600"
        >
          <MessageCircle /> Comment
        </button>

        <button className="flex gap-2 items-center px-4 py-2 rounded-xl hover:bg-indigo-100 text-indigo-600">
          <Share2 /> Share
        </button>
      </div>

      {showComments && <CommentSection feedId={feed.id} />}
    </div>
  );
};
