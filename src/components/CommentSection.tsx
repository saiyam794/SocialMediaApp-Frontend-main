'use client';

import React, { useState } from 'react';
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/useComments';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

const CommentSection: React.FC<{ feedId: string }> = ({ feedId }) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const { data: commentsData, isLoading } = useComments(feedId);
  const { mutate: createComment, isPending: isCreating } = useCreateComment();
  const { mutate: deleteComment } = useDeleteComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      createComment({ feedId, content: newComment }, {
        onSuccess: () => setNewComment(''),
      });
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/40">
  {user && (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 mb-5"
    >
      {user.avatar ? (
        <Image
          src={user.avatar}
          alt={user.name}
          width={36}
          height={36}
          className="rounded-full ring-2 ring-pink-400"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
          {user.name[0]}
        </div>
      )}

      <input
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Write something nice 💬"
        className="flex-1 bg-white/70 backdrop-blur px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
      />

      <button
        disabled={isCreating || !newComment.trim()}
        className="px-4 py-2 text-sm font-semibold rounded-full
        bg-gradient-to-r from-pink-500 to-purple-500 text-white
        hover:opacity-90 disabled:opacity-40 transition"
      >
        Post
      </button>
    </form>
  )}

  {/* Comments */}
  <div className="space-y-4">
    {commentsData?.data.map((comment) => (
      <div key={comment.id} className="flex gap-3">
        <Image
          src={comment.user.avatar || '/avatar.png'}
          alt=""
          width={34}
          height={34}
          className="rounded-full ring-2 ring-indigo-300"
        />

        <div>
          <div className="bg-white/80 backdrop-blur rounded-2xl px-4 py-2 shadow">
            <p className="font-semibold text-sm text-indigo-600">
              {comment.user.name}
            </p>
            <p className="text-sm text-gray-700">
              {comment.content}
            </p>
          </div>

          <div className="flex gap-4 text-xs text-gray-500 mt-1 ml-3">
            <button className="hover:text-pink-500">Like</button>
            <button className="hover:text-purple-500">Reply</button>
            {user?.id === comment.userId && (
              <button
                onClick={() => deleteComment(comment.id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>


  );
};

export default CommentSection;